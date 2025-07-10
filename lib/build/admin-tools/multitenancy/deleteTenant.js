"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteTenantTool = void 0;
const zod_1 = require("zod");
const multitenancy_1 = __importDefault(
  require("supertokens-node/recipe/multitenancy")
);
const error_1 = require("@/common/error");
const DeleteTenantParametersSchema = zod_1.z.object({
  tenantId: zod_1.z.string().min(1).describe("The ID of the tenant to delete"),
});
async function deleteTenantHandler({ tenantId }) {
  const result = await multitenancy_1.default.deleteTenant(tenantId);
  if (result.status !== "OK") {
    throw new error_1.MCPServerError(
      `Failed to delete tenant - ${JSON.stringify(result)}`,
      "MCP_TOOL_CALL_ERROR"
    );
  }
  return "Tenant deleted successfully";
}
exports.DeleteTenantTool = {
  name: "delete_tenant",
  annotations: {
    title: "Delete tenant",
  },
  description: `
  This tool deletes a tenant from your SuperTokens integration.

  ## Input:
  - tenantId: 
  ${DeleteTenantParametersSchema.shape.tenantId.description}

  ## Return Value
  A success message if the tenant was deleted successfully, or an error message if the deletion failed.
  `,
  input: DeleteTenantParametersSchema,
  handler: deleteTenantHandler,
  recipes: ["multitenancy"],
};
