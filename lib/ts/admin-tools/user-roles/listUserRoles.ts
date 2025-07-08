import { z } from "zod";
import UserRoles from "supertokens-node/recipe/userroles";
import { Tool } from "@/common/types";
import { TenantIdSchema } from "@/common/schemas";
import { MCPServerError } from "@/common/error";

const ListUserRolesParametersSchema = z.object({
  userId: z
    .string()
    .uuid()
    .optional()
    .describe("Optional ID of the user to list roles for"),
  tenantId: TenantIdSchema,
});

type ListUserRolesParameters = z.infer<typeof ListUserRolesParametersSchema>;

async function listUserRolesHandler({
  userId,
  tenantId,
}: ListUserRolesParameters) {
  let result: { status: "OK"; roles: string[] } | { status: "ERROR" };
  if (!userId) {
    result = await UserRoles.getAllRoles();
  } else {
    result = await UserRoles.getRolesForUser(tenantId, userId);
  }
  if (result.status !== "OK") {
    throw new MCPServerError(
      `Failed to list roles - ${JSON.stringify(result)}`,
      "MCP_TOOL_CALL_ERROR"
    );
  }
  return { roles: result.roles };
}

export const ListUserRolesTool: Tool = {
  name: "list_user_roles",
  annotations: {
    title: "List user roles",
  },
  description: `
  Retrieves a list of all roles based on a set of filter

  ## Input
  - userId:
  ${ListUserRolesParametersSchema.shape.userId.description}
  - tenantId:
  ${ListUserRolesParametersSchema.shape.tenantId.description}

  ## Return Value
  An object where the roles property is an array of strings
  `,
  input: ListUserRolesParametersSchema,
  handler: listUserRolesHandler,
  recipes: ["userroles"],
};
