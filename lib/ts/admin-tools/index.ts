import { Tool } from "../common/types";
import { logDebugMessage } from "../common/logger";

import { ReadDocumentationTool } from "./documentation/readDocumentation";
import { SearchDocumentationTool } from "./documentation/searchDocumentation";
import { ListUsersTool } from "./users/listUsers";
import { GetUserTool } from "./users/getUser";
import { ListUserRolesTool } from "./user-roles/listUserRoles";
import { AssignUserRoleTool } from "./user-roles/assignUserRole";
import { RemoveUserRolePermissionTool } from "./user-roles/removeUserRolePermission";
import { DeleteUserRoleTool } from "./user-roles/deleteUserRole";
import { UnassignUserRoleTool } from "./user-roles/unassignUserRole";
import { GetUserRolePermissionsTool } from "./user-roles/getUserRolePermissions";
import { ListUsersByRoleTool } from "./user-roles/listUsersByRole";
import { AddUserRolePermissionTool } from "./user-roles/addUserRolePermission";
import { AddUserToTenantTool } from "./multitenancy/addUserToTenant";
import { CreateTenantTool } from "./multitenancy/createTenant";
import { DeleteTenantTool } from "./multitenancy/deleteTenant";
import { GetTenantTool } from "./multitenancy/getTenant";
import { ListTenantsTool } from "./multitenancy/listTenants";
import { RemoveUserFromTenantTool } from "./multitenancy/removeUserFromTenant";
import { UpdateTenantTool } from "./multitenancy/updateTenant";
import { UpdateUserEmailPasswordDataTool } from "./users/updateUserEmailPasswordData";
import { UpdateUserPasswordlessDataTool } from "./users/updateUserPasswordlessData";
import { CreateUserRoleTool } from "./user-roles/createUserRole";
import { CreateUserTool } from "./users/createUser";
import { DeleteUserTool } from "./users/deleteUser";
import { UpdateUserMetadataTool } from "./user-metadata/updateUserMetadata";
import { GetUserMetadataTool } from "./user-metadata/getUserMetadata";
import { getMessageFromError, isRecipeAvailable } from "../common/error";
import { getToolContext } from "../common/config";

export const Tools: Tool[] = [
  // Documentation
  ReadDocumentationTool,
  SearchDocumentationTool,
  // Users
  ListUsersTool,
  GetUserTool,
  CreateUserTool,
  UpdateUserEmailPasswordDataTool,
  UpdateUserPasswordlessDataTool,
  DeleteUserTool,
  // User Metadata
  UpdateUserMetadataTool,
  GetUserMetadataTool,
  // User Roles
  ListUserRolesTool,
  AssignUserRoleTool,
  GetUserRolePermissionsTool,
  ListUsersByRoleTool,
  RemoveUserRolePermissionTool,
  CreateUserRoleTool,
  DeleteUserRoleTool,
  UnassignUserRoleTool,
  AddUserRolePermissionTool,
  // Multitenancy
  CreateTenantTool,
  DeleteTenantTool,
  GetTenantTool,
  ListTenantsTool,
  RemoveUserFromTenantTool,
  UpdateTenantTool,
  AddUserToTenantTool,
];

export async function callTool(tool: Tool, args: any) {
  logDebugMessage(
    `Tool ${tool.name} called with the following arguments: ${JSON.stringify(
      args
    )}`
  );
  if (tool.recipes.length > 0) {
    tool.recipes.forEach((recipe) => isRecipeAvailable(recipe));
  }

  const parsedParameters = tool.input.safeParse(args);
  if (!parsedParameters.success) {
    return {
      isError: true,
      content: [
        { type: "text" as const, text: String(parsedParameters.error) },
      ],
    };
  }
  try {
    const context = getToolContext();
    const result = await tool.handler(parsedParameters.data, context);
    const parsedResult =
      typeof result === "string" ? result : JSON.stringify(result);
    return {
      content: [{ type: "text" as const, text: parsedResult }],
    };
  } catch (error) {
    logDebugMessage("Tool call failed");
    logDebugMessage(getMessageFromError(error));
    if (error instanceof Error) {
      return {
        isError: true,
        content: [
          {
            type: "text" as const,
            text: `The tool call failed with then following error message:`,
          },
          { type: "text" as const, text: error.message },
        ],
      };
    }
    return {
      isError: true,
      content: [
        {
          type: "text" as const,
          text: `The tool call failed.`,
        },
      ],
    };
  }
}
