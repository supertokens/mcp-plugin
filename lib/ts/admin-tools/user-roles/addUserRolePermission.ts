import { z } from "zod";
import UserRoles from "supertokens-node/recipe/userroles";
import { Tool } from "../../common/types";
import { MCPServerError } from "../../common/error";

const AddUserRolePermissionParametersSchema = z.object({
  role: z
    .string()
    .min(1)
    .describe("The name of the role to add permissions to"),
  permissions: z
    .array(z.string())
    .min(1)
    .describe("Array of permissions to add to the role"),
});

type AddUserRolePermissionParameters = z.infer<
  typeof AddUserRolePermissionParametersSchema
>;

async function addUserRolePermissionHandler({
  role,
  permissions,
}: AddUserRolePermissionParameters) {
  const result = await UserRoles.createNewRoleOrAddPermissions(
    role,
    permissions
  );
  if (result.status !== "OK") {
    throw new MCPServerError(
      `Failed to add permissions to role - ${JSON.stringify(result)}`,
      "MCP_TOOL_CALL_ERROR"
    );
  }
  return "Permissions added successfully";
}

export const AddUserRolePermissionTool: Tool = {
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
