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
const crypto_1 = __importDefault(require("crypto"));
const normalisedURLPath_1 = __importDefault(
  require("supertokens-node/lib/build/normalisedURLPath")
);
function default_1(appInfo, pluginConfig) {
  const apiDomain = new normalisedURLDomain_1.default(
    appInfo.apiDomain
  ).getAsStringDangerous();
  const registrationPath = new normalisedURLPath_1.default(
    pluginConfig?.oauth?.registrationEndpointPath ?? "/oauth/register"
  ).getAsStringDangerous();
  const registrationEndpoint = `${apiDomain}${registrationPath}`;
  const clientsPath = new normalisedURLPath_1.default(
    pluginConfig?.oauth?.clientsEndpointPath ?? "/oauth/clients"
  ).getAsStringDangerous();
  const clientsEndpoint = `${apiDomain}${clientsPath}`;
  return {
    getRegistrationAccessTokenForClient: async function (
      clientId,
      clientSecret,
      _userContext
    ) {
      const secret =
        pluginConfig?.oauth?.registrationAccessTokenSecret ?? "default-secret";
      const hash = crypto_1.default
        .createHash("sha256")
        .update(`${clientId}:${clientSecret}:${secret}`)
        .digest("hex");
      return hash;
    },
    validateRegistrationAccessToken: async function (
      clientId,
      clientSecret,
      accessToken,
      _userContext
    ) {
      const secret =
        pluginConfig?.oauth?.registrationAccessTokenSecret ?? "default-secret";
      const hash = crypto_1.default
        .createHash("sha256")
        .update(`${clientId}:${clientSecret}:${secret}`)
        .digest("hex");
      return hash === accessToken;
    },
    wellKnownOAuthAuthorizationServer: async function (_userContext) {
      const oauthConfig = await openid_1.default.getOpenIdDiscoveryConfiguration();
      return {
        ...oauthConfig,
        response_types_supported: ["code", "id_token", "id_token token"],
        code_challenge_methods_supported: ["S256"],
        registration_endpoint: registrationEndpoint,
        registration_endpoint_auth_signing_alg_values_supported: ["RS256"],
      };
    },
    wellKnownOAuthProtectedResource: async function (_userContext) {
      const scopes = ["openid", "email", "offline_access"];
      return {
        resource: `${apiDomain}`,
        authorization_servers: [
          `${apiDomain}${new normalisedURLPath_1.default(
            appInfo.apiBasePath ?? "/auth"
          ).getAsStringDangerous()}`,
        ],
        bearer_methods_supported: ["header"],
        scopes_supported: scopes,
      };
    },
    registerOAuthClient: async function (client, userContext) {
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
          response.client.clientSecret,
          userContext
        );
        const registrationClientUri = `${clientsEndpoint}?client_id=${response.client.clientId}`;
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
