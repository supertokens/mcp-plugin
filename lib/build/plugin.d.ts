import { SuperTokensPlugin } from "supertokens-node/types";
import SuperTokensMcpServer from "./server";
export type MCPPluginConfig = {
  mcpServers: SuperTokensMcpServer[];
};
export default function (_pluginConfig: MCPPluginConfig): SuperTokensPlugin;
