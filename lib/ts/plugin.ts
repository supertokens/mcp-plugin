import { SuperTokensPlugin } from "supertokens-node/types";
import SuperTokensMcpServer from "./server";

export type MCPPluginConfig = {
  mcpServers: SuperTokensMcpServer[];
};

export default function (_pluginConfig: MCPPluginConfig): SuperTokensPlugin {
  return {
    id: "st-mcp",
    version: "1.0.0",
    compatibleSDKVersions: [],
    overrideMap: {
      oauth2provider: {
        recipeInitRequired: true,
      },
    },

    routeHandlers: () => {
      return {
        status: "OK",
        routeHandlers: [],
      };
    },
  };
}
