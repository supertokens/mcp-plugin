import SuperTokensMcpServerCls from "./server";
import SuperTokensAdminMcpServerCls from "./adminServer";
import createPlugin from "./plugin";
import type { MCPPluginInterface, MCPPluginConfig } from "./types";

export default class Wrapper {
  static init = createPlugin;

  static SuperTokensMcpServer = SuperTokensMcpServerCls;
  static SuperTokensAdminMcpServer = SuperTokensAdminMcpServerCls;
}

export let init = Wrapper.init;
export let SuperTokensMcpServer = Wrapper.SuperTokensMcpServer;
export let SuperTokensAdminMcpServer = Wrapper.SuperTokensAdminMcpServer;
export type { MCPPluginInterface, MCPPluginConfig };
