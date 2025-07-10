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
        handler: async (_req, res) => {
          let resp = await pluginInterface.wellKnownOAuthAuthorizationServer(
            config.appInfo
          );
          await res.sendJSONResponse(resp);
          return null;
        },
      });

      routeHandlers.push({
        path: "/.well-known/oauth-protected-resource",
        method: "get",
        verifySessionOptions: { sessionRequired: false },
        handler: async (_req, res) => {
          let resp = await pluginInterface.wellKnownOAuthProtectedResource(
            config.appInfo
          );
          res.sendJSONResponse(resp);
          return null;
        },
      });

      routeHandlers.push({
        path: new NormalisedURLPath(
          `${pluginInterface.getAuthBaseUrl(config.appInfo)}/oauth/register`
        ).getAsStringDangerous(),
        method: "post",
        verifySessionOptions: { sessionRequired: false },
        handler: async (req, res) => {
          try {
            const response = await pluginInterface.registerOAuthClient(
              config.appInfo,
              config.supertokens!,
              await req.getBodyAsJSONOrFormData()
            );
            res.setStatusCode(201);
            res.sendJSONResponse(response);
          } catch (err) {
            res.setStatusCode(500);
            res.sendJSONResponse({
              error: "Failed to register OAuth client",
              details: err instanceof Error ? err.message : `${err}`,
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
