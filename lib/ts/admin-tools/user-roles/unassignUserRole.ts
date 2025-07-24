import { z } from "zod";
import UserRoles from "supertokens-node/recipe/userroles";
import { Tool } from "../../common/types";
import { TenantIdSchema } from "../../common/schemas";
import { MCPServerError } from "../../common/error";

const UnassignUserRoleParametersSchema = z.object({
  userId: z
    .string()
    .uuid()
    .describe("The ID of the user to remove the role from"),
  role: z
    .string()
    .min(1)
    .describe("The name of the role to remove from the user"),
  tenantId: TenantIdSchema,
});

type UnassignUserRoleParameters = z.infer<
  typeof UnassignUserRoleParametersSchema
>;

async function unassignUserRoleHandler({
  userId,
  role,
  tenantId,
}: UnassignUserRoleParameters) {
  const result = await UserRoles.removeUserRole(userId, role, tenantId);
  if (result.status !== "OK") {
    throw new MCPServerError(
      `Failed to unassign role from user - ${JSON.stringify(result)}`,
      "MCP_TOOL_CALL_ERROR"
    );
  }
  return "Role unassigned successfully";
}

export const UnassignUserRoleTool: Tool = {
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
