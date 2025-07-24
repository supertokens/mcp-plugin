import { z } from "zod";
import supertokens from "supertokens-node";
import EmailPassword from "supertokens-node/recipe/emailpassword";
import { Tool } from "../../common/types";
import { MCPServerError } from "../../common/error";

const UpdateUserEmailPasswordDataParametersSchema = z
  .object({
    userId: z
      .string()
      .uuid()
      .describe("The id of the user that will be updated."),
    email: z
      .string()
      .email()
      .optional()
      .describe(
        "The email used to identify the user. Omit the argument if you have specified the password."
      ),
    password: z
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

type UpdateUserEmailPasswordDataParameters = z.infer<
  typeof UpdateUserEmailPasswordDataParametersSchema
>;

async function updateUserHandler({
  userId,
  email,
  password,
}: UpdateUserEmailPasswordDataParameters) {
  const user = await supertokens.getUser(userId);
  if (!user) {
    throw new MCPServerError("User not found", "MCP_TOOL_CALL_ERROR");
  }

  const emailPasswordRecipeUserId = user?.loginMethods?.find(
    (loginMethod) => loginMethod.recipeId === "emailpassword"
  )?.recipeUserId;

  if (!emailPasswordRecipeUserId) {
    throw new MCPServerError(
      "The user does not have emailpassword as an authentication method",
      "MCP_TOOL_CALL_ERROR"
    );
  }
  const result = await EmailPassword.updateEmailOrPassword({
    recipeUserId: emailPasswordRecipeUserId,
    ...(email && { email }),
    ...(password && { password: password }),
  });

  if (result.status !== "OK") {
    throw new MCPServerError(
      `Failed to update email/password. Error: ${JSON.stringify(result)}`,
      "MCP_TOOL_CALL_ERROR"
    );
  }

  return "User updated successfully";
}

export const UpdateUserEmailPasswordDataTool: Tool = {
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
