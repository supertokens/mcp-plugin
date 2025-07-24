import { z } from "zod";
import Multitenancy from "supertokens-node/recipe/multitenancy";
import supertokens from "supertokens-node";
import { Tool } from "../../common/types";
import { TenantIdSchema } from "../../common/schemas";
import { MCPServerError } from "../../common/error";

const AddUserToTenantParametersSchema = z.object({
  userId: z.string().uuid().describe("The ID of the user to add to the tenant"),
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
      "Which authentication methods should be associated with the tenant. If not specified all of the users login methods will get included. Provide an array with some of the following values: emailpassword, thirdparty, passwordless, webauthn."
    ),
});

type AddUserToTenantParameters = z.infer<
  typeof AddUserToTenantParametersSchema
>;

async function addUserToTenantHandler({
  userId,
  tenantId,
  loginMethods,
}: AddUserToTenantParameters) {
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

    const result = await Multitenancy.associateUserToTenant(
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

  return "User added to tenant successfully";
}

export const AddUserToTenantTool: Tool = {
  name: "add_user_to_tenant",
  annotations: {
    title: "Add user to tenant",
  },
  description: `
  This tool adds a user to a tenant in your SuperTokens integration.

  ## Input:
  - userId: 
  ${AddUserToTenantParametersSchema.shape.userId.description}
  - tenantId: 
  ${AddUserToTenantParametersSchema.shape.tenantId.description}

  ## Return Value
  A success message if the user was added to the tenant successfully, or an error message if the operation failed.
  `,
  input: AddUserToTenantParametersSchema,
  handler: addUserToTenantHandler,
  recipes: ["multitenancy"],
};
