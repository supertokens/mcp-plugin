import { z } from "zod";
import UserRoles from "supertokens-node/recipe/userroles";
import { Tool } from "@/common/types";
import { MCPServerError } from "@/common/error";

const RemoveUserRolePermissionParametersSchema = z.object({
  role: z
    .string()
    .min(1)
    .describe("The name of the role to remove permissions from"),
  permissions: z
    .array(z.string())
    .min(1)
    .describe("Array of permissions to remove from the role"),
});

type RemoveUserRolePermissionParameters = z.infer<
  typeof RemoveUserRolePermissionParametersSchema
>;

async function removeUserRolePermissionHandler({
  role,
  permissions,
}: RemoveUserRolePermissionParameters) {
  const result = await UserRoles.removePermissionsFromRole(role, permissions);
  if (result.status !== "OK") {
    throw new MCPServerError(
      `Failed to remove permissions from role - ${JSON.stringify(result)}`,
      "MCP_TOOL_CALL_ERROR"
    );
  }
  return "Permissions removed successfully";
}

export const RemoveUserRolePermissionTool: Tool = {
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
