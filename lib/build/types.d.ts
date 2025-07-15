import { AppInfo, UserContext } from "supertokens-node/types";
import SuperTokensMcpServer from "./server";
import OverrideableBuilder from "supertokens-js-override";
export type MCPPluginInterface = {
  getApiDomain(appInfo: AppInfo, userContext: UserContext): string;
  getAuthBaseUrl(appInfo: AppInfo, userContext: UserContext): string;
  getRegistrationEndpoint(appInfo: AppInfo, userContext: UserContext): string;
  getClientsEndpoint(appInfo: AppInfo, userContext: UserContext): string;
  getRegistrationAccessTokenForClient(
    clientId: string,
    userContext: UserContext
  ): Promise<string>;
  validateRegistrationAccessToken(
    clientId: string,
    accessToken: string,
    userContext: UserContext
  ): Promise<boolean>;
  wellKnownOAuthAuthorizationServer(
    appInfo: AppInfo,
    userContext: UserContext
  ): Promise<Record<string, any>>;
  wellKnownOAuthProtectedResource(
    appInfo: AppInfo,
    userContext: UserContext
  ): Promise<Record<string, any>>;
  registerOAuthClient(
    appInfo: AppInfo,
    client: Record<string, any>,
    userContext: UserContext
  ): Promise<
    | ({
        status: "OK";
        client_id: string;
        client_secret?: string;
        scope: string;
        redirect_uris: string[] | null;
        registration_access_token: string;
        registration_client_uri: string;
      } & Record<string, any>)
    | {
        status: "ERROR";
        error: string;
        errorDescription: string;
      }
  >;
  getOAuthClient(
    clientId: string,
    userContext: UserContext
  ): Promise<
    | ({
        status: "OK";
        client_id: string;
        client_secret?: string;
        scope: string;
        redirect_uris: string[] | null;
      } & Record<string, any>)
    | {
        status: "ERROR";
        error: string;
        errorDescription: string;
      }
  >;
  updateOAuthClient(
    clientId: string,
    clientUpdate: Record<string, any>,
    userContext: UserContext
  ): Promise<
    | ({
        status: "OK";
        client_id: string;
        client_secret?: string;
        scope: string;
        redirect_uris: string[] | null;
      } & Record<string, any>)
    | {
        status: "ERROR";
        error: string;
        errorDescription: string;
      }
  >;
  deleteOAuth2Client(
    clientId: string,
    userContext: UserContext
  ): Promise<
    | {
        status: "OK";
      }
    | {
        status: "ERROR";
        error: string;
        errorDescription: string;
      }
  >;
};
export type MCPPluginConfig = {
  mcpServers: SuperTokensMcpServer[];
  oauth?: {
    supportedScopes?: string[];
    registrationAccessTokenSalt?: string;
  };
  override?: (
    originalImplementation: MCPPluginInterface,
    builder?: OverrideableBuilder<MCPPluginInterface>
  ) => MCPPluginInterface;
};
