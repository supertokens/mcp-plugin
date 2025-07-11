"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTenantTool = void 0;
const zod_1 = require("zod");
const multitenancy_1 = __importDefault(
  require("supertokens-node/recipe/multitenancy")
);
const schemas_1 = require("../../common/schemas");
const error_1 = require("../../common/error");
const UpdateTenantParametersSchema = zod_1.z.object({
  tenantId: zod_1.z.string().min(1).describe("The ID of the tenant to create"),
  firstFactors: zod_1.z
    .array(schemas_1.AuthenticationFactorSchema)
    .optional()
    .describe(
      "Optional list of first factors to enable for this tenant. Items can be one of: emailpassword, thirdparty, passwordless, otp-email, link-phone, link-email"
    ),
  requiredSecondaryFactors: zod_1.z
    .array(schemas_1.AuthenticationFactorSchema)
    .optional()
    .describe(
      "Optional list of required secondary factors for this tenant. Items can be one of: emailpassword, thirdparty, passwordless, otp-email, link-phone, link-email"
    ),
  coreConfig: schemas_1.CoreConfigSchema.optional(),
});
async function updateTenantHandler({
  tenantId,
  firstFactors,
  requiredSecondaryFactors,
  coreConfig,
}) {
  const result = await multitenancy_1.default.createOrUpdateTenant(tenantId, {
    firstFactors,
    requiredSecondaryFactors,
    coreConfig,
  });
  if (result.status !== "OK") {
    throw new error_1.MCPServerError(
      `Failed to update tenant - ${JSON.stringify(result)}`,
      "MCP_TOOL_CALL_ERROR"
    );
  }
  return "Tenant updated successfully";
}
exports.UpdateTenantTool = {
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
