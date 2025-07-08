import { z } from "zod";
import supertokens from "supertokens-node";
import { Tool } from "@/common/types";
import { TenantIdSchema } from "@/common/schemas";

const ListUsersParametersSchema = z.object({
  tenantId: TenantIdSchema,
  sortingOrder: z
    .enum(["ASC", "DESC"])
    .default("ASC")
    .describe(
      "The order in which the users are sorted. ASC - oldest users first, DESC - newest users first"
    ),
  limit: z
    .number()
    .default(100)
    .describe("The maximum number of users to return"),
  paginationToken: z
    .string()
    .optional()
    .describe("The pagination token used to retrieve the next page"),
});

type ListUsersParameters = z.infer<typeof ListUsersParametersSchema>;

async function listUsersHandler({
  sortingOrder,
  limit,
  paginationToken,
  tenantId,
}: ListUsersParameters) {
  let result: Awaited<ReturnType<typeof supertokens.getUsersOldestFirst>>;
  if (sortingOrder === "ASC") {
    result = await supertokens.getUsersOldestFirst({
      tenantId,
      limit,
      paginationToken,
    });
  } else {
    result = await supertokens.getUsersNewestFirst({
      tenantId,
      limit,
      paginationToken,
    });
  }

  return result;
}

export const ListUsersTool: Tool = {
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
