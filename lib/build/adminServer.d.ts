import { ServerOptions } from "@modelcontextprotocol/sdk/server/index.js";
import SuperTokensMcpServer from "./server";
import { UserContext } from "supertokens-node/lib/build/types";
import { SessionClaimValidator } from "supertokens-node/lib/build/recipe/session";
export type ServerInfo = {
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
export default class SuperTokensAdminMcpServer extends SuperTokensMcpServer {
  constructor(serverInfo: ServerInfo, options?: ServerOptions);
  private registerAdminTools;
}
