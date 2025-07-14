"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enableDebugLogs = exports.logDebugMessage = void 0;
const debug_1 = __importDefault(require("debug"));
const config_1 = require("./config");
const PLUGIN_DEBUG_NAMESPACE = "com.supertokens-mcp";
let ADMIN_MCP_SERVER_TRANSPORT = "http";
function logDebugMessage(message) {
    if (!isLoggingEnabled()) {
        return;
    }
    const formattedMessage = `{t: "${new Date().toISOString()}", message: \"${message}\", pluginVersion: "${config_1.PLUGIN_VERSION}"}`;
    if (ADMIN_MCP_SERVER_TRANSPORT !== "stdio") {
        (0, debug_1.default)(PLUGIN_DEBUG_NAMESPACE)(formattedMessage);
    }
    else {
        console.error(`PLUGIN_DEBUG_NAMESPACE: ${formattedMessage}`);
    }
}
exports.logDebugMessage = logDebugMessage;
function isLoggingEnabled() {
    if (ADMIN_MCP_SERVER_TRANSPORT !== "stdio") {
        return debug_1.default.enabled(PLUGIN_DEBUG_NAMESPACE);
    }
    return true;
}
function enableDebugLogs(transport = "http") {
    ADMIN_MCP_SERVER_TRANSPORT = transport;
    debug_1.default.enable(PLUGIN_DEBUG_NAMESPACE);
}
exports.enableDebugLogs = enableDebugLogs;
