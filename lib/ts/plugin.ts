import Session from "supertokens-node/recipe/session";
import {
  PluginRouteHandler,
  SuperTokensPlugin,
  UserContext,
} from "supertokens-node/types";

import OverrideableBuilder from "supertokens-js-override";

import { PLUGIN_ID, PLUGIN_VERSION, setToolContext } from "./common/config";
import { enableDebugLogs } from "./common/logger";
import { MCPPluginConfig, MCPPluginInterface } from "./types";
import pluginInterfaceImpl from "./pluginInterfaceImpl";
import { SessionClaim } from "supertokens-node/lib/build/recipe/session/types";
import { BaseRequest } from "supertokens-node/lib/build/framework";

export default function (pluginConfig?: MCPPluginConfig): SuperTokensPlugin {
  let pluginInterface: MCPPluginInterface;

  const claims: SessionClaim<any>[] = [];
  for (const server of pluginConfig?.mcpServers ?? []) {
    for (const claim of server.getClaims()) {
      if (!claims.includes(claim)) {
        claims.push(claim);
      }
    }
  }

  return {
    id: PLUGIN_ID,
    version: PLUGIN_VERSION,
    compatibleSDKVersions: ["23.0.0", ">=23.0.0"],
    overrideMap: {
      oauth2provider: {
        recipeInitRequired: true,
        functions: (oI) => {
          return {
            ...oI,
            buildAccessTokenPayload: async (input) => {
              let payload = await oI.buildAccessTokenPayload(input);

              if (input.sessionHandle === undefined) {
                return payload;
              }

              const session = await Session.getSessionInformation(
                input.sessionHandle,
                input.userContext
              );
              if (session === undefined) {
                return payload;
              }

              const userId = session.userId;
              const recipeUserId = session.recipeUserId;
              const tenantId = session.tenantId;

              for (const claim of claims) {
                const claimValue = await claim.fetchValue(
                  userId,
                  recipeUserId,
                  tenantId,
                  payload,
                  input.userContext
                );
                payload = claim.addToPayload_internal(
                  payload,
                  claimValue,
                  input.userContext
                );
              }

              return payload;
            },
          };
        },
      },
      openid: {
        recipeInitRequired: true,
      },
      userroles: {
        recipeInitRequired: true,
      },
      usermetadata: {},
      multitenancy: {},
    },
    init: (config) => {
      pluginInterface = pluginInterfaceImpl(config.appInfo, pluginConfig);
      if (pluginConfig?.override) {
        const builder = new OverrideableBuilder(pluginInterface);
        pluginInterface = builder.override(pluginConfig.override).build();
      }

      if (config.debug) {
        enableDebugLogs();
      }

      if (!config.supertokens) {
        throw new Error("SuperTokens configuration is required");
      }

      setToolContext({
        appInfo: {
          appName: config.appInfo.appName,
          apiDomain: config.appInfo.apiDomain,
          websiteDomain: config.appInfo.websiteDomain,
          apiBasePath: config.appInfo.apiBasePath ?? "/auth",
          websiteBasePath: config.appInfo.websiteBasePath ?? "/auth",
          apiGatewayPath: config.appInfo.apiGatewayPath,
        },
        supertokens: {
          connectionURI: config.supertokens.connectionURI,
          apiKey: config.supertokens.apiKey,
        },
      });
    },
    routeHandlers: () => {
      const routeHandlers: PluginRouteHandler[] = [];

      if (pluginConfig?.mcpServers) {
        for (const server of pluginConfig.mcpServers) {
          for (const handler of server.getHandlers()) {
            routeHandlers.push(handler);
          }
        }
      }

      // handlers to support MCP auth
      routeHandlers.push({
        method: "get",
        path: "/.well-known/oauth-authorization-server",
        verifySessionOptions: {
          sessionRequired: false,
        },
        handler: async (_req, res, _session, userContext) => {
          let resp = await pluginInterface.wellKnownOAuthAuthorizationServer(
            userContext
          );
          await res.sendJSONResponse(resp);
          return null;
        },
      });

      routeHandlers.push({
        path: "/.well-known/oauth-protected-resource",
        method: "get",
        verifySessionOptions: { sessionRequired: false },
        handler: async (_req, res, _session, userContext) => {
          let resp = await pluginInterface.wellKnownOAuthProtectedResource(
            userContext
          );
          res.sendJSONResponse(resp);
          return null;
        },
      });

      routeHandlers.push({
        path:
          pluginConfig?.oauth?.registrationEndpointPath ?? "/oauth/register",
        method: "post",
        verifySessionOptions: { sessionRequired: false },
        handler: async (req, res, _session, userContext) => {
          const response = await pluginInterface.registerOAuthClient(
            await req.getBodyAsJSONOrFormData(),
            userContext
          );
          if (response.status === "OK") {
            res.setStatusCode(201);
            res.sendJSONResponse(response);
          } else {
            res.setStatusCode(400);
            res.sendJSONResponse(response);
          }
          return null;
        },
      });

      const validateRegistrationAccessToken = async (
        req: BaseRequest,
        clientId: string,
        clientSecret: string | undefined,
        userContext: UserContext
      ) => {
        const accessToken = req
          .getHeaderValue("Authorization")
          ?.replace("Bearer ", "");
        if (accessToken === undefined) {
          return false;
        }
        return await pluginInterface.validateRegistrationAccessToken(
          clientId,
          clientSecret,
          accessToken,
          userContext
        );
      };

      routeHandlers.push({
        path: pluginConfig?.oauth?.clientsEndpointPath ?? "/oauth/clients",
        method: "get",
        verifySessionOptions: { sessionRequired: false },
        handler: async (req, res, _session, userContext) => {
          const clientId = req.getKeyValueFromQuery("client_id");
          if (clientId === undefined) {
            res.setStatusCode(400);
            res.sendJSONResponse({
              status: "ERROR",
              error: "client_id is required",
              errorDescription: "client_id is required",
            });
            return null;
          }
          const response = await pluginInterface.getOAuthClient(
            clientId,
            userContext
          );

          if (response.status === "OK") {
            if (
              !(await validateRegistrationAccessToken(
                req,
                clientId,
                response.client_secret,
                userContext
              ))
            ) {
              res.setStatusCode(401);
              res.sendJSONResponse({
                status: "ERROR",
                error: "unauthorized",
                errorDescription: "Either access token is invalid or missing",
              });
              return null;
            }

            res.setStatusCode(200);
            res.sendJSONResponse(response);
          } else {
            res.setStatusCode(400);
            res.sendJSONResponse(response);
          }
          return null;
        },
      });

      routeHandlers.push({
        path: pluginConfig?.oauth?.clientsEndpointPath ?? "/oauth/clients",
        method: "put",
        verifySessionOptions: { sessionRequired: false },
        handler: async (req, res, _session, userContext) => {
          const clientId = req.getKeyValueFromQuery("client_id");
          if (clientId === undefined) {
            res.setStatusCode(400);
            res.sendJSONResponse({
              status: "ERROR",
              error: "client_id is required",
              errorDescription: "client_id is required",
            });
            return null;
          }

          const clientResponse = await pluginInterface.getOAuthClient(
            clientId,
            userContext
          );

          if (clientResponse.status === "OK") {
            if (
              !(await validateRegistrationAccessToken(
                req,
                clientId,
                clientResponse.client_secret,
                userContext
              ))
            ) {
              res.setStatusCode(401);
              res.sendJSONResponse({
                status: "ERROR",
                error: "unauthorized",
                errorDescription: "Either access token is invalid or missing",
              });
              return null;
            }
          } else {
            res.setStatusCode(400);
            res.sendJSONResponse(clientResponse);
            return null;
          }

          const response = await pluginInterface.updateOAuthClient(
            clientId,
            await req.getBodyAsJSONOrFormData(),
            userContext
          );
          if (response.status === "OK") {
            res.setStatusCode(200);
            res.sendJSONResponse(response);
          } else {
            res.setStatusCode(400);
            res.sendJSONResponse(response);
          }
          return null;
        },
      });

      routeHandlers.push({
        path: pluginConfig?.oauth?.clientsEndpointPath ?? "/oauth/clients",
        method: "delete",
        verifySessionOptions: { sessionRequired: false },
        handler: async (req, res, _session, userContext) => {
          const clientId = req.getKeyValueFromQuery("client_id");
          if (clientId === undefined) {
            res.setStatusCode(400);
            res.sendJSONResponse({
              status: "ERROR",
              error: "client_id is required",
              errorDescription: "client_id is required",
            });
            return null;
          }

          const clientResponse = await pluginInterface.getOAuthClient(
            clientId,
            userContext
          );

          if (clientResponse.status === "OK") {
            if (
              !(await validateRegistrationAccessToken(
                req,
                clientId,
                clientResponse.client_secret,
                userContext
              ))
            ) {
              res.setStatusCode(401);
              res.sendJSONResponse({
                status: "ERROR",
                error: "unauthorized",
                errorDescription: "Either access token is invalid or missing",
              });
              return null;
            }
          } else {
            res.setStatusCode(400);
            res.sendJSONResponse(clientResponse);
            return null;
          }

          const response = await pluginInterface.deleteOAuth2Client(
            clientId,
            userContext
          );
          if (response.status === "OK") {
            res.setStatusCode(200);
            res.sendJSONResponse(response);
          } else {
            res.setStatusCode(400);
            res.sendJSONResponse(response);
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
