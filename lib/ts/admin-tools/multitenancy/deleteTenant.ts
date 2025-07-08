import { z } from "zod";
import Multitenancy from "supertokens-node/recipe/multitenancy";
import { Tool } from "@/common/types";
import { MCPServerError } from "@/common/error";

const DeleteTenantParametersSchema = z.object({
  tenantId: z.string().min(1).describe("The ID of the tenant to delete"),
});

type DeleteTenantParameters = z.infer<typeof DeleteTenantParametersSchema>;

async function deleteTenantHandler({ tenantId }: DeleteTenantParameters) {
  const result = await Multitenancy.deleteTenant(tenantId);
  if (result.status !== "OK") {
    throw new MCPServerError(
      `Failed to delete tenant - ${JSON.stringify(result)}`,
      "MCP_TOOL_CALL_ERROR"
    );
  }
  return "Tenant deleted successfully";
}

export const DeleteTenantTool: Tool = {
  name: "delete_tenant",
  annotations: {
    title: "Delete tenant",
  },
  description: `
  This tool deletes a tenant from your SuperTokens integration.

  ## Input:
  - tenantId: 
  ${DeleteTenantParametersSchema.shape.tenantId.description}

  ## Return Value
  A success message if the tenant was deleted successfully, or an error message if the deletion failed.
  `,
  input: DeleteTenantParametersSchema,
  handler: deleteTenantHandler,
  recipes: ["multitenancy"],
};
