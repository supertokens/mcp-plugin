import SuperTokensMcpServerCls from "./server";
import SuperTokensAdminMcpServerCls from "./adminServer";
import createPlugin from "./plugin";
import type { MCPPluginInterface, MCPPluginConfig } from "./types";
import { runStdioAdminMCPServer } from "./stdio";

export default class Wrapper {
  static init = createPlugin;

  static SuperTokensMcpServer = SuperTokensMcpServerCls;
  static SuperTokensAdminMcpServer = SuperTokensAdminMcpServerCls;
}

export let init = Wrapper.init;
export let SuperTokensMcpServer = Wrapper.SuperTokensMcpServer;
export let SuperTokensAdminMcpServer = Wrapper.SuperTokensAdminMcpServer;
export type { MCPPluginInterface, MCPPluginConfig };

// Run the admin server over stdio if the index file is being run directly
if (process.argv[2] === "--stdio") {
  runStdioAdminMCPServer();
}
