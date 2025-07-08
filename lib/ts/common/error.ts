import UserRoles from "supertokens-node/recipe/userroles";
import UserMetadata from "supertokens-node/recipe/usermetadata";
import Multitenancy from "supertokens-node/recipe/multitenancy";
import EmailPassword from "supertokens-node/recipe/emailpassword";
import Passwordless from "supertokens-node/recipe/passwordless";
import { RecipeName } from "./types";

type MCPServerErrorType = "MCP_TOOL_CALL_ERROR";

export class MCPServerError extends Error {
  type: MCPServerErrorType;
  constructor(message: string, type: MCPServerErrorType) {
    super(message);
    this.type = type;
  }
}

export function getMessageFromError(error: unknown) {
  if (error instanceof Error || error instanceof MCPServerError) {
    return error.message;
  }
  return String(error);
}

export const RecipeNameToSDKObjectRecord = {
  userroles: UserRoles,
  usermetadata: UserMetadata,
  multitenancy: Multitenancy,
  emailpassword: EmailPassword,
  passwordless: Passwordless,
} as const;

// TODO: Find a better way to figure out if a recipe is available
export function isRecipeAvailable(recipe: RecipeName): void | never {
  const sdkObject = RecipeNameToSDKObjectRecord[recipe];
  if (!sdkObject) {
    throw new MCPServerError(
      `Recipe ${recipe} is not available`,
      "MCP_TOOL_CALL_ERROR"
    );
  }

  try {
    // @ts-expect-error
    sdkObject.init();
  } catch (error) {
    const message = getMessageFromError(error);
    if (message.includes("has already been initialised")) return;
  }

  throw new MCPServerError(
    `You need to initialize the ${recipe}`,
    "MCP_TOOL_CALL_ERROR"
  );
}
