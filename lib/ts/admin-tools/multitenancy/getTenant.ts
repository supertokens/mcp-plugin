import { z } from "zod";
import Multitenancy from "supertokens-node/recipe/multitenancy";
import { Tool } from "@/common/types";
import { TenantIdSchema } from "@/common/schemas";
import { MCPServerError } from "@/common/error";

const GetTenantParametersSchema = z.object({
  tenantId: TenantIdSchema,
});

type GetTenantParameters = z.infer<typeof GetTenantParametersSchema>;

async function getTenantHandler({ tenantId }: GetTenantParameters) {
  const result = await Multitenancy.getTenant(tenantId);
  if (!result) {
    return "Tenant not found";
  }
  if (result.status !== "OK") {
    throw new MCPServerError(
      `Failed to get tenant - ${JSON.stringify(result)}`,
      "MCP_TOOL_CALL_ERROR"
    );
  }
  return result;
}

export const GetTenantTool: Tool = {
  name: "get_tenant",
  annotations: {
    title: "Get tenant",
  },
  description: `
  This tool retrieves the details of a tenant from your SuperTokens integration.

  ## Input:
  - tenantId: 
  ${GetTenantParametersSchema.shape.tenantId.description}

  ## Return Value
  The tenant details object containing information about the tenant's configuration.
  `,
  input: GetTenantParametersSchema,
  handler: getTenantHandler,
  recipes: ["multitenancy"],
};
