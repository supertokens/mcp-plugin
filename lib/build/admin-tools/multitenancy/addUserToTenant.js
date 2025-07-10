"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddUserToTenantTool = void 0;
const zod_1 = require("zod");
const multitenancy_1 = __importDefault(
  require("supertokens-node/recipe/multitenancy")
);
const supertokens_node_1 = __importDefault(require("supertokens-node"));
const schemas_1 = require("@/common/schemas");
const error_1 = require("@/common/error");
const AddUserToTenantParametersSchema = zod_1.z.object({
  userId: zod_1.z
    .string()
    .uuid()
    .describe("The ID of the user to add to the tenant"),
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
      "Which authentication methods should be associated with the tenant. If not specified all of the users login methods will get included. Provide an array with some of the following values: emailpassword, thirdparty, passwordless, webauthn."
    ),
});
async function addUserToTenantHandler({ userId, tenantId, loginMethods }) {
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
    const result = await multitenancy_1.default.associateUserToTenant(
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
  return "User added to tenant successfully";
}
exports.AddUserToTenantTool = {
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
