import { z } from "zod";
export declare const ToolContextSchema: z.ZodObject<{
    appInfo: z.ZodObject<{
        appName: z.ZodString;
        apiDomain: z.ZodString;
        websiteDomain: z.ZodOptional<z.ZodString>;
        apiBasePath: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        websiteBasePath: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        apiGatewayPath: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        appName: string;
        apiDomain: string;
        apiBasePath: string;
        websiteBasePath: string;
        websiteDomain?: string | undefined;
        apiGatewayPath?: string | undefined;
    }, {
        appName: string;
        apiDomain: string;
        websiteDomain?: string | undefined;
        apiBasePath?: string | undefined;
        websiteBasePath?: string | undefined;
        apiGatewayPath?: string | undefined;
    }>;
    supertokens: z.ZodObject<{
        connectionURI: z.ZodString;
        apiKey: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        connectionURI: string;
        apiKey?: string | undefined;
    }, {
        connectionURI: string;
        apiKey?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    appInfo: {
        appName: string;
        apiDomain: string;
        apiBasePath: string;
        websiteBasePath: string;
        websiteDomain?: string | undefined;
        apiGatewayPath?: string | undefined;
    };
    supertokens: {
        connectionURI: string;
        apiKey?: string | undefined;
    };
}, {
    appInfo: {
        appName: string;
        apiDomain: string;
        websiteDomain?: string | undefined;
        apiBasePath?: string | undefined;
        websiteBasePath?: string | undefined;
        apiGatewayPath?: string | undefined;
    };
    supertokens: {
        connectionURI: string;
        apiKey?: string | undefined;
    };
}>;
export declare const TenantIdSchema: z.ZodDefault<z.ZodString>;
export declare const AuthenticationFactorSchema: z.ZodUnion<[z.ZodLiteral<"emailpassword">, z.ZodLiteral<"thirdparty">, z.ZodLiteral<"otp-phone">, z.ZodLiteral<"otp-email">, z.ZodLiteral<"link-phone">, z.ZodLiteral<"link-email">]>;
export declare const CoreConfigSchema: z.ZodObject<{
    access_token_validity: z.ZodOptional<z.ZodNumber>;
    refresh_token_validity: z.ZodOptional<z.ZodNumber>;
    password_reset_token_lifetime: z.ZodOptional<z.ZodNumber>;
    email_verification_token_lifetime: z.ZodOptional<z.ZodNumber>;
    webauthn_recover_account_token_lifetime: z.ZodOptional<z.ZodNumber>;
    passwordless_max_code_input_attempts: z.ZodOptional<z.ZodNumber>;
    passwordless_code_lifetime: z.ZodOptional<z.ZodNumber>;
    totp_max_attempts: z.ZodOptional<z.ZodNumber>;
    totp_rate_limit_cooldown_sec: z.ZodOptional<z.ZodNumber>;
    access_token_signing_key_dynamic: z.ZodOptional<z.ZodBoolean>;
    access_token_dynamic_signing_key_update_interval: z.ZodOptional<z.ZodNumber>;
    password_hashing_alg: z.ZodOptional<z.ZodEnum<["ARGON2", "BCRYPT"]>>;
    ip_allow_regex: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ip_deny_regex: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    oauth_provider_public_service_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    oauth_provider_admin_service_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    oauth_provider_consent_login_base_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    oauth_provider_url_configured_in_oauth_provider: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    bulk_migration_parallelism: z.ZodOptional<z.ZodNumber>;
    bulk_migration_batch_size: z.ZodOptional<z.ZodNumber>;
    api_keys: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    disable_telemetry: z.ZodOptional<z.ZodBoolean>;
    supertokens_max_cdi_version: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    access_token_validity: z.ZodOptional<z.ZodNumber>;
    refresh_token_validity: z.ZodOptional<z.ZodNumber>;
    password_reset_token_lifetime: z.ZodOptional<z.ZodNumber>;
    email_verification_token_lifetime: z.ZodOptional<z.ZodNumber>;
    webauthn_recover_account_token_lifetime: z.ZodOptional<z.ZodNumber>;
    passwordless_max_code_input_attempts: z.ZodOptional<z.ZodNumber>;
    passwordless_code_lifetime: z.ZodOptional<z.ZodNumber>;
    totp_max_attempts: z.ZodOptional<z.ZodNumber>;
    totp_rate_limit_cooldown_sec: z.ZodOptional<z.ZodNumber>;
    access_token_signing_key_dynamic: z.ZodOptional<z.ZodBoolean>;
    access_token_dynamic_signing_key_update_interval: z.ZodOptional<z.ZodNumber>;
    password_hashing_alg: z.ZodOptional<z.ZodEnum<["ARGON2", "BCRYPT"]>>;
    ip_allow_regex: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ip_deny_regex: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    oauth_provider_public_service_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    oauth_provider_admin_service_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    oauth_provider_consent_login_base_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    oauth_provider_url_configured_in_oauth_provider: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    bulk_migration_parallelism: z.ZodOptional<z.ZodNumber>;
    bulk_migration_batch_size: z.ZodOptional<z.ZodNumber>;
    api_keys: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    disable_telemetry: z.ZodOptional<z.ZodBoolean>;
    supertokens_max_cdi_version: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    access_token_validity: z.ZodOptional<z.ZodNumber>;
    refresh_token_validity: z.ZodOptional<z.ZodNumber>;
    password_reset_token_lifetime: z.ZodOptional<z.ZodNumber>;
    email_verification_token_lifetime: z.ZodOptional<z.ZodNumber>;
    webauthn_recover_account_token_lifetime: z.ZodOptional<z.ZodNumber>;
    passwordless_max_code_input_attempts: z.ZodOptional<z.ZodNumber>;
    passwordless_code_lifetime: z.ZodOptional<z.ZodNumber>;
    totp_max_attempts: z.ZodOptional<z.ZodNumber>;
    totp_rate_limit_cooldown_sec: z.ZodOptional<z.ZodNumber>;
    access_token_signing_key_dynamic: z.ZodOptional<z.ZodBoolean>;
    access_token_dynamic_signing_key_update_interval: z.ZodOptional<z.ZodNumber>;
    password_hashing_alg: z.ZodOptional<z.ZodEnum<["ARGON2", "BCRYPT"]>>;
    ip_allow_regex: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ip_deny_regex: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    oauth_provider_public_service_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    oauth_provider_admin_service_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    oauth_provider_consent_login_base_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    oauth_provider_url_configured_in_oauth_provider: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    bulk_migration_parallelism: z.ZodOptional<z.ZodNumber>;
    bulk_migration_batch_size: z.ZodOptional<z.ZodNumber>;
    api_keys: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    disable_telemetry: z.ZodOptional<z.ZodBoolean>;
    supertokens_max_cdi_version: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.ZodTypeAny, "passthrough">>;
