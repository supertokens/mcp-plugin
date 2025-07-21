import OpenID from "supertokens-node/recipe/openid";
import OAuth2Provider from "supertokens-node/recipe/oauth2provider";

import { MCPPluginConfig, MCPPluginInterface } from "./types";
import { AppInfo, UserContext } from "supertokens-node/types";
import NormalisedURLDomain from "supertokens-node/lib/build/normalisedURLDomain";
import crypto from "crypto";
import NormalisedURLPath from "supertokens-node/lib/build/normalisedURLPath";

export default function (
  appInfo: AppInfo,
  pluginConfig?: MCPPluginConfig
): MCPPluginInterface {
  const apiDomain = new NormalisedURLDomain(
    appInfo.apiDomain
  ).getAsStringDangerous();
  const registrationPath = new NormalisedURLPath(
    pluginConfig?.oauth?.registrationEndpointPath ?? "/oauth/register"
  ).getAsStringDangerous();
  const registrationEndpoint = `${apiDomain}${registrationPath}`;
  const clientsPath = new NormalisedURLPath(
    pluginConfig?.oauth?.clientsEndpointPath ?? "/oauth/clients"
  ).getAsStringDangerous();
  const clientsEndpoint = `${apiDomain}${clientsPath}`;

  return {
    getRegistrationAccessTokenForClient: async function (
      this: MCPPluginInterface,
      clientId: string,
      clientSecret: string | undefined,
      _userContext: UserContext
    ) {
      const secret =
        pluginConfig?.oauth?.registrationAccessTokenSecret ?? "default-secret";
      const hash = crypto
        .createHash("sha256")
        .update(`${clientId}:${clientSecret}:${secret}`)
        .digest("hex");
      return hash;
    },

    validateRegistrationAccessToken: async function (
      clientId: string,
      clientSecret: string | undefined,
      accessToken: string,
      _userContext: UserContext
    ) {
      const secret =
        pluginConfig?.oauth?.registrationAccessTokenSecret ?? "default-secret";
      const hash = crypto
        .createHash("sha256")
        .update(`${clientId}:${clientSecret}:${secret}`)
        .digest("hex");
      return hash === accessToken;
    },

    wellKnownOAuthAuthorizationServer: async function (
      this: MCPPluginInterface,
      _userContext: UserContext
    ) {
      const oauthConfig = await OpenID.getOpenIdDiscoveryConfiguration();
      return {
        ...oauthConfig,
        scopes_supported: ["openid", "email", "offline_access"],
        response_types_supported: ["code", "id_token", "id_token token"],
        code_challenge_methods_supported: ["S256"],
        registration_endpoint: registrationEndpoint,
        registration_endpoint_auth_signing_alg_values_supported: ["RS256"],
      };
    },

    wellKnownOAuthProtectedResource: async function (
      this: MCPPluginInterface,
      _userContext: UserContext
    ) {
      const scopes = ["openid", "email", "offline_access"];

      return {
        resource: `${apiDomain}`,
        authorization_servers: [
          `${apiDomain}${new NormalisedURLPath(
            appInfo.apiBasePath ?? "/auth"
          ).getAsStringDangerous()}`,
        ],
        bearer_methods_supported: ["header"],
        scopes_supported: scopes,
      };
    },

    registerOAuthClient: async function (
      this: MCPPluginInterface,
      client: Record<string, any>,
      userContext: UserContext
    ) {
      const grantTypes: string[] | undefined =
        client.grant_types || client.grantTypes;
      if (grantTypes && grantTypes.includes("client_credentials")) {
        // we do not want to support creation of M2M clients so that the user
        // is not billed for the usage.
        return {
          status: "ERROR",
          error: "client_credentials grant type is not supported",
          errorDescription: "client_credentials grant type is not supported",
        };
      }

      let response = await OAuth2Provider.createOAuth2Client(
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

    getOAuthClient: async function (
      this: MCPPluginInterface,
      clientId: string,
      userContext: UserContext
    ) {
      const response = await OAuth2Provider.getOAuth2Client(
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

    updateOAuthClient: async function (
      this: MCPPluginInterface,
      clientId: string,
      clientUpdate: Record<string, any>,
      userContext: UserContext
    ) {
      const grantTypes: string[] | undefined =
        clientUpdate.grant_types || clientUpdate.grantTypes;
      if (grantTypes && grantTypes.includes("client_credentials")) {
        // we do not want to support updating to M2M clients so that the user
        // is not billed for the usage.
        return {
          status: "ERROR",
          error: "client_credentials grant type is not supported",
          errorDescription: "client_credentials grant type is not supported",
        };
      }

      const response = await OAuth2Provider.updateOAuth2Client(
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

    deleteOAuth2Client: async function (
      this: MCPPluginInterface,
      clientId: string,
      userContext: UserContext
    ) {
      return await OAuth2Provider.deleteOAuth2Client({ clientId }, userContext);
    },
  };
}
