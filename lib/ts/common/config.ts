import { ToolContextSchema } from "./schemas";
import { ToolContext } from "./types";

export const PLUGIN_VERSION = "0.1.0";
export const PLUGIN_ID = "supertokens-mcp-plugin";

let ToolContextValue: ToolContext | undefined = undefined;

export const getToolContext = () => {
  if (!ToolContextValue) {
    throw new Error("Admin server config not set");
  }
  return ToolContextValue;
};

export const setToolContext = (config?: ToolContext) => {
  const envConfig = {
    appInfo: {
      appName: process.env.APP_NAME as string,
      apiDomain: process.env.API_DOMAIN as string,
      websiteDomain: process.env.WEBSITE_DOMAIN as string,
      apiBasePath: process.env.API_BASE_PATH as string,
      websiteBasePath: process.env.WEBSITE_BASE_PATH as string,
    },
    supertokens: {
      connectionURI: process.env.CONNECTION_URI as string,
      apiKey: process.env.API_KEY as string,
    },
  };

  const parsedConfig = ToolContextSchema.safeParse(config || envConfig);
  if (!parsedConfig.success) {
    throw new Error(`Invalid config: ${parsedConfig.error}`);
  }

  ToolContextValue = parsedConfig.data;
  return ToolContextValue;
};
