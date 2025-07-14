import { PluginRouteHandler, SuperTokensPlugin } from "supertokens-node/types";
import NormalisedURLPath from "supertokens-node/lib/build/normalisedURLPath";

import OverrideableBuilder from "supertokens-js-override";

import { PLUGIN_ID, PLUGIN_VERSION, setToolContext } from "./common/config";
import { enableDebugLogs } from "./common/logger";
import { MCPPluginConfig } from "./types";
import pluginInterfaceImpl from "./pluginInterfaceImpl";

export default function (pluginConfig?: MCPPluginConfig): SuperTokensPlugin {
  let pluginInterface = pluginInterfaceImpl(pluginConfig);

  if (pluginConfig?.override) {
    const builder = new OverrideableBuilder(pluginInterface);
    pluginInterface = builder.override(pluginConfig.override).build();
  }

  return {
    id: PLUGIN_ID,
    version: PLUGIN_VERSION,
    compatibleSDKVersions: ["23.0.0"],
    overrideMap: {
      oauth2provider: {
        recipeInitRequired: true,
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
          apiBasePath: config.appInfo.apiBasePath || "/auth",
          websiteBasePath: config.appInfo.websiteBasePath || "/auth",
          apiGatewayPath: config.appInfo.apiGatewayPath,
        },
        supertokens: {
          connectionURI: config.supertokens.connectionURI,
          apiKey: config.supertokens.apiKey,
        },
      });
    },
    routeHandlers: (config) => {
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
            config.appInfo,
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
            config.appInfo,
            userContext
          );
          res.sendJSONResponse(resp);
          return null;
        },
      });

      routeHandlers.push({
        path: new NormalisedURLPath(
          `${pluginInterface.getRegistrationEndpoint(
            config.appInfo,
            {} as any
          )}`
        ).getAsStringDangerous(),
        method: "post",
        verifySessionOptions: { sessionRequired: false },
        handler: async (req, res, _session, userContext) => {
          const response = await pluginInterface.registerOAuthClient(
            config.appInfo,
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

      routeHandlers.push({
        path: new NormalisedURLPath(
          `${pluginInterface.getClientsEndpoint(config.appInfo, {} as any)}`
        ).getAsStringDangerous(),
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
        path: new NormalisedURLPath(
          `${pluginInterface.getClientsEndpoint(config.appInfo, {} as any)}`
        ).getAsStringDangerous(),
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
        path: new NormalisedURLPath(
          `${pluginInterface.getClientsEndpoint(config.appInfo, {} as any)}`
        ).getAsStringDangerous(),
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
