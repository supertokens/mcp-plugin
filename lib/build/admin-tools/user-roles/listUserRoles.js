"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListUserRolesTool = void 0;
const zod_1 = require("zod");
const userroles_1 = __importDefault(
  require("supertokens-node/recipe/userroles")
);
const schemas_1 = require("@/common/schemas");
const error_1 = require("@/common/error");
const ListUserRolesParametersSchema = zod_1.z.object({
  userId: zod_1.z
    .string()
    .uuid()
    .optional()
    .describe("Optional ID of the user to list roles for"),
  tenantId: schemas_1.TenantIdSchema,
});
async function listUserRolesHandler({ userId, tenantId }) {
  let result;
  if (!userId) {
    result = await userroles_1.default.getAllRoles();
  } else {
    result = await userroles_1.default.getRolesForUser(tenantId, userId);
  }
  if (result.status !== "OK") {
    throw new error_1.MCPServerError(
      `Failed to list roles - ${JSON.stringify(result)}`,
      "MCP_TOOL_CALL_ERROR"
    );
  }
  return { roles: result.roles };
}
exports.ListUserRolesTool = {
  name: "list_user_roles",
  annotations: {
    title: "List user roles",
  },
  description: `
  Retrieves a list of all roles based on a set of filter

  ## Input
  - userId:
  ${ListUserRolesParametersSchema.shape.userId.description}
  - tenantId:
  ${ListUserRolesParametersSchema.shape.tenantId.description}

  ## Return Value
  An object where the roles property is an array of strings
  `,
  input: ListUserRolesParametersSchema,
  handler: listUserRolesHandler,
  recipes: ["userroles"],
};
