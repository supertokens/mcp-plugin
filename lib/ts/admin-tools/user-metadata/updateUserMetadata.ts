import { z } from "zod";
import supertokens from "supertokens-node";
import UserMetadata from "supertokens-node/recipe/usermetadata";
import { Tool } from "../../common/types";
import { MCPServerError } from "../../common/error";

const UpdateUserMetadataParametersSchema = z.object({
  userId: z
    .string()
    .uuid()
    .describe("The id of the user that will be updated."),
  metadata: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
    .describe(
      "The metadata object that will be associated with the user. It needs to be a JSON object with basic values."
    ),
});

type UpdateUserMetadataParameters = z.infer<
  typeof UpdateUserMetadataParametersSchema
>;

async function updateUserHandler({
  userId,
  metadata,
}: UpdateUserMetadataParameters) {
  const user = await supertokens.getUser(userId);
  if (!user) {
    throw new MCPServerError("User not found", "MCP_TOOL_CALL_ERROR");
  }

  const result = await UserMetadata.updateUserMetadata(userId, metadata);
  if (result.status !== "OK") {
    throw new MCPServerError(
      "Failed to update user metadata",
      "MCP_TOOL_CALL_ERROR"
    );
  }

  return "User updated successfully";
}

export const UpdateUserMetadataTool: Tool = {
  name: "update_user_metadata",
  annotations: {
    title: "Update user metadata",
  },
  description: `
  Updates a user's metadata. 

  ## Input:
  - userId: 
  ${UpdateUserMetadataParametersSchema.shape.userId.description}
  - metadata: 
  ${UpdateUserMetadataParametersSchema.shape.metadata.description}

  ## Return Value
  Success message if the user was updated successfully, or an error message if the update failed.
  `,
  input: UpdateUserMetadataParametersSchema,
  handler: updateUserHandler,
  recipes: ["usermetadata"],
};
