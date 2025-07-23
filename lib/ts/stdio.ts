import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { PLUGIN_ID, PLUGIN_VERSION, setToolContext } from "./common/config";
import { Tools, callTool } from "./admin-tools";
import { enableDebugLogs, logDebugMessage } from "./common/logger";
import supertokens from "supertokens-node";
import Multitenancy from "supertokens-node/recipe/multitenancy";
import Session from "supertokens-node/recipe/session";
import UserRoles from "supertokens-node/recipe/userroles";
import UserMetadata from "supertokens-node/recipe/usermetadata";
import EmailPassword from "supertokens-node/recipe/emailpassword";
import Passwordless from "supertokens-node/recipe/passwordless";
import { ToolContext } from "./common/types";
import { getMessageFromError } from "./common/error";

export function initSuperTokens(context: ToolContext) {
  supertokens.init({
    supertokens: {
      connectionURI: context.supertokens.connectionURI,
      apiKey: context.supertokens.apiKey,
    },
    appInfo: {
      appName: context.appInfo.appName,
      apiDomain: context.appInfo.apiDomain,
      websiteDomain: context.appInfo.websiteDomain,
      apiBasePath: context.appInfo.apiBasePath,
      websiteBasePath: context.appInfo.websiteBasePath,
      apiGatewayPath: context.appInfo.apiGatewayPath,
    },
    recipeList: [
      Session.init(),
      Multitenancy.init(),
      UserRoles.init(),
      EmailPassword.init(),
      Passwordless.init({
        contactMethod: "EMAIL_OR_PHONE",
        flowType: "USER_INPUT_CODE",
      }),
      UserMetadata.init(),
    ],
  });
}

async function initMCPServer() {
  enableDebugLogs("stdio");
  const context = setToolContext();
  const server = new McpServer({
    name: PLUGIN_ID,
    version: PLUGIN_VERSION,
  });
  initSuperTokens(context);

  for (const tool of Tools) {
    logDebugMessage(`Loading tool - ${tool.name}`);
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.input.shape,
        annotations: tool.annotations,
      },
      async (args: any) => {
        return callTool(tool, args);
      }
    );
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  logDebugMessage(`server is running on stdio`);
}

export function runStdioAdminMCPServer() {
  initMCPServer().catch((err) => {
    logDebugMessage(`Server error: ${getMessageFromError(err)}`);
    process.exit(1);
  });
}
