"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserTool = exports.CreateUserParametersSchema = void 0;
const zod_1 = require("zod");
const error_1 = require("../../common/error");
const UserRoleSchema = zod_1.z
    .object({
    role: zod_1.z.string().describe("Role name"),
    tenantIds: zod_1.z
        .array(zod_1.z.string().describe("Tenant ID"))
        .describe("List of tenant IDs associated with the role"),
})
    .describe("User role with associated tenant IDs");
const TotpDeviceSchema = zod_1.z
    .object({
    secretKey: zod_1.z.string().describe("Secret key for TOTP device"),
    skew: zod_1.z.number().optional().describe("Allowed skew for TOTP in seconds"),
    period: zod_1.z
        .number()
        .optional()
        .describe("Time period for TOTP code validity in seconds"),
    deviceName: zod_1.z.string().optional().describe("Name of the TOTP device"),
})
    .describe("TOTP device configuration");
const BaseLoginMethodSchema = zod_1.z.object({
    tenantIds: zod_1.z
        .array(zod_1.z.string().describe("Tenant ID"))
        .optional()
        .default(["public"])
        .describe("Optional list of tenant IDs to which this login method will be associated"),
    isVerified: zod_1.z
        .boolean()
        .optional()
        .describe("Optional property which indicates whether the email is verified"),
    isPrimary: zod_1.z
        .boolean()
        .optional()
        .describe("Optional property that shows whether the login method is the primary login method"),
    timeJoinedInMSSinceEpoch: zod_1.z
        .number()
        .int()
        .optional()
        .describe("Optional property that specifies the time joined in milliseconds since the epoch"),
});
const EmailPasswordLoginMethodSchema = BaseLoginMethodSchema.extend({
    recipeId: zod_1.z
        .literal("emailpassword")
        .describe("Recipe ID for email/password login method"),
    email: zod_1.z.string().email().describe("User email"),
    passwordHash: zod_1.z.string().optional().describe("Hashed password"),
    plainTextPassword: zod_1.z
        .string()
        .optional()
        .describe("Plain text password (optional)"),
    hashingAlgorithm: zod_1.z
        .enum(["argon2", "bcrypt", "firebase_scrypt"])
        .describe("Algorithm used for hashing password"),
})
    .refine((value) => value.plainTextPassword || value.passwordHash, "Either passwordHash or plainTextPassword must be provided")
    .describe("Email/Password Login Method");
const ThirdPartyLoginMethodSchema = BaseLoginMethodSchema.extend({
    recipeId: zod_1.z
        .literal("thirdparty")
        .describe("Recipe ID for third party login method"),
    thirdPartyId: zod_1.z.string().describe("Third party provider ID"),
    thirdPartyUserId: zod_1.z.string().describe("User ID from third party provider"),
}).describe("Third Party Login Method");
const PasswordlessLoginMethodSchema = BaseLoginMethodSchema.extend({
    recipeId: zod_1.z
        .literal("passwordless")
        .describe("Recipe ID for passwordless login method"),
    phoneNumber: zod_1.z
        .string()
        .optional()
        .describe("Phone number used for passwordless login. Required if email is not provided"),
    email: zod_1.z
        .string()
        .optional()
        .describe("Email used for passwordless login. Required if phoneNumber is not provided"),
})
    .refine((value) => value.phoneNumber || value.email, "Either phoneNumber or email must be provided")
    .describe("Passwordless Login Method");
const LoginMethodSchema = zod_1.z
    .union([
    EmailPasswordLoginMethodSchema,
    ThirdPartyLoginMethodSchema,
    PasswordlessLoginMethodSchema,
])
    .describe("Login method, one of Email/Password, Third Party, or Passwordless");
exports.CreateUserParametersSchema = zod_1.z.object({
    externalUserId: zod_1.z
        .string()
        .optional()
        .describe("External user ID for the user"),
    userMetadata: zod_1.z
        .array(zod_1.z.record(zod_1.z.any()))
        .optional()
        .describe("Array of user metadata JSON objects. The array items valid JSON objects"),
    userRoles: zod_1.z.array(UserRoleSchema).optional().describe("Array of user roles"),
    totpDevices: zod_1.z
        .array(TotpDeviceSchema)
        .optional()
        .describe("Array of TOTP devices"),
    loginMethods: zod_1.z.array(LoginMethodSchema).describe("Array of login methods"),
    appId: zod_1.z.string().optional().default("public").describe("App ID"),
});
async function createUserHandler({ appId, ...user }, config) {
    const coreURI = config.supertokens.connectionURI;
    const apiKey = config.supertokens.apiKey;
    const endpoint = `/appid-${appId}/bulk-import/import`;
    const headers = {
        "Content-Type": "application/json",
    };
    if (apiKey) {
        headers["api-key"] = apiKey;
    }
    const response = await fetch(`${coreURI}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(user),
    });
    if (!response.ok) {
        throw new error_1.MCPServerError(`Failed to create user`, "MCP_TOOL_CALL_ERROR");
    }
    const data = (await response.json());
    if (data.status !== "OK") {
        throw new error_1.MCPServerError(`Failed to create user - ${JSON.stringify(data)}`, "MCP_TOOL_CALL_ERROR");
    }
    return `User created successfully with the following id: ${data.user.id}`;
}
exports.CreateUserTool = {
    name: "create_user",
    annotations: {
        title: "Create user",
    },
    description: `
  Creates a new user in your SuperTokens integration.

  ## Input:
  - externalUserId (optional): ${exports.CreateUserParametersSchema.shape.externalUserId.description}
  - userMetadata (optional): ${exports.CreateUserParametersSchema.shape.userMetadata.description}
  - userRoles (optional):  ${exports.CreateUserParametersSchema.shape.userRoles.description}  
    - role (required): ${UserRoleSchema.shape.role.description}
    - tenantIds (optional): ${UserRoleSchema.shape.tenantIds.description}
  - totpDevices (optional): ${exports.CreateUserParametersSchema.shape.totpDevices.description}
    - secretKey (required): ${TotpDeviceSchema.shape.secretKey.description}
    - skew (optional): ${TotpDeviceSchema.shape.skew.description}
    - period (optional): ${TotpDeviceSchema.shape.period.description}
    - deviceName (optional): ${TotpDeviceSchema.shape.deviceName.description}
  - loginMethods (required): ${exports.CreateUserParametersSchema.shape.loginMethods.description}
    - Email/Password: ${EmailPasswordLoginMethodSchema.description}
      - tenantIds (optional): ${EmailPasswordLoginMethodSchema._def.schema.shape.tenantIds.description}
      - isVerified (optional): ${EmailPasswordLoginMethodSchema._def.schema.shape.isVerified.description}
      - isPrimary (optional): ${EmailPasswordLoginMethodSchema._def.schema.shape.isPrimary.description}
      - timeJoinedInMSSinceEpoch (optional): ${EmailPasswordLoginMethodSchema._def.schema.shape.timeJoinedInMSSinceEpoch.description}
      - recipeId: ${EmailPasswordLoginMethodSchema._def.schema.shape.recipeId.description}
      - email (required): ${EmailPasswordLoginMethodSchema._def.schema.shape.email.description}
      - plainTextPassword (required): ${EmailPasswordLoginMethodSchema._def.schema.shape.plainTextPassword.description}
      - passwordHash (required): ${EmailPasswordLoginMethodSchema._def.schema.shape.passwordHash.description}
      - hashingAlgorithm (optional): ${EmailPasswordLoginMethodSchema._def.schema.shape.hashingAlgorithm.description}
    - Third Party: ${ThirdPartyLoginMethodSchema.description}
      - tenantIds (optional): ${ThirdPartyLoginMethodSchema.shape.tenantIds.description}
      - isVerified (optional): ${ThirdPartyLoginMethodSchema.shape.isVerified.description}
      - isPrimary (optional): ${ThirdPartyLoginMethodSchema.shape.isPrimary.description}
      - timeJoinedInMSSinceEpoch (optional): ${ThirdPartyLoginMethodSchema.shape.timeJoinedInMSSinceEpoch.description}
      - recipeId: ${ThirdPartyLoginMethodSchema.shape.recipeId.description}
      - thirdPartyId (required): ${ThirdPartyLoginMethodSchema.shape.thirdPartyId.description}
      - thirdPartyUserId (required): ${ThirdPartyLoginMethodSchema.shape.thirdPartyUserId.description}
    - Passwordless: ${PasswordlessLoginMethodSchema.description}
      - tenantIds (optional): ${PasswordlessLoginMethodSchema._def.schema.shape.tenantIds.description}
      - isVerified (optional): ${PasswordlessLoginMethodSchema._def.schema.shape.isVerified.description}
      - isPrimary (optional): ${PasswordlessLoginMethodSchema._def.schema.shape.isPrimary.description}
      - timeJoinedInMSSinceEpoch (optional): ${PasswordlessLoginMethodSchema._def.schema.shape.timeJoinedInMSSinceEpoch.description}
      - recipeId: ${PasswordlessLoginMethodSchema._def.schema.shape.recipeId.description}
      - phoneNumber (required): ${PasswordlessLoginMethodSchema._def.schema.shape.phoneNumber.description}
      - email (required): ${PasswordlessLoginMethodSchema._def.schema.shape.email.description}
  - appId (optional): App ID, defaults to 'public'

  ## Return Value
  Returns a success message with the created user's ID.
  `,
    input: exports.CreateUserParametersSchema,
    handler: createUserHandler,
    recipes: [],
};
