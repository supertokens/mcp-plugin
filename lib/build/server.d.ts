import { ServerOptions } from "@modelcontextprotocol/sdk/server/index.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Implementation } from "@modelcontextprotocol/sdk/types";
import { SessionClaimValidator } from "supertokens-node/lib/build/recipe/session";
import { UserContext } from "supertokens-node/lib/build/types";
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
export default class SuperTokensMcpServer extends McpServer {
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
  constructor(serverInfo: ServerInfo, options?: ServerOptions);
}
