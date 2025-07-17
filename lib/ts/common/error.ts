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
