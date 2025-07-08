import { z } from "zod";
import Multitenancy from "supertokens-node/recipe/multitenancy";
import { Tool } from "@/common/types";
import { AuthenticationFactorSchema, CoreConfigSchema } from "@/common/schemas";
import { MCPServerError } from "@/common/error";

const CreateTenantParametersSchema = z.object({
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

type CreateTenantParameters = z.infer<typeof CreateTenantParametersSchema>;

async function createTenantHandler({
  tenantId,
  firstFactors,
  requiredSecondaryFactors,
  coreConfig,
}: CreateTenantParameters) {
  const result = await Multitenancy.createOrUpdateTenant(tenantId, {
    firstFactors,
    requiredSecondaryFactors,
    coreConfig,
  });
  if (result.status !== "OK") {
    throw new MCPServerError(
      `Failed to create tenant - ${JSON.stringify(result)}`,
      "MCP_TOOL_CALL_ERROR"
    );
  }
  return "Tenant created successfully";
}

export const CreateTenantTool: Tool = {
  name: "create_tenant",
  annotations: {
    title: "Create tenant",
  },
  description: `
  Creates a new tenant in your SuperTokens integration.

  ## Input:
  - tenantId: 
  ${CreateTenantParametersSchema.shape.tenantId.description}
  - firstFactors: 
  ${CreateTenantParametersSchema.shape.firstFactors.description}
  - requiredSecondaryFactors: 
  ${CreateTenantParametersSchema.shape.requiredSecondaryFactors.description}
  - coreConfig: 
  Optional property.
  ${CreateTenantParametersSchema.shape.coreConfig.description}

  ## Return Value
  A success message if the tenant was created successfully, or an error message if the creation failed.
  `,
  input: CreateTenantParametersSchema,
  handler: createTenantHandler,
  recipes: ["multitenancy"],
};
