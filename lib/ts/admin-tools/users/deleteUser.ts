import { z } from "zod";
import supertokens from "supertokens-node";
import { Tool } from "../../common/types";
import { MCPServerError } from "../../common/error";

const DeleteUserParametersSchema = z.object({
  userId: z.string().describe("The ID of the user to delete"),
});

type DeleteUserParameters = z.infer<typeof DeleteUserParametersSchema>;

async function deleteUserHandler({ userId }: DeleteUserParameters) {
  const result = await supertokens.deleteUser(userId);
  if (result.status !== "OK") {
    throw new MCPServerError("Failed to delete user", "MCP_TOOL_CALL_ERROR");
  }
  return "User deleted successfully";
}

export const DeleteUserTool: Tool = {
  name: "delete_user",
  annotations: {
    title: "Delete user",
  },
  description: `
  Deletes a user from your SuperTokens integration.

  ## Input:
  - userId 
  ${DeleteUserParametersSchema.shape.userId.description}

  ## Return Value
  A success message if the user was deleted successfully, or an error message if the deletion failed.
  `,
  input: DeleteUserParametersSchema,
  handler: deleteUserHandler,
  recipes: [],
};
