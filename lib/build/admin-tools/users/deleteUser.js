"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteUserTool = void 0;
const zod_1 = require("zod");
const supertokens_node_1 = __importDefault(require("supertokens-node"));
const error_1 = require("../../common/error");
const DeleteUserParametersSchema = zod_1.z.object({
  userId: zod_1.z.string().describe("The ID of the user to delete"),
});
async function deleteUserHandler({ userId }) {
  const result = await supertokens_node_1.default.deleteUser(userId);
  if (result.status !== "OK") {
    throw new error_1.MCPServerError(
      "Failed to delete user",
      "MCP_TOOL_CALL_ERROR"
    );
  }
  return "User deleted successfully";
}
exports.DeleteUserTool = {
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
