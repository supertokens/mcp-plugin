"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveUserFromTenantTool = void 0;
const zod_1 = require("zod");
const multitenancy_1 = __importDefault(
  require("supertokens-node/recipe/multitenancy")
);
const supertokens_node_1 = __importDefault(require("supertokens-node"));
const schemas_1 = require("@/common/schemas");
const error_1 = require("@/common/error");
const RemoveUserFromTenantParametersSchema = zod_1.z.object({
  userId: zod_1.z
    .string()
    .uuid()
    .describe("The ID of the user to remove from the tenant"),
  tenantId: schemas_1.TenantIdSchema,
  loginMethods: zod_1.z
    .array(
      zod_1.z.union([
        zod_1.z.literal("emailpassword"),
        zod_1.z.literal("passwordless"),
        zod_1.z.literal("thirdparty"),
        zod_1.z.literal("webauthn"),
      ])
    )
    .optional()
    .default(["emailpassword", "thirdparty", "passwordless", "webauthn"])
    .describe(
      "Which authentication methods should be dissasociated from the tenant. If not specified all of the users login methods will get included. Provide an array with some of the following values: emailpassword, thirdparty, passwordless, webauthn."
    ),
});
async function removeUserFromTenantHandler({ userId, tenantId, loginMethods }) {
  const user = await supertokens_node_1.default.getUser(userId);
  if (!user) {
    throw new error_1.MCPServerError("User not found", "MCP_TOOL_CALL_ERROR");
  }
  for (const recipe of loginMethods) {
    const recipeUserId = user.loginMethods.find(
      (loginMethod) => loginMethod.recipeId === recipe
    )?.recipeUserId;
    if (!recipeUserId) {
      throw new error_1.MCPServerError(
        `User does not have ${recipe} as an authentication method`,
        "MCP_TOOL_CALL_ERROR"
      );
    }
    const result = await multitenancy_1.default.disassociateUserFromTenant(
      tenantId,
      recipeUserId
    );
    if (result.status !== "OK") {
      throw new error_1.MCPServerError(
        `Failed to add user to tenant. Error: ${JSON.stringify(result)}`,
        "MCP_TOOL_CALL_ERROR"
      );
    }
  }
  return "User removed from tenant successfully";
}
exports.RemoveUserFromTenantTool = {
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
