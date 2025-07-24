"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperTokensAdminMcpServer = exports.SuperTokensMcpServer = exports.init = void 0;
const server_1 = __importDefault(require("./server"));
const adminServer_1 = __importDefault(require("./adminServer"));
const plugin_1 = __importDefault(require("./plugin"));
const stdio_1 = require("./stdio");
class Wrapper {
    static init = plugin_1.default;
    static SuperTokensMcpServer = server_1.default;
    static SuperTokensAdminMcpServer = adminServer_1.default;
}
exports.default = Wrapper;
exports.init = Wrapper.init;
exports.SuperTokensMcpServer = Wrapper.SuperTokensMcpServer;
exports.SuperTokensAdminMcpServer = Wrapper.SuperTokensAdminMcpServer;
// Run the admin server over stdio if the index file is being run directly
if (process.argv[2] === "--stdio") {
    (0, stdio_1.runStdioAdminMCPServer)();
}
