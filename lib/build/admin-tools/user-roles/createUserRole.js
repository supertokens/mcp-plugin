"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserRoleTool = void 0;
const zod_1 = require("zod");
const userroles_1 = __importDefault(require("supertokens-node/recipe/userroles"));
const error_1 = require("../../common/error");
const CreateUserRoleParametersSchema = zod_1.z.object({
    role: zod_1.z.string().min(1).describe("The name of the role to create"),
    permissions: zod_1.z
        .array(zod_1.z.string())
        .optional()
        .default([])
        .describe("Optional array of permissions to associate with this role"),
});
async function createUserRoleHandler({ role, permissions, }) {
    const result = await userroles_1.default.createNewRoleOrAddPermissions(role, permissions);
    if (result.status !== "OK") {
        throw new error_1.MCPServerError(`Failed to create role - ${JSON.stringify(result)}`, "MCP_TOOL_CALL_ERROR");
    }
    return "Role created successfully";
}
exports.CreateUserRoleTool = {
    name: "create_user_role",
    annotations: {
        title: "Create user role",
    },
    description: `
  This tool creates a new role in your SuperTokens integration.

  ## Input:
  - role: 
  ${CreateUserRoleParametersSchema.shape.role.description}
  - permissions: 
  ${CreateUserRoleParametersSchema.shape.permissions.description}

  ## Return Value
  An success or an error message based on the result of the operation
  `,
    input: CreateUserRoleParametersSchema,
    handler: createUserRoleHandler,
    recipes: ["userroles"],
};
