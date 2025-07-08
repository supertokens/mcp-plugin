import { ToolContextSchema } from "./schemas";
import { ToolContext } from "./types";

export const PLUGIN_VERSION = "0.1.0";
export const PLUGIN_ID = "supertokens-mcp-plugin";

export let ADMIN_MCP_TRANSPORT: "http" | "stdio" = "http";

let ToolContextValue: ToolContext | undefined = undefined;

export const getToolContext = () => {
  if (!ToolContextValue) {
    throw new Error("Admin server config not set");
  }
  return ToolContextValue;
};

export const setToolContext = (config: ToolContext) => {
  const parsedConfig = ToolContextSchema.safeParse(config);
  if (!parsedConfig.success) {
    throw new Error(`Invalid config: ${parsedConfig.error}`);
  }

  ToolContextValue = parsedConfig.data;
};
