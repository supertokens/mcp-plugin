import { z } from "zod";
import UserRoles from "supertokens-node/recipe/userroles";
import { Tool } from "../../common/types";
import { TenantIdSchema } from "../../common/schemas";
import { MCPServerError } from "../../common/error";

const ListUsersByRoleParametersSchema = z.object({
  role: z.string().describe("The role that will be used to filter the users"),
  tenantId: TenantIdSchema,
});

type ListUsersByRoleParameters = z.infer<
  typeof ListUsersByRoleParametersSchema
>;

async function listUsersByRoleHandler({
  role,
  tenantId,
}: ListUsersByRoleParameters) {
  const result = await UserRoles.getUsersThatHaveRole(tenantId, role);
  if (result.status !== "OK") {
    throw new MCPServerError(
      `Failed to list roles - ${JSON.stringify(result)}`,
      "MCP_TOOL_CALL_ERROR"
    );
  }
  return result;
}

export const ListUsersByRoleTool: Tool = {
  name: "list_users_by_role",
  annotations: {
    title: "List ids of users that have a specific role",
  },
  description: `
  Retrieves a list of user ids based on a role.

  ## Input
  - role:
  ${ListUsersByRoleParametersSchema.shape.role.description}
  - tenantId:
  ${ListUsersByRoleParametersSchema.shape.tenantId.description}

  ## Return Value
  An object where the users property is an array of user ids
  `,
  input: ListUsersByRoleParametersSchema,
  handler: listUsersByRoleHandler,
  recipes: ["userroles"],
};
