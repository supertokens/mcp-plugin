import { ServerOptions } from "@modelcontextprotocol/sdk/server/index.js";
import SuperTokensMcpServer, { ServerInfo } from "./server";
import { Tools, callTool } from "./admin-tools";
import { logDebugMessage } from "./common/logger";

export default class SuperTokensAdminMcpServer extends SuperTokensMcpServer {
  constructor(serverInfo: ServerInfo, options?: ServerOptions) {
    super(serverInfo, options);
    this.registerAdminTools();
  }

  private registerAdminTools() {
    for (const tool of Tools) {
      logDebugMessage(`Loading tool - ${tool.name}`);
      this.registerTool(
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
  }
}
