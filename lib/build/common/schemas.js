"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreConfigSchema = exports.AuthenticationFactorSchema = exports.TenantIdSchema = exports.ToolContextSchema = void 0;
const zod_1 = require("zod");
exports.ToolContextSchema = zod_1.z.object({
    appInfo: zod_1.z.object({
        appName: zod_1.z.string().min(1),
        apiDomain: zod_1.z.string().url(),
        websiteDomain: zod_1.z.string().url().optional(),
        apiBasePath: zod_1.z.string().optional().default("/auth"),
        websiteBasePath: zod_1.z.string().optional().default("/auth"),
        apiGatewayPath: zod_1.z.string().optional(),
    }),
    supertokens: zod_1.z.object({
        connectionURI: zod_1.z.string().url(),
        apiKey: zod_1.z.string().optional(),
    }),
});
exports.TenantIdSchema = zod_1.z
    .string()
    .default("public")
    .describe("The ID of the tenant that you are targeting. The property it's optional. If not provided, the public tenant will be used. If you are not using the multitenancy feature you can omit this argument.");
exports.AuthenticationFactorSchema = zod_1.z.union([
    zod_1.z.literal("emailpassword"),
    zod_1.z.literal("thirdparty"),
    zod_1.z.literal("otp-phone"),
    zod_1.z.literal("otp-email"),
    zod_1.z.literal("link-phone"),
    zod_1.z.literal("link-email"),
]);
exports.CoreConfigSchema = zod_1.z
    .object({
    // Token Validity Settings
    access_token_validity: zod_1.z.number().optional(),
    refresh_token_validity: zod_1.z.number().optional(),
    password_reset_token_lifetime: zod_1.z.number().optional(),
    email_verification_token_lifetime: zod_1.z.number().optional(),
    webauthn_recover_account_token_lifetime: zod_1.z.number().optional(),
    // Passwordless Settings
    passwordless_max_code_input_attempts: zod_1.z.number().optional(),
    passwordless_code_lifetime: zod_1.z.number().optional(),
    // TOTP Settings
    totp_max_attempts: zod_1.z.number().optional(),
    totp_rate_limit_cooldown_sec: zod_1.z.number().optional(),
    // Token Signing Settings
    access_token_signing_key_dynamic: zod_1.z.boolean().optional(),
    access_token_dynamic_signing_key_update_interval: zod_1.z.number().optional(),
    // Password Hashing Settings
    password_hashing_alg: zod_1.z.enum(["ARGON2", "BCRYPT"]).optional(),
    // Security Settings
    ip_allow_regex: zod_1.z.string().nullable().optional(),
    ip_deny_regex: zod_1.z.string().nullable().optional(),
    // OAuth Provider Settings
    oauth_provider_public_service_url: zod_1.z.string().nullable().optional(),
    oauth_provider_admin_service_url: zod_1.z.string().nullable().optional(),
    oauth_provider_consent_login_base_url: zod_1.z.string().nullable().optional(),
    oauth_provider_url_configured_in_oauth_provider: zod_1.z
        .string()
        .nullable()
        .optional(),
    // Migration Settings
    bulk_migration_parallelism: zod_1.z.number().optional(),
    bulk_migration_batch_size: zod_1.z.number().optional(),
    // Other Settings
    api_keys: zod_1.z.string().nullable().optional(),
    disable_telemetry: zod_1.z.boolean().optional(),
    supertokens_max_cdi_version: zod_1.z.string().nullable().optional(),
})
    .passthrough().describe(`
Core configuration object for SuperTokens tenant settings.

Token Validity Settings:
- access_token_validity: Time in seconds for how long an access token is valid for. Default: 3600 (1 hour)
- refresh_token_validity: Time in minutes for how long a refresh token is valid for. Default: 144000 (100 days)
- password_reset_token_lifetime: Time in milliseconds for password reset token validity. Default: 3600000 (1 hour)
- email_verification_token_lifetime: Time in milliseconds for email verification token validity. Default: 86400000 (1 day)
- webauthn_recover_account_token_lifetime: Time in milliseconds for WebAuthn account recovery token validity. Default: 3600000 (1 hour)

Passwordless Settings:
- passwordless_max_code_input_attempts: Maximum code input attempts per login. Default: 5
- passwordless_code_lifetime: Time in milliseconds for passwordless code validity. Default: 900000 (15 minutes)

TOTP Settings:
- totp_max_attempts: Maximum invalid TOTP attempts before rate limiting. Default: 5
- totp_rate_limit_cooldown_sec: Rate limit cooldown time in seconds. Default: 900 (15 minutes)

Token Signing Settings:
- access_token_signing_key_dynamic: Whether to use dynamic signing keys. Default: true
- access_token_dynamic_signing_key_update_interval: Hours between signing key updates. Default: 168 (1 week)

Password Hashing Settings:
- password_hashing_alg: Password hashing algorithm. Values: "ARGON2" | "BCRYPT". Default: "BCRYPT"

Security Settings:
- ip_allow_regex: Regex for allowing IP addresses. Default: null
- ip_deny_regex: Regex for denying IP addresses. Default: null

OAuth Provider Settings:
- oauth_provider_public_service_url: URL for OAuth provider public service. Default: null
- oauth_provider_admin_service_url: URL for OAuth provider admin service. Default: null
- oauth_provider_consent_login_base_url: Base URL for consent and login. Default: null
- oauth_provider_url_configured_in_oauth_provider: Internal OAuth provider URL. Default: null

Firebase Settings:
- firebase_password_hashing_signer_key: Signer key for Firebase scrypt hashing. Default: null

Migration Settings:
- bulk_migration_parallelism: Number of threads for user migration. Default: number of CPU cores
- bulk_migration_batch_size: Number of users per migration batch. Default: 8000

Other Settings:
- api_keys: Comma-separated API keys. Default: null
- disable_telemetry: Whether to disable telemetry. Default: false
- supertokens_max_cdi_version: Maximum CDI version to assume. Default: null

Important Notes:
- Protected configs (ip_allow_regex, ip_deny_regex, oauth_*_url) may not be visible/modifiable depending on setup
- All properties are optional and will merge with existing config
`);
