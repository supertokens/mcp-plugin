"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPlugin = exports.SuperTokensAdminMcpServer = exports.SuperTokensMcpServer = void 0;
const server_1 = __importDefault(require("./server"));
exports.SuperTokensMcpServer = server_1.default;
const adminServer_1 = __importDefault(require("./adminServer"));
exports.SuperTokensAdminMcpServer = adminServer_1.default;
const plugin_1 = __importDefault(require("./plugin"));
exports.createPlugin = plugin_1.default;
