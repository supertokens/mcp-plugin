import { UserContext } from "supertokens-node/types";
import SuperTokensMcpServer from "./server";
import OverrideableBuilder from "supertokens-js-override";
export type MCPPluginInterface = {
  getRegistrationAccessTokenForClient(
    clientId: string,
    clientSecret: string | undefined,
    userContext: UserContext
  ): Promise<string>;
  validateRegistrationAccessToken(
    clientId: string,
    clientSecret: string | undefined,
    accessToken: string,
    userContext: UserContext
  ): Promise<boolean>;
  wellKnownOAuthAuthorizationServer(
    userContext: UserContext
  ): Promise<Record<string, any>>;
  wellKnownOAuthProtectedResource(
    userContext: UserContext
  ): Promise<Record<string, any>>;
  registerOAuthClient(
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
    registrationEndpointPath?: string;
    clientsEndpointPath?: string;
    registrationAccessTokenSecret?: string;
  };
  override?: (
    originalImplementation: MCPPluginInterface,
    builder?: OverrideableBuilder<MCPPluginInterface>
  ) => MCPPluginInterface;
};
