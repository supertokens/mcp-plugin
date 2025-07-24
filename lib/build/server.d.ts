import { ServerOptions } from "@modelcontextprotocol/sdk/server/index.js";
import { McpServer, RegisteredTool, ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Implementation, ToolAnnotations } from "@modelcontextprotocol/sdk/types";
import { SessionClaimValidator } from "supertokens-node/recipe/session";
import { PluginRouteHandler, UserContext } from "supertokens-node/types";
import { ZodRawShape } from "zod";
export type ServerInfo = Implementation & {
    path: string;
    validateTokenPayload?: (accessTokenPayload: any, userContext: UserContext) => Promise<{
        status: "OK";
    } | {
        status: "ERROR";
        message: string;
    }>;
    claimValidators?: SessionClaimValidator[];
};
type handlerType = PluginRouteHandler["handler"];
export default class SuperTokensMcpServer extends McpServer {
    private path;
    private validateTokenPayload?;
    private claimValidators?;
    private transports;
    private apiHandlers;
    constructor(serverInfo: ServerInfo, options?: ServerOptions);
    getClaims(): import("supertokens-node/lib/build/recipe/session/types").SessionClaim<any>[];
    verifySession(next: handlerType): handlerType;
    getHandlers(): PluginRouteHandler[];
    private getOrDeleteRequestHandler;
    private postRequestHandler;
    getGETHandler(): PluginRouteHandler;
    getDELETEHandler(): PluginRouteHandler;
    getPOSTHandler(): PluginRouteHandler;
    registerToolWithAPI<InputArgs extends ZodRawShape, OutputArgs extends ZodRawShape>(name: string, path: string, config: {
        title?: string;
        description?: string;
        inputSchema?: InputArgs;
        outputSchema?: OutputArgs;
        annotations?: ToolAnnotations;
    }, cb: ToolCallback<InputArgs>): RegisteredTool;
}
export {};
