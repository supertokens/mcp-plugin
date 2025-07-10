"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteUserRoleTool = void 0;
const zod_1 = require("zod");
const userroles_1 = __importDefault(
  require("supertokens-node/recipe/userroles")
);
const error_1 = require("@/common/error");
const DeleteUserRoleParametersSchema = zod_1.z.object({
  role: zod_1.z.string().min(1).describe("The name of the role to delete"),
});
async function deleteUserRoleHandler({ role }) {
  const result = await userroles_1.default.deleteRole(role);
  if (result.status !== "OK") {
    throw new error_1.MCPServerError(
      `Failed to delete role - ${JSON.stringify(result)}`,
      "MCP_TOOL_CALL_ERROR"
    );
  }
  return "Role deleted successfully";
}
exports.DeleteUserRoleTool = {
  name: "delete_user_role",
  annotations: {
    title: "Delete user role",
  },
  description: `
  Deletes a role from your SuperTokens integration.

  ## Input:
  - role: 
  ${DeleteUserRoleParametersSchema.shape.role.description}

  ## Return Value
  A success message if the role was deleted successfully, or an error message if the deletion failed.
  `,
  input: DeleteUserRoleParametersSchema,
  handler: deleteUserRoleHandler,
  recipes: ["userroles"],
};
