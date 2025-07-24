"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./server"));
const admin_tools_1 = require("./admin-tools");
const logger_1 = require("./common/logger");
class SuperTokensAdminMcpServer extends server_1.default {
    constructor(serverInfo, options) {
        super({
            ...serverInfo,
            name: "supertokens-mcp-admin",
            version: "1.0.0",
            title: "SuperTokens Admin MCP",
        }, options);
        this.registerAdminTools();
    }
    registerAdminTools() {
        for (const tool of admin_tools_1.Tools) {
            (0, logger_1.logDebugMessage)(`Loading tool - ${tool.name}`);
            this.registerTool(tool.name, {
                description: tool.description,
                inputSchema: tool.input.shape,
                annotations: tool.annotations,
            }, async (args) => {
                return (0, admin_tools_1.callTool)(tool, args);
            });
        }
    }
}
exports.default = SuperTokensAdminMcpServer;
