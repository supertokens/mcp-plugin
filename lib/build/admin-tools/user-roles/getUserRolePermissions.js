"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserRolePermissionsTool = void 0;
const zod_1 = require("zod");
const userroles_1 = __importDefault(
  require("supertokens-node/recipe/userroles")
);
const error_1 = require("@/common/error");
const GetUserRolePermissionsParametersSchema = zod_1.z.object({
  role: zod_1.z
    .string()
    .min(1)
    .describe("The name of the role to get permissions for"),
});
async function getUserRolePermissionsHandler({ role }) {
  const result = await userroles_1.default.getPermissionsForRole(role);
  if (result.status !== "OK") {
    throw new error_1.MCPServerError(
      `Failed to get role permissions - ${JSON.stringify(result)}`,
      "MCP_TOOL_CALL_ERROR"
    );
  }
  return { permissions: result.permissions };
}
exports.GetUserRolePermissionsTool = {
  name: "get_user_role_permissions",
  annotations: {
    title: "Get user role permissions",
  },
  description: `
  Retrieves the permissions associated with a specific role in your SuperTokens integration.

  ## Input:
  - role: 
  ${GetUserRolePermissionsParametersSchema.shape.role.description}

  ## Return Value
  An object where the permission property is an array of strings. 
  `,
  input: GetUserRolePermissionsParametersSchema,
  handler: getUserRolePermissionsHandler,
  recipes: ["userroles"],
};
