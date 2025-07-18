"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessageFromError = exports.MCPServerError = void 0;
class MCPServerError extends Error {
  type;
  constructor(message, type) {
    super(message);
    this.type = type;
  }
}
exports.MCPServerError = MCPServerError;
function getMessageFromError(error) {
  if (error instanceof Error || error instanceof MCPServerError) {
    return error.message;
  }
  return String(error);
}
exports.getMessageFromError = getMessageFromError;
