"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const openid_1 = __importDefault(require("supertokens-node/recipe/openid"));
const oauth2provider_1 = __importDefault(
  require("supertokens-node/recipe/oauth2provider")
);
const normalisedURLDomain_1 = __importDefault(
  require("supertokens-node/lib/build/normalisedURLDomain")
);
const normalisedURLPath_1 = __importDefault(
  require("supertokens-node/lib/build/normalisedURLPath")
);
const crypto_1 = __importDefault(require("crypto"));
function default_1(pluginConfig) {
  return {
    getApiDomain: function (appInfo) {
      return new normalisedURLDomain_1.default(
        appInfo.apiDomain
      ).getAsStringDangerous();
    },
    getAuthBaseUrl: function (appInfo, _userContext) {
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
    getRegistrationEndpoint: function (appInfo, userContext) {
      const baseUrl = this.getAuthBaseUrl(appInfo, userContext);
      return `${baseUrl}/oauth/register`;
    },
    getClientsEndpoint: function (appInfo, userContext) {
      const baseUrl = this.getAuthBaseUrl(appInfo, userContext);
      return `${baseUrl}/oauth/clients`;
    },
    getRegistrationAccessTokenForClient: async function (
      clientId,
      _userContext
    ) {
      const salt =
        pluginConfig?.oauth?.registrationAccessTokenSalt ?? "default-salt";
      const hash = crypto_1.default
        .createHash("sha256")
        .update(salt + clientId)
        .digest("hex");
      return hash;
    },
    validateRegistrationAccessToken: async function (
      clientId,
      accessToken,
      _userContext
    ) {
      const salt =
        pluginConfig?.oauth?.registrationAccessTokenSalt ?? "default-salt";
      const hash = crypto_1.default
        .createHash("sha256")
        .update(salt + clientId)
        .digest("hex");
      return hash === accessToken;
    },
    wellKnownOAuthAuthorizationServer: async function (appInfo, userContext) {
      const oauthConfig = await openid_1.default.getOpenIdDiscoveryConfiguration();
      const registrationEndpoint = this.getRegistrationEndpoint(
        appInfo,
        userContext
      );
      return {
        ...oauthConfig,
        response_types_supported: ["code", "id_token", "id_token token"],
        code_challenge_methods_supported: ["S256"],
        registration_endpoint: registrationEndpoint,
        registration_endpoint_auth_signing_alg_values_supported: ["RS256"],
      };
    },
    wellKnownOAuthProtectedResource: async function (appInfo, userContext) {
      const apiDomain = this.getApiDomain(appInfo, userContext);
      const baseUrl = this.getAuthBaseUrl(appInfo, userContext);
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
    registerOAuthClient: async function (appInfo, client, userContext) {
      const grantTypes = client.grant_types || client.grantTypes;
      if (grantTypes && grantTypes.includes("client_credentials")) {
        // we do not want to support creation of M2M clients so that the user
        // is not billed for the usage.
        return {
          status: "ERROR",
          error: "client_credentials grant type is not supported",
          errorDescription: "client_credentials grant type is not supported",
        };
      }
      let response = await oauth2provider_1.default.createOAuth2Client(
        client,
        userContext
      );
      if (response.status === "OK") {
        const registrationAccessToken = await this.getRegistrationAccessTokenForClient(
          response.client.clientId,
          userContext
        );
        const registrationClientUri = `${this.getAuthBaseUrl(
          appInfo,
          userContext
        )}/oauth/clients?client_id=${response.client.clientId}`;
        return {
          status: "OK",
          client_id: response.client.clientId,
          client_secret: response.client.clientSecret,
          scope: response.client.scope,
          redirect_uris: response.client.redirectUris,
          registration_access_token: registrationAccessToken,
          registration_client_uri: registrationClientUri,
        };
      }
      return response;
    },
    getOAuthClient: async function (clientId, userContext) {
      const response = await oauth2provider_1.default.getOAuth2Client(
        clientId,
        userContext
      );
      if (response.status === "OK") {
        return {
          status: "OK",
          client_id: response.client.clientId,
          client_secret: response.client.clientSecret,
          scope: response.client.scope,
          redirect_uris: response.client.redirectUris,
        };
      }
      return response;
    },
    updateOAuthClient: async function (clientId, clientUpdate, userContext) {
      const grantTypes = clientUpdate.grant_types || clientUpdate.grantTypes;
      if (grantTypes && grantTypes.includes("client_credentials")) {
        // we do not want to support updating to M2M clients so that the user
        // is not billed for the usage.
        return {
          status: "ERROR",
          error: "client_credentials grant type is not supported",
          errorDescription: "client_credentials grant type is not supported",
        };
      }
      const response = await oauth2provider_1.default.updateOAuth2Client(
        { clientId, ...clientUpdate },
        userContext
      );
      if (response.status === "OK") {
        const data = response.client;
        return {
          status: "OK",
          client_id: data.clientId,
          client_secret: data.clientSecret,
          scope: data.scope,
          redirect_uris: data.redirectUris,
        };
      }
      return response;
    },
    deleteOAuth2Client: async function (clientId, userContext) {
      return await oauth2provider_1.default.deleteOAuth2Client(
        { clientId },
        userContext
      );
    },
  };
}
exports.default = default_1;
