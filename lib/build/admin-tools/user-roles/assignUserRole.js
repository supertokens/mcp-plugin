"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignUserRoleTool = void 0;
const zod_1 = require("zod");
const userroles_1 = __importDefault(require("supertokens-node/recipe/userroles"));
const schemas_1 = require("../../common/schemas");
const error_1 = require("../../common/error");
const AssignUserRoleParametersSchema = zod_1.z.object({
    userId: zod_1.z
        .string()
        .uuid()
        .describe("The ID of the user to assign the role to"),
    role: zod_1.z
        .string()
        .min(1)
        .describe("The name of the role to assign to the user"),
    tenantId: schemas_1.TenantIdSchema,
});
async function assignUserRoleHandler({ userId, role, tenantId, }) {
    const result = await userroles_1.default.addRoleToUser(tenantId, userId, role);
    if (result.status !== "OK") {
        throw new error_1.MCPServerError(`Failed to assign role to user - ${JSON.stringify(result)}`, "MCP_TOOL_CALL_ERROR");
    }
    return "Role assigned successfully";
}
exports.AssignUserRoleTool = {
    name: "assign_user_role",
    annotations: {
        title: "Assign user role",
    },
    description: `
  This tool assigns a role to a user in your SuperTokens integration.

  ## Input:
  - userId: 
  ${AssignUserRoleParametersSchema.shape.userId.description}
  - role: 
  ${AssignUserRoleParametersSchema.shape.role.description}
  - tenantId 
  ${AssignUserRoleParametersSchema.shape.tenantId.description}

  ## Return Value
  A success message if the role was assigned successfully, or an error message if the assignment failed.
  `,
    input: AssignUserRoleParametersSchema,
    handler: assignUserRoleHandler,
    recipes: ["userroles"],
};
