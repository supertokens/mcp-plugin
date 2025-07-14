"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSuperTokens = void 0;
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const config_1 = require("./common/config");
const admin_tools_1 = require("./admin-tools");
const logger_1 = require("./common/logger");
const supertokens_node_1 = __importDefault(require("supertokens-node"));
const multitenancy_1 = __importDefault(require("supertokens-node/recipe/multitenancy"));
const session_1 = __importDefault(require("supertokens-node/recipe/session"));
const userroles_1 = __importDefault(require("supertokens-node/recipe/userroles"));
const usermetadata_1 = __importDefault(require("supertokens-node/recipe/usermetadata"));
const emailpassword_1 = __importDefault(require("supertokens-node/recipe/emailpassword"));
const passwordless_1 = __importDefault(require("supertokens-node/recipe/passwordless"));
const error_1 = require("./common/error");
function initSuperTokens(context) {
    supertokens_node_1.default.init({
        supertokens: {
            connectionURI: context.supertokens.connectionURI,
            apiKey: context.supertokens.apiKey,
        },
        appInfo: {
            appName: context.appInfo.appName,
            apiDomain: context.appInfo.apiDomain,
            websiteDomain: context.appInfo.websiteDomain,
            apiBasePath: context.appInfo.apiBasePath,
            websiteBasePath: context.appInfo.websiteBasePath,
            apiGatewayPath: context.appInfo.apiGatewayPath,
        },
        recipeList: [
            session_1.default.init(),
            multitenancy_1.default.init(),
            userroles_1.default.init(),
            emailpassword_1.default.init(),
            passwordless_1.default.init({
                contactMethod: "EMAIL_OR_PHONE",
                flowType: "USER_INPUT_CODE",
            }),
            usermetadata_1.default.init(),
        ],
    });
}
exports.initSuperTokens = initSuperTokens;
async function initMCPServer() {
    (0, logger_1.enableDebugLogs)("stdio");
    const context = (0, config_1.setToolContext)();
    const server = new mcp_js_1.McpServer({
        name: config_1.PLUGIN_ID,
        version: config_1.PLUGIN_VERSION,
    });
    initSuperTokens(context);
    for (const tool of admin_tools_1.Tools) {
        (0, logger_1.logDebugMessage)(`Loading tool - ${tool.name}`);
        server.registerTool(tool.name, {
            description: tool.description,
            inputSchema: tool.input.shape,
            annotations: tool.annotations,
        }, async (args) => {
            return (0, admin_tools_1.callTool)(tool, args);
        });
    }
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    (0, logger_1.logDebugMessage)(`server is running on stdio`);
}
initMCPServer().catch((err) => {
    (0, logger_1.logDebugMessage)(`Server error: ${(0, error_1.getMessageFromError)(err)}`);
    process.exit(1);
});
