"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const openid_1 = __importDefault(require("supertokens-node/recipe/openid"));
const normalisedURLDomain_1 = __importDefault(
  require("supertokens-node/lib/build/normalisedURLDomain")
);
const normalisedURLPath_1 = __importDefault(
  require("supertokens-node/lib/build/normalisedURLPath")
);
function default_1(pluginConfig) {
  return {
    getAuthBaseUrl: function (appInfo) {
      return (
        new normalisedURLDomain_1.default(
          appInfo.apiDomain
        ).getAsStringDangerous() +
        (appInfo.apiBasePath !== undefined
          ? new normalisedURLPath_1.default(
              appInfo.apiBasePath
            ).getAsStringDangerous()
          : "")
      );
    },
    getRegistrationEndpoint: function (appInfo) {
      const baseUrl = this.getAuthBaseUrl(appInfo);
      return `${baseUrl}/oauth/register`;
    },
    getApiDomain: function (appInfo) {
      return new normalisedURLDomain_1.default(
        appInfo.apiDomain
      ).getAsStringDangerous();
    },
    wellKnownOAuthAuthorizationServer: async function (appInfo) {
      const oauthConfig = await openid_1.default.getOpenIdDiscoveryConfiguration();
      const registrationEndpoint = this.getRegistrationEndpoint(appInfo);
      return {
        ...oauthConfig,
        response_types_supported: ["code", "id_token", "id_token token"],
        code_challenge_methods_supported: ["S256"],
        registration_endpoint: registrationEndpoint,
        registration_endpoint_auth_signing_alg_values_supported: ["RS256"],
      };
    },
    wellKnownOAuthProtectedResource: async function (appInfo) {
      const apiDomain = this.getApiDomain(appInfo);
      const baseUrl = this.getAuthBaseUrl(appInfo);
      const scopes = pluginConfig?.oauth?.supportedScopes ?? [
        "openid",
        "email",
        "offline_access",
      ];
      return {
        resource: `${apiDomain}`,
        authorization_servers: [`${baseUrl}`],
        bearer_methods_supported: ["header"],
        scopes_supported: scopes,
      };
    },
    registerOAuthClient: async function (_appInfo, supertokensInfo, client) {
      console.log("registerOAuthClient:client", client);
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
      const data = await response.json();
      console.log("registerOAuthClient:response", data);
      return {
        client_id: data.clientId,
        client_secret: data.clientSecret,
        scope: data.scope,
        redirect_uris: data.redirectUris,
      };
    },
  };
}
exports.default = default_1;
