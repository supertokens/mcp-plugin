"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserPasswordlessDataTool = void 0;
const zod_1 = require("zod");
const supertokens_node_1 = __importDefault(require("supertokens-node"));
const passwordless_1 = __importDefault(require("supertokens-node/recipe/passwordless"));
const error_1 = require("../../common/error");
const UpdateUserPasswordlessDataParametersSchema = zod_1.z
    .object({
    userId: zod_1.z
        .string()
        .uuid()
        .describe("The id of the user that will be updated."),
    email: zod_1.z
        .string()
        .email()
        .optional()
        .describe("The email used to identify the user. Omit the argument if you have specified the password."),
    phoneNumber: zod_1.z
        .string()
        .optional()
        .describe("The phone number used to identify the user. Omit the argument if you have specified the email."),
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
async function updateUserHandler({ userId, email, phoneNumber, }) {
    const user = await supertokens_node_1.default.getUser(userId);
    if (!user) {
        throw new error_1.MCPServerError("User not found", "MCP_TOOL_CALL_ERROR");
    }
    const passwordlessRecipeUserId = user?.loginMethods?.find((loginMethod) => loginMethod.recipeId === "passwordless")?.recipeUserId;
    if (!passwordlessRecipeUserId) {
        throw new error_1.MCPServerError("The user does not have passwordless as an authentication method", "MCP_TOOL_CALL_ERROR");
    }
    const result = await passwordless_1.default.updateUser({
        recipeUserId: passwordlessRecipeUserId,
        ...(phoneNumber && {
            phoneNumber,
        }),
        ...(email && { email }),
    });
    if (result.status !== "OK") {
        throw new error_1.MCPServerError(`Failed to update passwordless user. Error: ${JSON.stringify(result)}`, "MCP_TOOL_CALL_ERROR");
    }
    return "User updated successfully";
}
exports.UpdateUserPasswordlessDataTool = {
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
