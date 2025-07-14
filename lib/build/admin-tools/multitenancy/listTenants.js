"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListTenantsTool = void 0;
const zod_1 = require("zod");
const multitenancy_1 = __importDefault(require("supertokens-node/recipe/multitenancy"));
const error_1 = require("../../common/error");
const ListTenantsParametersSchema = zod_1.z.object({});
async function listTenantsHandler({}) {
    const result = await multitenancy_1.default.listAllTenants();
    if (result.status !== "OK") {
        throw new error_1.MCPServerError(`Failed to list tenants - ${JSON.stringify(result)}`, "MCP_TOOL_CALL_ERROR");
    }
    return result;
}
exports.ListTenantsTool = {
    name: "list_tenants",
    annotations: {
        title: "List tenants",
    },
    description: `
  This tool lists all tenants in your SuperTokens integration.

  ## Input:
  No input parameters required.

  ## Return Value
  A list of all tenants in your SuperTokens integration, or an error message if the operation failed.
  `,
    input: ListTenantsParametersSchema,
    handler: listTenantsHandler,
    recipes: ["multitenancy"],
};
