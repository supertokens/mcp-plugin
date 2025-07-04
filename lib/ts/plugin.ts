import { PluginRouteHandler, SuperTokensPlugin } from "supertokens-node/types";
import SuperTokensMcpServer from "./server";
import NormalisedURLDomain from "supertokens-node/lib/build/normalisedURLDomain";
import NormalisedURLPath from "supertokens-node/lib/build/normalisedURLPath";

import OpenID from "supertokens-node/recipe/openid";

export type MCPPluginConfig = {
  mcpServers: SuperTokensMcpServer[];
};

const createHandlersForMcp: (
  server: SuperTokensMcpServer
) => PluginRouteHandler[] = (_server) => {
  return [];
};

export default function (pluginConfig?: MCPPluginConfig): SuperTokensPlugin {
  return {
    id: "st-mcp",
    version: "1.0.0",
    compatibleSDKVersions: [],
    overrideMap: {
      oauth2provider: {
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
            const response = await fetch(config.supertokens!.connectionURI, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization:
                  config.supertokens?.apiKey !== undefined
                    ? `Bearer ${config.supertokens!.apiKey}`
                    : undefined,
              },
              body: JSON.stringify(await req.getBodyAsJSONOrFormData()),
            });

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
