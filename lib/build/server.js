"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const oauth2provider_1 = __importDefault(require("supertokens-node/recipe/oauth2provider"));
const supertokens_node_1 = require("supertokens-node");
const streamableHttp_js_1 = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const node_crypto_1 = require("node:crypto");
class SuperTokensMcpServer extends mcp_js_1.McpServer {
    path;
    validateTokenPayload;
    claimValidators;
    transports = {};
    constructor(serverInfo, options) {
        super(serverInfo, options);
        this.path = serverInfo.path;
        this.validateTokenPayload = serverInfo.validateTokenPayload;
        this.claimValidators = serverInfo.claimValidators;
    }
    verifySession(next) {
        return async (req, res, session, userContext) => {
            let jwt = undefined;
            if (req.getHeaderValue("authorization")) {
                jwt = req.getHeaderValue("authorization")?.split("Bearer ")[1];
            }
            if (jwt === undefined) {
                res.setStatusCode(401);
                res.sendJSONResponse({ error: "No JWT found in the request" });
                return null;
            }
            let payload = {};
            try {
                payload = (await oauth2provider_1.default.validateOAuth2AccessToken(jwt)).payload;
            }
            catch (err) {
                if ("code" in err && err.code === "ERR_JWT_EXPIRED") {
                    res.setStatusCode(401);
                    res.sendJSONResponse({ error: "Token expired" });
                    return null;
                }
                throw err;
            }
            if (this.validateTokenPayload !== undefined) {
                const result = await this.validateTokenPayload(payload, userContext);
                if (result.status === "ERROR") {
                    res.setStatusCode(401);
                    res.sendJSONResponse({ error: result.message });
                    return null;
                }
            }
            if (this.claimValidators !== undefined) {
                for (const validator of this.claimValidators) {
                    if ("claim" in validator) {
                        const claim = validator.claim;
                        const claimValue = await claim.fetchValue(payload.sub, new supertokens_node_1.RecipeUserId(payload.rsub), payload.tId, payload, userContext);
                        payload = claim.addToPayload_internal(payload, claimValue, userContext);
                    }
                    const result = await validator.validate(payload, userContext);
                    if (!result.isValid) {
                        res.setStatusCode(401);
                        res.sendJSONResponse({ error: result.reason });
                        return null;
                    }
                }
            }
            const authInfo = {
                token: jwt,
                scopes: payload.scp,
                clientId: payload.client_id,
                extra: payload,
                expiresAt: payload.exp,
            };
            req.original.auth = authInfo;
            return await next(req, res, session, userContext);
        };
    }
    getHandlers() {
        return [
            this.getPOSTHandler(),
            this.getGETHandler(),
            this.getDELETEHandler(),
        ];
    }
    async getOrDeleteRequestHandler(req, res) {
        const sessionId = req.getHeaderValue("mcp-session-id");
        if (!sessionId || !this.transports[sessionId]) {
            res.setStatusCode(400);
            res.sendJSONResponse({
                status: "ERROR",
                message: "Invalid or missing session ID",
            });
            return null;
        }
        const transport = this.transports[sessionId];
        await transport.handleRequest(req.original, res.original);
        return null;
    }
    async postRequestHandler(req, res) {
        const sessionId = req.getHeaderValue("mcp-session-id");
        let transport;
        if (sessionId && this.transports[sessionId]) {
            transport = this.transports[sessionId];
        }
        else if (!sessionId && (0, types_js_1.isInitializeRequest)(await req.getJSONBody())) {
            const server = this;
            transport = new streamableHttp_js_1.StreamableHTTPServerTransport({
                sessionIdGenerator: () => (0, node_crypto_1.randomUUID)(),
                onsessioninitialized: (sessionId) => {
                    server.transports[sessionId] = transport;
                },
            });
            // Clean up transport when closed
            transport.onclose = () => {
                if (transport.sessionId) {
                    delete server.transports[transport.sessionId];
                }
            };
            await this.connect(transport);
        }
        else {
            res.setStatusCode(400);
            res.sendJSONResponse({
                jsonrpc: "2.0",
                error: {
                    code: -32000,
                    message: "Bad Request: No valid session ID provided",
                },
                id: null,
            });
            return null;
        }
        await transport.handleRequest(req.original, res.original, await req.getJSONBody());
        return null;
    }
    getGETHandler() {
        return {
            path: this.path,
            method: "get",
            verifySessionOptions: { sessionRequired: false },
            handler: this.verifySession((req, res) => this.getOrDeleteRequestHandler(req, res)),
        };
    }
    getDELETEHandler() {
        return {
            path: this.path,
            method: "delete",
            verifySessionOptions: { sessionRequired: false },
            handler: this.verifySession((req, res) => this.getOrDeleteRequestHandler(req, res)),
        };
    }
    getPOSTHandler() {
        return {
            path: this.path,
            method: "post",
            verifySessionOptions: { sessionRequired: false },
            handler: this.verifySession((req, res) => this.postRequestHandler(req, res)),
        };
    }
}
exports.default = SuperTokensMcpServer;
