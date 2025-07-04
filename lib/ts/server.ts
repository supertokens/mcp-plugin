import { ServerOptions } from "@modelcontextprotocol/sdk/server/index.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Implementation } from "@modelcontextprotocol/sdk/types";
import { UserContext } from "supertokens-node/lib/build/types";

export type ServerInfo = Implementation & {
  path: string;
  validateToken: (
    accessTokenPayload: any,
    userContext: UserContext
  ) => Promise<{ status: "OK" } | { status: "ERROR"; message: string }>;
};

export default class SuperTokensMcpServer extends McpServer {
  path: string;
  validateToken: (
    accessTokenPayload: any,
    userContext: UserContext
  ) => Promise<{ status: "OK" } | { status: "ERROR"; message: string }>;

  constructor(serverInfo: ServerInfo, options?: ServerOptions) {
    super(serverInfo, options);

    this.path = serverInfo.path;
    this.validateToken = serverInfo.validateToken;
  }
}
