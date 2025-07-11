"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveUserRolePermissionTool = void 0;
const zod_1 = require("zod");
const userroles_1 = __importDefault(
  require("supertokens-node/recipe/userroles")
);
const error_1 = require("../../common/error");
const RemoveUserRolePermissionParametersSchema = zod_1.z.object({
  role: zod_1.z
    .string()
    .min(1)
    .describe("The name of the role to remove permissions from"),
  permissions: zod_1.z
    .array(zod_1.z.string())
    .min(1)
    .describe("Array of permissions to remove from the role"),
});
async function removeUserRolePermissionHandler({ role, permissions }) {
  const result = await userroles_1.default.removePermissionsFromRole(
    role,
    permissions
  );
  if (result.status !== "OK") {
    throw new error_1.MCPServerError(
      `Failed to remove permissions from role - ${JSON.stringify(result)}`,
      "MCP_TOOL_CALL_ERROR"
    );
  }
  return "Permissions removed successfully";
}
exports.RemoveUserRolePermissionTool = {
  name: "remove_user_role_permission",
  annotations: {
    title: "Remove user role permission",
  },
  description: `
  This tool removes permissions from a role in your SuperTokens integration.

  ## Input:
  - role: 
  ${RemoveUserRolePermissionParametersSchema.shape.role.description}
  - permissions: 
  ${RemoveUserRolePermissionParametersSchema.shape.permissions.description}

  ## Return Value
  A success message if the permissions were removed successfully, or an error message if the operation failed.
  `,
  input: RemoveUserRolePermissionParametersSchema,
  handler: removeUserRolePermissionHandler,
  recipes: ["userroles"],
};
