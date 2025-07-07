"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
class SuperTokensMcpServer extends mcp_js_1.McpServer {
  path;
  validateTokenPayload;
  claimValidators;
  constructor(serverInfo, options) {
    super(serverInfo, options);
    this.path = serverInfo.path;
    this.validateTokenPayload = serverInfo.validateTokenPayload;
    this.claimValidators = serverInfo.claimValidators;
  }
}
exports.default = SuperTokensMcpServer;
