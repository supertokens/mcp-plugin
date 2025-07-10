import { ServerOptions } from "@modelcontextprotocol/sdk/server/index.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Implementation } from "@modelcontextprotocol/sdk/types";
import { SessionClaimValidator } from "supertokens-node/recipe/session";
import { PluginRouteHandler, UserContext } from "supertokens-node/types";
export type ServerInfo = Implementation & {
  path: string;
  validateTokenPayload?: (
    accessTokenPayload: any,
    userContext: UserContext
  ) => Promise<
    | {
        status: "OK";
      }
    | {
        status: "ERROR";
        message: string;
      }
  >;
  claimValidators?: SessionClaimValidator[];
};
type handlerType = PluginRouteHandler["handler"];
export default class SuperTokensMcpServer extends McpServer {
  private path;
  private validateTokenPayload?;
  private claimValidators?;
  private transports;
  constructor(serverInfo: ServerInfo, options?: ServerOptions);
  verifySession(next: handlerType): handlerType;
  getHandlers(): PluginRouteHandler[];
  private getOrDeleteRequestHandler;
  private postRequestHandler;
  getGETHandler(): PluginRouteHandler;
  getDELETEHandler(): PluginRouteHandler;
  getPOSTHandler(): PluginRouteHandler;
}
export {};
