import { z } from "zod";
import UserRoles from "supertokens-node/recipe/userroles";
import { Tool } from "../../common/types";
import { MCPServerError } from "../../common/error";

const DeleteUserRoleParametersSchema = z.object({
  role: z.string().min(1).describe("The name of the role to delete"),
});

type DeleteUserRoleParameters = z.infer<typeof DeleteUserRoleParametersSchema>;

async function deleteUserRoleHandler({ role }: DeleteUserRoleParameters) {
  const result = await UserRoles.deleteRole(role);
  if (result.status !== "OK") {
    throw new MCPServerError(
      `Failed to delete role - ${JSON.stringify(result)}`,
      "MCP_TOOL_CALL_ERROR"
    );
  }
  return "Role deleted successfully";
}

export const DeleteUserRoleTool: Tool = {
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
