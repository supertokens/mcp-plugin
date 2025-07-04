import { PluginRouteHandler, SuperTokensPlugin } from "supertokens-node/types";
import SuperTokensMcpServer from "./server";
import NormalisedURLDomain from "supertokens-node/lib/build/normalisedURLDomain";
import NormalisedURLPath from "supertokens-node/lib/build/normalisedURLPath";
import OpenID from "supertokens-node/recipe/openid";
import OAuth2Provider from "supertokens-node/recipe/oauth2provider";

import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { randomUUID } from "node:crypto";
import { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types";

export type MCPPluginConfig = {
  mcpServers: SuperTokensMcpServer[];
};

type handlerType = PluginRouteHandler["handler"];

const verifySessionForMCP = (next: handlerType): handlerType => {
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

    const { payload } = await OAuth2Provider.validateOAuth2AccessToken(jwt);

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
};

const createHandlersForMcp: (
  server: SuperTokensMcpServer
) => PluginRouteHandler[] = (server) => {
  const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

  const getAndDeleteHandler: handlerType = async (req, res) => {
    const sessionId = req.getHeaderValue("mcp-session-id");
    if (!sessionId || !transports[sessionId]) {
      res.setStatusCode(400);
      res.sendJSONResponse({
        status: "ERROR",
        message: "Invalid or missing session ID",
      });
      return null;
    }

    const transport = transports[sessionId];
    await transport.handleRequest(req.original, res.original);
    return null;
  };

  const handlers: PluginRouteHandler[] = [];
  handlers.push({
    path: server.path,
    method: "get",
    verifySessionOptions: { sessionRequired: false },
    handler: verifySessionForMCP(getAndDeleteHandler),
  });

  handlers.push({
    path: server.path,
    method: "delete",
    verifySessionOptions: { sessionRequired: false },
    handler: verifySessionForMCP(getAndDeleteHandler),
  });

  handlers.push({
    path: server.path,
    method: "post",
    verifySessionOptions: { sessionRequired: false },
    handler: verifySessionForMCP(async (req, res) => {
      const sessionId = req.getHeaderValue("mcp-session-id");

      let transport: StreamableHTTPServerTransport;

      if (sessionId && transports[sessionId]) {
        transport = transports[sessionId];
      } else if (!sessionId && isInitializeRequest(await req.getJSONBody())) {
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (sessionId) => {
            transports[sessionId] = transport;
          },
        });

        // Clean up transport when closed
        transport.onclose = () => {
          if (transport.sessionId) {
            delete transports[transport.sessionId];
          }
        };

        await server.connect(transport);
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
    }),
  });

  return handlers;
};

export default function (pluginConfig?: MCPPluginConfig): SuperTokensPlugin {
  return {
    id: "st-mcp",
    version: "1.0.0",
    compatibleSDKVersions: ["23.0.0"],
    overrideMap: {
      oauth2provider: {
        recipeInitRequired: true,
      },
      openid: {
        recipeInitRequired: true,
      },
    },

    routeHandlers: (config) => {
      const routeHandlers: PluginRouteHandler[] = [];

      if (pluginConfig?.mcpServers) {
        for (const server of pluginConfig.mcpServers) {
          for (const handler of createHandlersForMcp(server)) {
            routeHandlers.push(handler);
          }
        }
      }

      const apiDomain = new NormalisedURLDomain(
        config.appInfo.apiDomain
      ).getAsStringDangerous();

      const baseUrl =
        new NormalisedURLDomain(
          config.appInfo.apiDomain
        ).getAsStringDangerous() +
        (config.appInfo.apiBasePath !== undefined
          ? new NormalisedURLPath(
              config.appInfo.apiBasePath
            ).getAsStringDangerous()
          : "");
      const registrationEndpoint = `${baseUrl}/oauth/register`;

      // handlers to support MCP auth
      routeHandlers.push({
        method: "get",
        path: "/.well-known/oauth-authorization-server",
        verifySessionOptions: {
          sessionRequired: false,
        },
        handler: async (_req, res) => {
          const oauthConfig = await OpenID.getOpenIdDiscoveryConfiguration();
          await res.sendJSONResponse({
            ...oauthConfig,
            response_types_supported: ["code", "id_token", "id_token token"],
            code_challenge_methods_supported: ["S256"],
            registration_endpoint: registrationEndpoint,
            registration_endpoint_auth_signing_alg_values_supported: ["RS256"],
          });

          return null;
        },
      });

      routeHandlers.push({
        path: "/.well-known/oauth-protected-resource",
        method: "get",
        verifySessionOptions: { sessionRequired: false },
        handler: async (_req, res) => {
          res.sendJSONResponse({
            resource: `${apiDomain}`,
            authorization_servers: [`${baseUrl}`],
            bearer_methods_supported: ["header"],
            scopes_supported: ["openid", "email"], // make this configurable
          });
          return null;
        },
      });

      routeHandlers.push({
        path: new NormalisedURLPath(
          `${baseUrl}/oauth/register`
        ).getAsStringDangerous(),
        method: "post",
        verifySessionOptions: { sessionRequired: false },
        handler: async (req, res) => {
          try {
            const response = await fetch(
              `${config.supertokens!.connectionURI}/recipe/oauth/clients`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization:
                    config.supertokens?.apiKey !== undefined
                      ? `Bearer ${config.supertokens!.apiKey}`
                      : undefined,
                },
                body: JSON.stringify(await req.getBodyAsJSONOrFormData()),
              }
            );

            const data: any = await response.json();
            res.setStatusCode(response.status);
            res.sendJSONResponse({
              client_id: data.clientId,
              client_secret: data.clientSecret,
              scope: data.scope,
              redirect_uris: data.redirectUris,
            });
          } catch (err) {
            res.setStatusCode(500);
            res.sendJSONResponse({
              error: "Failed to register OAuth client",
              details: err instanceof Error ? err.message : err,
            });
          }
          return null;
        },
      });

      return {
        status: "OK",
        routeHandlers,
      };
    },
  };
}
