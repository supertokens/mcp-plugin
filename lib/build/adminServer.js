"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./server"));
class SuperTokensAdminMcpServer extends server_1.default {
  constructor(serverInfo, options) {
    super(serverInfo, options);
    this.registerAdminTools();
  }
  registerAdminTools() {
    // TODO
  }
}
exports.default = SuperTokensAdminMcpServer;
