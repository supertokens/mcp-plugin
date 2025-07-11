"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserMetadataTool = void 0;
const zod_1 = require("zod");
const supertokens_node_1 = __importDefault(require("supertokens-node"));
const usermetadata_1 = __importDefault(
  require("supertokens-node/recipe/usermetadata")
);
const error_1 = require("../../common/error");
const UpdateUserMetadataParametersSchema = zod_1.z.object({
  userId: zod_1.z
    .string()
    .uuid()
    .describe("The id of the user that will be updated."),
  metadata: zod_1.z
    .record(
      zod_1.z.string(),
      zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.boolean()])
    )
    .describe(
      "The metadata object that will be associated with the user. It needs to be a JSON object with basic values."
    ),
});
async function updateUserHandler({ userId, metadata }) {
  const user = await supertokens_node_1.default.getUser(userId);
  if (!user) {
    throw new error_1.MCPServerError("User not found", "MCP_TOOL_CALL_ERROR");
  }
  const result = await usermetadata_1.default.updateUserMetadata(
    userId,
    metadata
  );
  if (result.status !== "OK") {
    throw new error_1.MCPServerError(
      "Failed to update user metadata",
      "MCP_TOOL_CALL_ERROR"
    );
  }
  return "User updated successfully";
}
exports.UpdateUserMetadataTool = {
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
