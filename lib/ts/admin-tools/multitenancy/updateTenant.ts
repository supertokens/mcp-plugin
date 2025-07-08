import { z } from "zod";
import Multitenancy from "supertokens-node/recipe/multitenancy";
import { Tool } from "@/common/types";

import { AuthenticationFactorSchema, CoreConfigSchema } from "@/common/schemas";
import { MCPServerError } from "@/common/error";

const UpdateTenantParametersSchema = z.object({
  tenantId: z.string().min(1).describe("The ID of the tenant to create"),
  firstFactors: z
    .array(AuthenticationFactorSchema)
    .optional()
    .describe(
      "Optional list of first factors to enable for this tenant. Items can be one of: emailpassword, thirdparty, passwordless, otp-email, link-phone, link-email"
    ),
  requiredSecondaryFactors: z
    .array(AuthenticationFactorSchema)
    .optional()
    .describe(
      "Optional list of required secondary factors for this tenant. Items can be one of: emailpassword, thirdparty, passwordless, otp-email, link-phone, link-email"
    ),
  coreConfig: CoreConfigSchema.optional(),
});

type UpdateTenantParameters = z.infer<typeof UpdateTenantParametersSchema>;

async function updateTenantHandler({
  tenantId,
  firstFactors,
  requiredSecondaryFactors,
  coreConfig,
}: UpdateTenantParameters) {
  const result = await Multitenancy.createOrUpdateTenant(tenantId, {
    firstFactors,
    requiredSecondaryFactors,
    coreConfig,
  });
  if (result.status !== "OK") {
    throw new MCPServerError(
      `Failed to update tenant - ${JSON.stringify(result)}`,
      "MCP_TOOL_CALL_ERROR"
    );
  }

  return "Tenant updated successfully";
}

export const UpdateTenantTool: Tool = {
  name: "update_tenant",
  annotations: {
    title: "Update tenant",
  },
  description: `
  This tool updates an existing tenant in your SuperTokens integration.

  ## Input:
  - tenantId: 
  ${UpdateTenantParametersSchema.shape.tenantId.description}
  - firstFactors: 
  ${UpdateTenantParametersSchema.shape.firstFactors.description}
  - requiredSecondaryFactors: 
  ${UpdateTenantParametersSchema.shape.requiredSecondaryFactors.description}
  - coreConfig: 
  Optional property.
  ${UpdateTenantParametersSchema.shape.coreConfig.description}

  ## Return Value
  A success message if the tenant was updated successfully, or an error message if the update failed.
  `,
  input: UpdateTenantParametersSchema,
  handler: updateTenantHandler,
  recipes: ["multitenancy"],
};
