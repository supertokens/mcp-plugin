import { AppInfo, SuperTokensInfo } from "supertokens-node/types";
import SuperTokensMcpServer from "./server";
import OverrideableBuilder from "supertokens-js-override";

export type MCPPluginInterface = {
  getAuthBaseUrl(appInfo: AppInfo): string;
  getRegistrationEndpoint(appInfo: AppInfo): string;
  getApiDomain(appInfo: AppInfo): string;

  wellKnownOAuthAuthorizationServer(
    appInfo: AppInfo
  ): Promise<Record<string, any>>;
  wellKnownOAuthProtectedResource(
    appInfo: AppInfo
  ): Promise<Record<string, any>>;
  registerOAuthClient(
    appInfo: AppInfo,
    supertokensInfo: SuperTokensInfo,
    client: Record<string, any>
  ): Promise<Record<string, any>>;
};

export type MCPPluginConfig = {
  mcpServers: SuperTokensMcpServer[];
  oauth?: {
    supportedScopes?: string[];
    cacheClients?: boolean;
  };
  override?: (
    originalImplementation: MCPPluginInterface,
    builder?: OverrideableBuilder<MCPPluginInterface>
  ) => MCPPluginInterface;
};
