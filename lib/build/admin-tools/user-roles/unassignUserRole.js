"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnassignUserRoleTool = void 0;
const zod_1 = require("zod");
const userroles_1 = __importDefault(require("supertokens-node/recipe/userroles"));
const schemas_1 = require("../../common/schemas");
const error_1 = require("../../common/error");
const UnassignUserRoleParametersSchema = zod_1.z.object({
    userId: zod_1.z
        .string()
        .uuid()
        .describe("The ID of the user to remove the role from"),
    role: zod_1.z
        .string()
        .min(1)
        .describe("The name of the role to remove from the user"),
    tenantId: schemas_1.TenantIdSchema,
});
async function unassignUserRoleHandler({ userId, role, tenantId, }) {
    const result = await userroles_1.default.removeUserRole(userId, role, tenantId);
    if (result.status !== "OK") {
        throw new error_1.MCPServerError(`Failed to unassign role from user - ${JSON.stringify(result)}`, "MCP_TOOL_CALL_ERROR");
    }
    return "Role unassigned successfully";
}
exports.UnassignUserRoleTool = {
    name: "unassign_user_role",
    annotations: {
        title: "Unassign user role",
    },
    description: `
  This tool removes a role from a user in your SuperTokens integration.

  ## Input:
  - userId: 
  ${UnassignUserRoleParametersSchema.shape.userId.description}
  - role: 
  ${UnassignUserRoleParametersSchema.shape.role.description}
  - tenantId 
  ${UnassignUserRoleParametersSchema.shape.tenantId.description}

  ## Return Value
  A success message if the role was unassigned successfully, or an error message if the operation failed.
  `,
    input: UnassignUserRoleParametersSchema,
    handler: unassignUserRoleHandler,
    recipes: ["userroles"],
};
