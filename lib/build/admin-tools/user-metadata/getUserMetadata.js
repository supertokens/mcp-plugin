"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserMetadataTool = void 0;
const zod_1 = require("zod");
const usermetadata_1 = __importDefault(
  require("supertokens-node/recipe/usermetadata")
);
const error_1 = require("../../common/error");
const GetUserMetadataParametersSchema = zod_1.z.object({
  userId: zod_1.z.string().describe("The user ID used to identify the user"),
});
async function getUserHandler({ userId }) {
  const metadata = await usermetadata_1.default.getUserMetadata(userId);
  if (metadata.status !== "OK") {
    throw new error_1.MCPServerError(
      "Failed to get user metadata",
      "MCP_TOOL_CALL_ERROR"
    );
  }
  return metadata.metadata;
}
exports.GetUserMetadataTool = {
  name: "get_user_metadata",
  annotations: {
    title: "Get user metadata",
  },
  description: `
  Retrieves the user metadata for a a user.

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
