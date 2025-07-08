import { z } from "zod";
import UserMetadata from "supertokens-node/recipe/usermetadata";
import { Tool } from "@/common/types";
import { MCPServerError } from "@/common/error";

const GetUserMetadataParametersSchema = z.object({
  userId: z.string().describe("The user ID used to identify the user"),
});

type GetUserMetadataParameters = z.infer<
  typeof GetUserMetadataParametersSchema
>;

async function getUserHandler({ userId }: GetUserMetadataParameters) {
  const metadata = await UserMetadata.getUserMetadata(userId);

  if (metadata.status !== "OK") {
    throw new MCPServerError(
      "Failed to get user metadata",
      "MCP_TOOL_CALL_ERROR"
    );
  }

  return metadata.metadata;
}

export const GetUserMetadataTool: Tool = {
  name: "get_user",
  annotations: {
    title: "Get user",
  },
  description: `
  Retrieves the details of a user from your SuperTokens integration.

  ## Input:
  - userId: 
  ${GetUserMetadataParametersSchema.shape.userId.description}

  ## Return Value
  The user metadata. A record object with custom fields (Record<string, unknown>).
  `,
  input: GetUserMetadataParametersSchema,
  handler: getUserHandler,
  recipes: ["usermetadata"],
};
