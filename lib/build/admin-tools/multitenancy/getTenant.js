"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTenantTool = void 0;
const zod_1 = require("zod");
const multitenancy_1 = __importDefault(require("supertokens-node/recipe/multitenancy"));
const schemas_1 = require("../../common/schemas");
const error_1 = require("../../common/error");
const GetTenantParametersSchema = zod_1.z.object({
    tenantId: schemas_1.TenantIdSchema,
});
async function getTenantHandler({ tenantId }) {
    const result = await multitenancy_1.default.getTenant(tenantId);
    if (!result) {
        return "Tenant not found";
    }
    if (result.status !== "OK") {
        throw new error_1.MCPServerError(`Failed to get tenant - ${JSON.stringify(result)}`, "MCP_TOOL_CALL_ERROR");
    }
    return result;
}
exports.GetTenantTool = {
    name: "get_tenant",
    annotations: {
        title: "Get tenant",
    },
    description: `
  This tool retrieves the details of a tenant from your SuperTokens integration.

  ## Input:
  - tenantId: 
  ${GetTenantParametersSchema.shape.tenantId.description}

  ## Return Value
  The tenant details object containing information about the tenant's configuration.
  `,
    input: GetTenantParametersSchema,
    handler: getTenantHandler,
    recipes: ["multitenancy"],
};
