"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddUserRolePermissionTool = void 0;
const zod_1 = require("zod");
const userroles_1 = __importDefault(require("supertokens-node/recipe/userroles"));
const error_1 = require("../../common/error");
const AddUserRolePermissionParametersSchema = zod_1.z.object({
    role: zod_1.z
        .string()
        .min(1)
        .describe("The name of the role to add permissions to"),
    permissions: zod_1.z
        .array(zod_1.z.string())
        .min(1)
        .describe("Array of permissions to add to the role"),
});
async function addUserRolePermissionHandler({ role, permissions, }) {
    const result = await userroles_1.default.createNewRoleOrAddPermissions(role, permissions);
    if (result.status !== "OK") {
        throw new error_1.MCPServerError(`Failed to add permissions to role - ${JSON.stringify(result)}`, "MCP_TOOL_CALL_ERROR");
    }
    return "Permissions added successfully";
}
exports.AddUserRolePermissionTool = {
    name: "add_user_role_permission",
    annotations: {
        title: "Add user role permission",
    },
    description: `
  Adds permissions to an existing role in your SuperTokens integration.

  ## Input:
  - role: 
  ${AddUserRolePermissionParametersSchema.shape.role.description}
  - permissions: 
  ${AddUserRolePermissionParametersSchema.shape.permissions.description}

  ## Return Value
  A success message if the permissions were added successfully, or an error message if the operation failed.
  `,
    input: AddUserRolePermissionParametersSchema,
    handler: addUserRolePermissionHandler,
    recipes: ["userroles"],
};
