import { z } from "zod";
import UserRoles from "supertokens-node/recipe/userroles";
import { Tool } from "../../common/types";
import { MCPServerError } from "../../common/error";

const CreateUserRoleParametersSchema = z.object({
  role: z.string().min(1).describe("The name of the role to create"),
  permissions: z
    .array(z.string())
    .optional()
    .default([])
    .describe("Optional array of permissions to associate with this role"),
});

type CreateUserRoleParameters = z.infer<typeof CreateUserRoleParametersSchema>;

async function createUserRoleHandler({
  role,
  permissions,
}: CreateUserRoleParameters) {
  const result = await UserRoles.createNewRoleOrAddPermissions(
    role,
    permissions
  );
  if (result.status !== "OK") {
    throw new MCPServerError(
      `Failed to create role - ${JSON.stringify(result)}`,
      "MCP_TOOL_CALL_ERROR"
    );
  }
  return "Role created successfully";
}

export const CreateUserRoleTool: Tool = {
  name: "create_user_role",
  annotations: {
    title: "Create user role",
  },
  description: `
  This tool creates a new role in your SuperTokens integration.

  ## Input:
  - role: 
  ${CreateUserRoleParametersSchema.shape.role.description}
  - permissions: 
  ${CreateUserRoleParametersSchema.shape.permissions.description}

  ## Return Value
  An success or an error message based on the result of the operation
  `,
  input: CreateUserRoleParametersSchema,
  handler: createUserRoleHandler,
  recipes: ["userroles"],
};
