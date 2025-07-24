import { ServerOptions } from "@modelcontextprotocol/sdk/server/index.js";
import SuperTokensMcpServer from "./server";
import { Tools, callTool } from "./admin-tools";
import { logDebugMessage } from "./common/logger";
import { UserContext } from "supertokens-node/lib/build/types";
import { SessionClaimValidator } from "supertokens-node/lib/build/recipe/session";

export type ServerInfo = {
  path: string;
  validateTokenPayload?: (
    accessTokenPayload: any,
    userContext: UserContext
  ) => Promise<{ status: "OK" } | { status: "ERROR"; message: string }>;
  claimValidators?: SessionClaimValidator[];
};

export default class SuperTokensAdminMcpServer extends SuperTokensMcpServer {
  constructor(serverInfo: ServerInfo, options?: ServerOptions) {
    super(
      {
        ...serverInfo,
        name: "supertokens-mcp-admin",
        version: "1.0.0",
        title: "SuperTokens Admin MCP",
      },
      options
    );
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
