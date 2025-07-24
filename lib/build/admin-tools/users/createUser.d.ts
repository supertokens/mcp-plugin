import { z } from "zod";
import { Tool } from "../../common/types";
export declare const CreateUserParametersSchema: z.ZodObject<{
    externalUserId: z.ZodOptional<z.ZodString>;
    userMetadata: z.ZodOptional<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodAny>, "many">>;
    userRoles: z.ZodOptional<z.ZodArray<z.ZodObject<{
        role: z.ZodString;
        tenantIds: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        tenantIds: string[];
        role: string;
    }, {
        tenantIds: string[];
        role: string;
    }>, "many">>;
    totpDevices: z.ZodOptional<z.ZodArray<z.ZodObject<{
        secretKey: z.ZodString;
        skew: z.ZodOptional<z.ZodNumber>;
        period: z.ZodOptional<z.ZodNumber>;
        deviceName: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        secretKey: string;
        skew?: number | undefined;
        period?: number | undefined;
        deviceName?: string | undefined;
    }, {
        secretKey: string;
        skew?: number | undefined;
        period?: number | undefined;
        deviceName?: string | undefined;
    }>, "many">>;
    loginMethods: z.ZodArray<z.ZodUnion<[z.ZodEffects<z.ZodObject<{
        tenantIds: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
        isVerified: z.ZodOptional<z.ZodBoolean>;
        isPrimary: z.ZodOptional<z.ZodBoolean>;
        timeJoinedInMSSinceEpoch: z.ZodOptional<z.ZodNumber>;
    } & {
        recipeId: z.ZodLiteral<"emailpassword">;
        email: z.ZodString;
        passwordHash: z.ZodOptional<z.ZodString>;
        plainTextPassword: z.ZodOptional<z.ZodString>;
        hashingAlgorithm: z.ZodEnum<["argon2", "bcrypt", "firebase_scrypt"]>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        tenantIds: string[];
        recipeId: "emailpassword";
        hashingAlgorithm: "argon2" | "bcrypt" | "firebase_scrypt";
        isVerified?: boolean | undefined;
        isPrimary?: boolean | undefined;
        timeJoinedInMSSinceEpoch?: number | undefined;
        passwordHash?: string | undefined;
        plainTextPassword?: string | undefined;
    }, {
        email: string;
        recipeId: "emailpassword";
        hashingAlgorithm: "argon2" | "bcrypt" | "firebase_scrypt";
        tenantIds?: string[] | undefined;
        isVerified?: boolean | undefined;
        isPrimary?: boolean | undefined;
        timeJoinedInMSSinceEpoch?: number | undefined;
        passwordHash?: string | undefined;
        plainTextPassword?: string | undefined;
    }>, {
        email: string;
        tenantIds: string[];
        recipeId: "emailpassword";
        hashingAlgorithm: "argon2" | "bcrypt" | "firebase_scrypt";
        isVerified?: boolean | undefined;
        isPrimary?: boolean | undefined;
        timeJoinedInMSSinceEpoch?: number | undefined;
        passwordHash?: string | undefined;
        plainTextPassword?: string | undefined;
    }, {
        email: string;
        recipeId: "emailpassword";
        hashingAlgorithm: "argon2" | "bcrypt" | "firebase_scrypt";
        tenantIds?: string[] | undefined;
        isVerified?: boolean | undefined;
        isPrimary?: boolean | undefined;
        timeJoinedInMSSinceEpoch?: number | undefined;
        passwordHash?: string | undefined;
        plainTextPassword?: string | undefined;
    }>, z.ZodObject<{
        tenantIds: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
        isVerified: z.ZodOptional<z.ZodBoolean>;
        isPrimary: z.ZodOptional<z.ZodBoolean>;
        timeJoinedInMSSinceEpoch: z.ZodOptional<z.ZodNumber>;
    } & {
        recipeId: z.ZodLiteral<"thirdparty">;
        thirdPartyId: z.ZodString;
        thirdPartyUserId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        tenantIds: string[];
        recipeId: "thirdparty";
        thirdPartyId: string;
        thirdPartyUserId: string;
        isVerified?: boolean | undefined;
        isPrimary?: boolean | undefined;
        timeJoinedInMSSinceEpoch?: number | undefined;
    }, {
        recipeId: "thirdparty";
        thirdPartyId: string;
        thirdPartyUserId: string;
        tenantIds?: string[] | undefined;
        isVerified?: boolean | undefined;
        isPrimary?: boolean | undefined;
        timeJoinedInMSSinceEpoch?: number | undefined;
    }>, z.ZodEffects<z.ZodObject<{
        tenantIds: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
        isVerified: z.ZodOptional<z.ZodBoolean>;
        isPrimary: z.ZodOptional<z.ZodBoolean>;
        timeJoinedInMSSinceEpoch: z.ZodOptional<z.ZodNumber>;
    } & {
        recipeId: z.ZodLiteral<"passwordless">;
        phoneNumber: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        tenantIds: string[];
        recipeId: "passwordless";
        email?: string | undefined;
        phoneNumber?: string | undefined;
        isVerified?: boolean | undefined;
        isPrimary?: boolean | undefined;
        timeJoinedInMSSinceEpoch?: number | undefined;
    }, {
        recipeId: "passwordless";
        email?: string | undefined;
        phoneNumber?: string | undefined;
        tenantIds?: string[] | undefined;
        isVerified?: boolean | undefined;
        isPrimary?: boolean | undefined;
        timeJoinedInMSSinceEpoch?: number | undefined;
    }>, {
        tenantIds: string[];
        recipeId: "passwordless";
        email?: string | undefined;
        phoneNumber?: string | undefined;
        isVerified?: boolean | undefined;
        isPrimary?: boolean | undefined;
        timeJoinedInMSSinceEpoch?: number | undefined;
    }, {
        recipeId: "passwordless";
        email?: string | undefined;
        phoneNumber?: string | undefined;
        tenantIds?: string[] | undefined;
        isVerified?: boolean | undefined;
        isPrimary?: boolean | undefined;
        timeJoinedInMSSinceEpoch?: number | undefined;
    }>]>, "many">;
    appId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    loginMethods: ({
        email: string;
        tenantIds: string[];
        recipeId: "emailpassword";
        hashingAlgorithm: "argon2" | "bcrypt" | "firebase_scrypt";
        isVerified?: boolean | undefined;
        isPrimary?: boolean | undefined;
        timeJoinedInMSSinceEpoch?: number | undefined;
        passwordHash?: string | undefined;
        plainTextPassword?: string | undefined;
    } | {
        tenantIds: string[];
        recipeId: "thirdparty";
        thirdPartyId: string;
        thirdPartyUserId: string;
        isVerified?: boolean | undefined;
        isPrimary?: boolean | undefined;
        timeJoinedInMSSinceEpoch?: number | undefined;
    } | {
        tenantIds: string[];
        recipeId: "passwordless";
        email?: string | undefined;
        phoneNumber?: string | undefined;
        isVerified?: boolean | undefined;
        isPrimary?: boolean | undefined;
        timeJoinedInMSSinceEpoch?: number | undefined;
    })[];
    appId: string;
    externalUserId?: string | undefined;
    userMetadata?: Record<string, any>[] | undefined;
    userRoles?: {
        tenantIds: string[];
        role: string;
    }[] | undefined;
    totpDevices?: {
        secretKey: string;
        skew?: number | undefined;
        period?: number | undefined;
        deviceName?: string | undefined;
    }[] | undefined;
}, {
    loginMethods: ({
        email: string;
        recipeId: "emailpassword";
        hashingAlgorithm: "argon2" | "bcrypt" | "firebase_scrypt";
        tenantIds?: string[] | undefined;
        isVerified?: boolean | undefined;
        isPrimary?: boolean | undefined;
        timeJoinedInMSSinceEpoch?: number | undefined;
        passwordHash?: string | undefined;
        plainTextPassword?: string | undefined;
    } | {
        recipeId: "thirdparty";
        thirdPartyId: string;
        thirdPartyUserId: string;
        tenantIds?: string[] | undefined;
        isVerified?: boolean | undefined;
        isPrimary?: boolean | undefined;
        timeJoinedInMSSinceEpoch?: number | undefined;
    } | {
        recipeId: "passwordless";
        email?: string | undefined;
        phoneNumber?: string | undefined;
        tenantIds?: string[] | undefined;
        isVerified?: boolean | undefined;
        isPrimary?: boolean | undefined;
        timeJoinedInMSSinceEpoch?: number | undefined;
    })[];
    externalUserId?: string | undefined;
    userMetadata?: Record<string, any>[] | undefined;
    userRoles?: {
        tenantIds: string[];
        role: string;
    }[] | undefined;
    totpDevices?: {
        secretKey: string;
        skew?: number | undefined;
        period?: number | undefined;
        deviceName?: string | undefined;
    }[] | undefined;
    appId?: string | undefined;
}>;
export declare const CreateUserTool: Tool;
