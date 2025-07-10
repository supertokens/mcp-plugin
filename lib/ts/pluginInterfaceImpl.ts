import OpenID from "supertokens-node/recipe/openid";
import { MCPPluginConfig, MCPPluginInterface } from "./types";
import { AppInfo, SuperTokensInfo } from "supertokens-node/types";
import NormalisedURLDomain from "supertokens-node/lib/build/normalisedURLDomain";
import NormalisedURLPath from "supertokens-node/lib/build/normalisedURLPath";

export default function (pluginConfig?: MCPPluginConfig): MCPPluginInterface {
  return {
    getAuthBaseUrl: function (
      this: MCPPluginInterface,
      appInfo: AppInfo
    ): string {
      return (
        new NormalisedURLDomain(appInfo.apiDomain).getAsStringDangerous() +
        (appInfo.apiBasePath !== undefined
          ? new NormalisedURLPath(appInfo.apiBasePath).getAsStringDangerous()
          : "")
      );
    },

    getRegistrationEndpoint: function (
      this: MCPPluginInterface,
      appInfo: AppInfo
    ) {
      const baseUrl = this.getAuthBaseUrl(appInfo);
      return `${baseUrl}/oauth/register`;
    },

    getApiDomain: function (appInfo: AppInfo) {
      return new NormalisedURLDomain(appInfo.apiDomain).getAsStringDangerous();
    },

    wellKnownOAuthAuthorizationServer: async function (
      this: MCPPluginInterface,
      appInfo: AppInfo
    ) {
      const oauthConfig = await OpenID.getOpenIdDiscoveryConfiguration();
      const registrationEndpoint = this.getRegistrationEndpoint(appInfo);
      return {
        ...oauthConfig,
        response_types_supported: ["code", "id_token", "id_token token"],
        code_challenge_methods_supported: ["S256"],
        registration_endpoint: registrationEndpoint,
        registration_endpoint_auth_signing_alg_values_supported: ["RS256"],
      };
    },

    wellKnownOAuthProtectedResource: async function (
      this: MCPPluginInterface,
      appInfo: AppInfo
    ) {
      const apiDomain = this.getApiDomain(appInfo);
      const baseUrl = this.getAuthBaseUrl(appInfo);
      const scopes = pluginConfig?.oauth?.supportedScopes ?? [
        "openid",
        "email",
      ];

      return {
        resource: `${apiDomain}`,
        authorization_servers: [`${baseUrl}`],
        bearer_methods_supported: ["header"],
        scopes_supported: scopes,
      };
    },

    registerOAuthClient: async function (
      this: MCPPluginInterface,
      _appInfo: AppInfo,
      supertokensInfo: SuperTokensInfo,
      client: Record<string, any>
    ) {
      if (pluginConfig?.oauth?.cacheClients ?? true) {
        // TODO: find existing client that can handle this
      }
      const response = await fetch(
        `${supertokensInfo.connectionURI}/recipe/oauth/clients`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              supertokensInfo.apiKey !== undefined
                ? `Bearer ${supertokensInfo.apiKey}`
                : undefined,
          },
          body: JSON.stringify(client),
        }
      );

      const data: any = await response.json();
      return {
        client_id: data.clientId,
        client_secret: data.clientSecret,
        scope: data.scope,
        redirect_uris: data.redirectUris,
      };
    },
  };
}
