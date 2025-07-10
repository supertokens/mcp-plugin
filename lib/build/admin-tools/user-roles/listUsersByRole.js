"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListUsersByRoleTool = void 0;
const zod_1 = require("zod");
const userroles_1 = __importDefault(
  require("supertokens-node/recipe/userroles")
);
const schemas_1 = require("@/common/schemas");
const error_1 = require("@/common/error");
const ListUsersByRoleParametersSchema = zod_1.z.object({
  role: zod_1.z
    .string()
    .describe("The role that will be used to filter the users"),
  tenantId: schemas_1.TenantIdSchema,
});
async function listUsersByRoleHandler({ role, tenantId }) {
  const result = await userroles_1.default.getUsersThatHaveRole(tenantId, role);
  if (result.status !== "OK") {
    throw new error_1.MCPServerError(
      `Failed to list roles - ${JSON.stringify(result)}`,
      "MCP_TOOL_CALL_ERROR"
    );
  }
  return result;
}
exports.ListUsersByRoleTool = {
  name: "list_users_by_role",
  annotations: {
    title: "List ids of users that have a specific role",
  },
  description: `
  Retrieves a list of user ids based on a role.

  ## Input
  - role:
  ${ListUsersByRoleParametersSchema.shape.role.description}
  - tenantId:
  ${ListUsersByRoleParametersSchema.shape.tenantId.description}

  ## Return Value
  An object where the users property is an array of user ids
  `,
  input: ListUsersByRoleParametersSchema,
  handler: listUsersByRoleHandler,
  recipes: ["userroles"],
};
