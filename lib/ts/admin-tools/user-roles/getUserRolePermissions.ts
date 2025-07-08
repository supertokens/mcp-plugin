import { z } from "zod";
import UserRoles from "supertokens-node/recipe/userroles";
import { Tool } from "@/common/types";
import { MCPServerError } from "@/common/error";

const GetUserRolePermissionsParametersSchema = z.object({
  role: z
    .string()
    .min(1)
    .describe("The name of the role to get permissions for"),
});

type GetUserRolePermissionsParameters = z.infer<
  typeof GetUserRolePermissionsParametersSchema
>;

async function getUserRolePermissionsHandler({
  role,
}: GetUserRolePermissionsParameters) {
  const result = await UserRoles.getPermissionsForRole(role);
  if (result.status !== "OK") {
    throw new MCPServerError(
      `Failed to get role permissions - ${JSON.stringify(result)}`,
      "MCP_TOOL_CALL_ERROR"
    );
  }
  return { permissions: result.permissions };
}

export const GetUserRolePermissionsTool: Tool = {
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
