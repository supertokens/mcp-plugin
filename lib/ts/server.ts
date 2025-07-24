import { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types";
import { ServerOptions } from "@modelcontextprotocol/sdk/server/index.js";
import {
  McpServer,
  RegisteredTool,
  ToolCallback,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  Implementation,
  ToolAnnotations,
} from "@modelcontextprotocol/sdk/types";

import OAuth2Provider from "supertokens-node/recipe/oauth2provider";
import { SessionClaimValidator } from "supertokens-node/recipe/session";
import {
  JSONObject,
  PluginRouteHandler,
  UserContext,
} from "supertokens-node/types";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  BaseRequest,
  BaseResponse,
} from "supertokens-node/lib/build/framework";

import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { randomUUID } from "node:crypto";
import { ZodRawShape } from "zod";

export type ServerInfo = Implementation & {
  path: string;
  validateTokenPayload?: (
    accessTokenPayload: any,
    userContext: UserContext
  ) => Promise<{ status: "OK" } | { status: "ERROR"; message: string }>;
  claimValidators?: SessionClaimValidator[];
};

type handlerType = PluginRouteHandler["handler"];

export default class SuperTokensMcpServer extends McpServer {
  private path: string;
  private validateTokenPayload?: (
    accessTokenPayload: any,
    userContext: UserContext
  ) => Promise<{ status: "OK" } | { status: "ERROR"; message: string }>;
  private claimValidators?: SessionClaimValidator[];
  private transports: {
    [sessionId: string]: StreamableHTTPServerTransport;
  } = {};
  private apiHandlers: PluginRouteHandler[] = [];

  constructor(serverInfo: ServerInfo, options?: ServerOptions) {
    super(serverInfo, options);

    this.path = serverInfo.path;
    this.validateTokenPayload = serverInfo.validateTokenPayload;
    this.claimValidators = serverInfo.claimValidators;
  }

  getClaims() {
    const claims = [];
    for (const validator of this.claimValidators ?? []) {
      if ("claim" in validator) {
        claims.push(validator.claim);
      }
    }
    return claims;
  }

  verifySession(next: handlerType): handlerType {
    return async (req, res, session, userContext) => {
      let jwt: string | undefined = undefined;
      if (req.getHeaderValue("authorization")) {
        jwt = req.getHeaderValue("authorization")?.split("Bearer ")[1];
      }
      if (jwt === undefined) {
        res.setStatusCode(401);
        res.sendJSONResponse({ error: "No JWT found in the request" });
        return null;
      }

      let payload: JSONObject = {};

      try {
        payload = (await OAuth2Provider.validateOAuth2AccessToken(jwt)).payload;
      } catch (err) {
        if ("code" in (err as any) && (err as any).code === "ERR_JWT_EXPIRED") {
          res.setStatusCode(401);
          res.sendJSONResponse({ error: "Token expired" });
          return null;
        }
        throw err;
      }

      if (this.validateTokenPayload !== undefined) {
        const result = await this.validateTokenPayload(payload, userContext);
        if (result.status === "ERROR") {
          res.setStatusCode(403);
          res.sendJSONResponse({ error: result.message });
          return null;
        }
      }

      if (this.claimValidators !== undefined) {
        for (const validator of this.claimValidators) {
          const result = await validator.validate(payload, userContext);
          if (!result.isValid) {
            res.setStatusCode(403);
            res.sendJSONResponse({ error: result.reason });
            return null;
          }
        }
      }

      const authInfo: AuthInfo = {
        token: jwt,
        scopes: payload.scp as string[],
        clientId: payload.client_id as string,
        extra: payload,
        expiresAt: payload.exp as number,
      };

      req.original.auth = authInfo;

      return await next(req, res, session, userContext);
    };
  }

  getHandlers(): PluginRouteHandler[] {
    return [
      this.getPOSTHandler(),
      this.getGETHandler(),
      this.getDELETEHandler(),
      ...this.apiHandlers,
    ];
  }

  private async getOrDeleteRequestHandler(req: BaseRequest, res: BaseResponse) {
    const sessionId = req.getHeaderValue("mcp-session-id");
    if (!sessionId || !this.transports[sessionId]) {
      res.setStatusCode(400);
      res.sendJSONResponse({
        status: "ERROR",
        message: "Invalid or missing session ID",
      });
      return null;
    }

    const transport = this.transports[sessionId];
    await transport.handleRequest(req.original, res.original);
    return null;
  }

  private async postRequestHandler(req: BaseRequest, res: BaseResponse) {
    const sessionId = req.getHeaderValue("mcp-session-id");

    let transport: StreamableHTTPServerTransport;

    if (sessionId && this.transports[sessionId]) {
      transport = this.transports[sessionId];
    } else if (!sessionId && isInitializeRequest(await req.getJSONBody())) {
      const server = this;
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sessionId) => {
          server.transports[sessionId] = transport;
        },
      });

      // Clean up transport when closed
      transport.onclose = () => {
        if (transport.sessionId) {
          delete server.transports[transport.sessionId];
        }
      };

      await this.connect(transport);
    } else {
      res.setStatusCode(400);
      res.sendJSONResponse({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Bad Request: No valid session ID provided",
        },
        id: null,
      });
      return null;
    }

    await transport.handleRequest(
      req.original,
      res.original,
      await req.getJSONBody()
    );

    return null;
  }

  getGETHandler(): PluginRouteHandler {
    return {
      path: this.path,
      method: "get",
      verifySessionOptions: { sessionRequired: false },
      handler: this.verifySession((req, res) =>
        this.getOrDeleteRequestHandler(req, res)
      ),
    };
  }

  getDELETEHandler(): PluginRouteHandler {
    return {
      path: this.path,
      method: "delete",
      verifySessionOptions: { sessionRequired: false },
      handler: this.verifySession((req, res) =>
        this.getOrDeleteRequestHandler(req, res)
      ),
    };
  }

  getPOSTHandler(): PluginRouteHandler {
    return {
      path: this.path,
      method: "post",
      verifySessionOptions: { sessionRequired: false },
      handler: this.verifySession((req, res) =>
        this.postRequestHandler(req, res)
      ),
    };
  }

  registerToolWithAPI<
    InputArgs extends ZodRawShape,
    OutputArgs extends ZodRawShape
  >(
    name: string,
    path: string,
    config: {
      title?: string;
      description?: string;
      inputSchema?: InputArgs;
      outputSchema?: OutputArgs;
      annotations?: ToolAnnotations;
    },
    cb: ToolCallback<InputArgs>
  ): RegisteredTool {
    let result = super.registerTool(name, config, cb);

    this.apiHandlers.push({
      path: path,
      method: "post",
      verifySessionOptions: {
        sessionRequired: true,
        overrideGlobalClaimValidators: () => this.claimValidators ?? [],
      },
      handler: async (req, res, session, userContext) => {
        const body = await req.getJSONBody();

        if (this.validateTokenPayload !== undefined) {
          if (session === undefined) {
            res.setStatusCode(401);
            res.sendJSONResponse({ error: "No session found" });
            return null;
          }

          const validationResult = await this.validateTokenPayload(
            session.getAccessTokenPayload(),
            userContext
          );
          if (validationResult.status === "ERROR") {
            res.setStatusCode(403);
            res.sendJSONResponse({ error: validationResult.message });
            return null;
          }
        }

        const result = await cb(body, {
          requestId: "api-request",
          sendNotification: async () => {},
          sendRequest: (async () => {}) as any,
          signal: {} as any,
          authInfo: session
            ? {
                clientId: "na",
                token: session.getAccessToken(),
                scopes: [],
                extra: session.getAccessTokenPayload(),
                expiresAt: session.getAccessTokenPayload().exp,
              }
            : undefined,
        });

        res.setStatusCode(200);
        res.sendJSONResponse(result.structuredContent ?? result.content);
        return null;
      },
    });

    return result;
  }
}
