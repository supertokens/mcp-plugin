import OpenID from "supertokens-node/recipe/openid";
import OAuth2Provider from "supertokens-node/recipe/oauth2provider";

import { MCPPluginConfig, MCPPluginInterface } from "./types";
import { AppInfo, UserContext } from "supertokens-node/types";
import NormalisedURLDomain from "supertokens-node/lib/build/normalisedURLDomain";
import NormalisedURLPath from "supertokens-node/lib/build/normalisedURLPath";
import crypto from "crypto";

export default function (pluginConfig?: MCPPluginConfig): MCPPluginInterface {
  return {
    getApiDomain: function (appInfo: AppInfo) {
      return new NormalisedURLDomain(appInfo.apiDomain).getAsStringDangerous();
    },

    getAuthBaseUrl: function (
      this: MCPPluginInterface,
      appInfo: AppInfo,
      _userContext: UserContext
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
      appInfo: AppInfo,
      userContext: UserContext
    ) {
      const baseUrl = this.getAuthBaseUrl(appInfo, userContext);
      return `${baseUrl}/oauth/register`;
    },

    getClientsEndpoint: function (
      this: MCPPluginInterface,
      appInfo: AppInfo,
      userContext: UserContext
    ) {
      const baseUrl = this.getAuthBaseUrl(appInfo, userContext);
      return `${baseUrl}/oauth/clients`;
    },

    getRegistrationAccessTokenForClient: async function (
      clientId: string,
      _userContext: UserContext
    ) {
      const salt =
        pluginConfig?.oauth?.registrationAccessTokenSalt ?? "default-salt";
      const hash = crypto
        .createHash("sha256")
        .update(salt + clientId)
        .digest("hex");
      return hash;
    },

    validateRegistrationAccessToken: async function (
      clientId: string,
      accessToken: string,
      _userContext: UserContext
    ) {
      const salt =
        pluginConfig?.oauth?.registrationAccessTokenSalt ?? "default-salt";
      const hash = crypto
        .createHash("sha256")
        .update(salt + clientId)
        .digest("hex");
      return hash === accessToken;
    },

    wellKnownOAuthAuthorizationServer: async function (
      this: MCPPluginInterface,
      appInfo: AppInfo,
      userContext: UserContext
    ) {
      const oauthConfig = await OpenID.getOpenIdDiscoveryConfiguration();
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

    wellKnownOAuthProtectedResource: async function (
      this: MCPPluginInterface,
      appInfo: AppInfo,
      userContext: UserContext
    ) {
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

    registerOAuthClient: async function (
      this: MCPPluginInterface,
      appInfo: AppInfo,
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
