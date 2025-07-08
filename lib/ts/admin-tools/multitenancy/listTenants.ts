import { z } from "zod";
import Multitenancy from "supertokens-node/recipe/multitenancy";
import { Tool } from "@/common/types";
import { MCPServerError } from "@/common/error";

const ListTenantsParametersSchema = z.object({});

type ListTenantsParameters = z.infer<typeof ListTenantsParametersSchema>;

async function listTenantsHandler({}: ListTenantsParameters) {
  const result = await Multitenancy.listAllTenants();
  if (result.status !== "OK") {
    throw new MCPServerError(
      `Failed to list tenants - ${JSON.stringify(result)}`,
      "MCP_TOOL_CALL_ERROR"
    );
  }
  return result;
}

export const ListTenantsTool: Tool = {
  name: "list_tenants",
  annotations: {
    title: "List tenants",
  },
  description: `
  This tool lists all tenants in your SuperTokens integration.

  ## Input:
  No input parameters required.

  ## Return Value
  A list of all tenants in your SuperTokens integration, or an error message if the operation failed.
  `,
  input: ListTenantsParametersSchema,
  handler: listTenantsHandler,
  recipes: ["multitenancy"],
};
