import { ServerOptions } from "@modelcontextprotocol/sdk/server/index.js";
import SuperTokensMcpServer, { ServerInfo } from "./server";
export default class SuperTokensAdminMcpServer extends SuperTokensMcpServer {
  constructor(serverInfo: ServerInfo, options?: ServerOptions);
  private registerAdminTools;
}
