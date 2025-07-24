import SuperTokensMcpServerCls from "./server";
import SuperTokensAdminMcpServerCls from "./adminServer";
import createPlugin from "./plugin";
import type { MCPPluginInterface, MCPPluginConfig } from "./types";
export default class Wrapper {
    static init: typeof createPlugin;
    static SuperTokensMcpServer: typeof SuperTokensMcpServerCls;
    static SuperTokensAdminMcpServer: typeof SuperTokensAdminMcpServerCls;
}
export declare let init: typeof createPlugin;
export declare let SuperTokensMcpServer: typeof SuperTokensMcpServerCls;
export declare let SuperTokensAdminMcpServer: typeof SuperTokensAdminMcpServerCls;
export type { MCPPluginInterface, MCPPluginConfig };
