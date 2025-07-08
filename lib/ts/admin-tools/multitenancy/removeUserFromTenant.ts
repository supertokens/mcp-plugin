import { z } from "zod";
import Multitenancy from "supertokens-node/recipe/multitenancy";
import supertokens from "supertokens-node";
import { Tool } from "@/common/types";
import { TenantIdSchema } from "@/common/schemas";
import { MCPServerError } from "@/common/error";

const RemoveUserFromTenantParametersSchema = z.object({
  userId: z
    .string()
    .uuid()
    .describe("The ID of the user to remove from the tenant"),
  tenantId: TenantIdSchema,
  loginMethods: z
    .array(
      z.union([
        z.literal("emailpassword"),
        z.literal("passwordless"),
        z.literal("thirdparty"),
        z.literal("webauthn"),
      ])
    )
    .optional()
    .default(["emailpassword", "thirdparty", "passwordless", "webauthn"])
    .describe(
      "Which authentication methods should be dissasociated from the tenant. If not specified all of the users login methods will get included. Provide an array with some of the following values: emailpassword, thirdparty, passwordless, webauthn."
    ),
});

type RemoveUserFromTenantParameters = z.infer<
  typeof RemoveUserFromTenantParametersSchema
>;

async function removeUserFromTenantHandler({
  userId,
  tenantId,
  loginMethods,
}: RemoveUserFromTenantParameters) {
  const user = await supertokens.getUser(userId);
  if (!user) {
    throw new MCPServerError("User not found", "MCP_TOOL_CALL_ERROR");
  }

  for (const recipe of loginMethods) {
    const recipeUserId = user.loginMethods.find(
      (loginMethod) => loginMethod.recipeId === recipe
    )?.recipeUserId;
    if (!recipeUserId) {
      throw new MCPServerError(
        `User does not have ${recipe} as an authentication method`,
        "MCP_TOOL_CALL_ERROR"
      );
    }

    const result = await Multitenancy.disassociateUserFromTenant(
      tenantId,
      recipeUserId
    );

    if (result.status !== "OK") {
      throw new MCPServerError(
        `Failed to add user to tenant. Error: ${JSON.stringify(result)}`,
        "MCP_TOOL_CALL_ERROR"
      );
    }
  }
  return "User removed from tenant successfully";
}

export const RemoveUserFromTenantTool: Tool = {
  name: "remove_user_from_tenant",
  annotations: {
    title: "Remove user from tenant",
  },
  description: `
  Removes a user from a tenant in your SuperTokens integration.

  ## Input:
  - userId: 
  ${RemoveUserFromTenantParametersSchema.shape.userId.description}
  - tenantId: 
  ${RemoveUserFromTenantParametersSchema.shape.tenantId.description}

  ## Return Value
  A success message if the user was removed from the tenant successfully, or an error message if the operation failed.
  `,
  input: RemoveUserFromTenantParametersSchema,
  handler: removeUserFromTenantHandler,
  recipes: ["multitenancy"],
};
