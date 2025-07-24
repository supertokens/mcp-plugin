import { z } from "zod";
import supertokens from "supertokens-node";
import Passwordless from "supertokens-node/recipe/passwordless";
import { Tool } from "../../common/types";
import { MCPServerError } from "../../common/error";

const UpdateUserPasswordlessDataParametersSchema = z
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
    phoneNumber: z
      .string()
      .optional()
      .describe(
        "The phone number used to identify the user. Omit the argument if you have specified the email."
      ),
  })
  .refine((data) => {
    if (!data.email && !data.phoneNumber) {
      return false;
    }
    if (data.email && data.phoneNumber) {
      return false;
    }
    return true;
  }, "You need to specify either a new email value or a new phone number.");

type UpdateUserPasswordlessDataParameters = z.infer<
  typeof UpdateUserPasswordlessDataParametersSchema
>;

async function updateUserHandler({
  userId,
  email,
  phoneNumber,
}: UpdateUserPasswordlessDataParameters) {
  const user = await supertokens.getUser(userId);
  if (!user) {
    throw new MCPServerError("User not found", "MCP_TOOL_CALL_ERROR");
  }

  const passwordlessRecipeUserId = user?.loginMethods?.find(
    (loginMethod) => loginMethod.recipeId === "passwordless"
  )?.recipeUserId;

  if (!passwordlessRecipeUserId) {
    throw new MCPServerError(
      "The user does not have passwordless as an authentication method",
      "MCP_TOOL_CALL_ERROR"
    );
  }
  const result = await Passwordless.updateUser({
    recipeUserId: passwordlessRecipeUserId,
    ...(phoneNumber && {
      phoneNumber,
    }),
    ...(email && { email }),
  });
  if (result.status !== "OK") {
    throw new MCPServerError(
      `Failed to update passwordless user. Error: ${JSON.stringify(result)}`,
      "MCP_TOOL_CALL_ERROR"
    );
  }

  return "User updated successfully";
}

export const UpdateUserPasswordlessDataTool: Tool = {
  name: "update_user_passwordless_data",
  annotations: {
    title: "Update user passwordless authentication method data",
  },
  description: `
  Updates a user passwordless authentication method data.

  ## Input:
  - userId: 
  ${UpdateUserPasswordlessDataParametersSchema._def.schema.shape.userId.description}
  - email: 
  ${UpdateUserPasswordlessDataParametersSchema._def.schema.shape.email.description}
  - phoneNumber: 
  ${UpdateUserPasswordlessDataParametersSchema._def.schema.shape.phoneNumber.description}

  ## Return Value
  Success message if the user was updated successfully, or an error message if the update failed.
  `,
  input: UpdateUserPasswordlessDataParametersSchema._def.schema,
  handler: updateUserHandler,
  recipes: ["passwordless"],
};
