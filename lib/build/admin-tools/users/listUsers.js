"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListUsersTool = void 0;
const zod_1 = require("zod");
const supertokens_node_1 = __importDefault(require("supertokens-node"));
const schemas_1 = require("../../common/schemas");
const ListUsersParametersSchema = zod_1.z.object({
  tenantId: schemas_1.TenantIdSchema,
  sortingOrder: zod_1.z
    .enum(["ASC", "DESC"])
    .default("ASC")
    .describe(
      "The order in which the users are sorted. ASC - oldest users first, DESC - newest users first"
    ),
  limit: zod_1.z
    .number()
    .default(100)
    .describe("The maximum number of users to return"),
  paginationToken: zod_1.z
    .string()
    .optional()
    .describe("The pagination token used to retrieve the next page"),
});
async function listUsersHandler({
  sortingOrder,
  limit,
  paginationToken,
  tenantId,
}) {
  let result;
  if (sortingOrder === "ASC") {
    result = await supertokens_node_1.default.getUsersOldestFirst({
      tenantId,
      limit,
      paginationToken,
    });
  } else {
    result = await supertokens_node_1.default.getUsersNewestFirst({
      tenantId,
      limit,
      paginationToken,
    });
  }
  return result;
}
exports.ListUsersTool = {
  name: "list_users",
  annotations: {
    title: "List users",
  },
  description: `
  This tool retrieves a list of users from your SuperTokens integration.

  ## Input
  - sortingOrder
  ${ListUsersParametersSchema.shape.sortingOrder.description}
  - limit
  ${ListUsersParametersSchema.shape.limit.description}
  - paginationToken
  ${ListUsersParametersSchema.shape.paginationToken.description}
  - tenantId 
  ${ListUsersParametersSchema.shape.tenantId.description}

  ## Return Value
  An object with the following fields:
    - users: An array of user objects
    - paginationToken: A token used to retrieve the next page of users
  `,
  input: ListUsersParametersSchema,
  handler: listUsersHandler,
  recipes: [],
};
