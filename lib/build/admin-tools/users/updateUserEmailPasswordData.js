"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserEmailPasswordDataTool = void 0;
const zod_1 = require("zod");
const supertokens_node_1 = __importDefault(require("supertokens-node"));
const emailpassword_1 = __importDefault(
  require("supertokens-node/recipe/emailpassword")
);
const error_1 = require("../../common/error");
const UpdateUserEmailPasswordDataParametersSchema = zod_1.z
  .object({
    userId: zod_1.z
      .string()
      .uuid()
      .describe("The id of the user that will be updated."),
    email: zod_1.z
      .string()
      .email()
      .optional()
      .describe(
        "The email used to identify the user. Omit the argument if you have specified the password."
      ),
    password: zod_1.z
      .string()
      .optional()
      .describe(
        "The password used to identify the user. Omit the argument if you have specified the email."
      ),
  })
  .refine((data) => {
    if (!data.email && !data.password) {
      return false;
    }
    if (data.email && data.password) {
      return false;
    }
    return true;
  }, "You need to specify either a new email value or a new password.");
async function updateUserHandler({ userId, email, password }) {
  const user = await supertokens_node_1.default.getUser(userId);
  if (!user) {
    throw new error_1.MCPServerError("User not found", "MCP_TOOL_CALL_ERROR");
  }
  const emailPasswordRecipeUserId = user?.loginMethods?.find(
    (loginMethod) => loginMethod.recipeId === "emailpassword"
  )?.recipeUserId;
  if (!emailPasswordRecipeUserId) {
    throw new error_1.MCPServerError(
      "The user does not have emailpassword as an authentication method",
      "MCP_TOOL_CALL_ERROR"
    );
  }
  const result = await emailpassword_1.default.updateEmailOrPassword({
    recipeUserId: emailPasswordRecipeUserId,
    ...(email && { email }),
    ...(password && { password: password }),
  });
  if (result.status !== "OK") {
    throw new error_1.MCPServerError(
      `Failed to update email/password. Error: ${JSON.stringify(result)}`,
      "MCP_TOOL_CALL_ERROR"
    );
  }
  return "User updated successfully";
}
exports.UpdateUserEmailPasswordDataTool = {
  name: "update_user_email_password_data",
  annotations: {
    title: "Update user email password authentication method data",
  },
  description: `
  Updates a user email password authentication method data. 

  ## Input:
  - userId: 
  ${UpdateUserEmailPasswordDataParametersSchema._def.schema.shape.userId.description}
  - email: 
  ${UpdateUserEmailPasswordDataParametersSchema._def.schema.shape.email.description}
  - password: 
  ${UpdateUserEmailPasswordDataParametersSchema._def.schema.shape.password.description}

  ## Return Value
  Success message if the user was updated successfully, or an error message if the update failed.
  `,
  input: UpdateUserEmailPasswordDataParametersSchema._def.schema,
  handler: updateUserHandler,
  recipes: ["emailpassword"],
};
