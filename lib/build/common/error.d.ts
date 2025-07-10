import UserRoles from "supertokens-node/recipe/userroles";
import UserMetadata from "supertokens-node/recipe/usermetadata";
import Multitenancy from "supertokens-node/recipe/multitenancy";
import EmailPassword from "supertokens-node/recipe/emailpassword";
import Passwordless from "supertokens-node/recipe/passwordless";
import { RecipeName } from "./types";
type MCPServerErrorType = "MCP_TOOL_CALL_ERROR";
export declare class MCPServerError extends Error {
  type: MCPServerErrorType;
  constructor(message: string, type: MCPServerErrorType);
}
export declare function getMessageFromError(error: unknown): string;
export declare const RecipeNameToSDKObjectRecord: {
  readonly userroles: typeof UserRoles;
  readonly usermetadata: typeof UserMetadata;
  readonly multitenancy: typeof Multitenancy;
  readonly emailpassword: typeof EmailPassword;
  readonly passwordless: typeof Passwordless;
};
export declare function isRecipeAvailable(recipe: RecipeName): void | never;
export {};
