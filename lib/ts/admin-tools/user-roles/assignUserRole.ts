import { z } from "zod";
import UserRoles from "supertokens-node/recipe/userroles";
import { Tool } from "../../common/types";
import { TenantIdSchema } from "../../common/schemas";
import { MCPServerError } from "../../common/error";

const AssignUserRoleParametersSchema = z.object({
  userId: z
    .string()
    .uuid()
    .describe("The ID of the user to assign the role to"),
  role: z
    .string()
    .min(1)
    .describe("The name of the role to assign to the user"),
  tenantId: TenantIdSchema,
});

type AssignUserRoleParameters = z.infer<typeof AssignUserRoleParametersSchema>;

async function assignUserRoleHandler({
  userId,
  role,
  tenantId,
}: AssignUserRoleParameters) {
  const result = await UserRoles.addRoleToUser(tenantId, userId, role);
  if (result.status !== "OK") {
    throw new MCPServerError(
      `Failed to assign role to user - ${JSON.stringify(result)}`,
      "MCP_TOOL_CALL_ERROR"
    );
  }
  return "Role assigned successfully";
}

export const AssignUserRoleTool: Tool = {
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
