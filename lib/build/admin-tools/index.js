"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callTool = exports.Tools = void 0;
const logger_1 = require("../common/logger");
const readDocumentation_1 = require("./documentation/readDocumentation");
const searchDocumentation_1 = require("./documentation/searchDocumentation");
const listUsers_1 = require("./users/listUsers");
const getUser_1 = require("./users/getUser");
const listUserRoles_1 = require("./user-roles/listUserRoles");
const assignUserRole_1 = require("./user-roles/assignUserRole");
const removeUserRolePermission_1 = require("./user-roles/removeUserRolePermission");
const deleteUserRole_1 = require("./user-roles/deleteUserRole");
const unassignUserRole_1 = require("./user-roles/unassignUserRole");
const getUserRolePermissions_1 = require("./user-roles/getUserRolePermissions");
const listUsersByRole_1 = require("./user-roles/listUsersByRole");
const addUserRolePermission_1 = require("./user-roles/addUserRolePermission");
const addUserToTenant_1 = require("./multitenancy/addUserToTenant");
const createTenant_1 = require("./multitenancy/createTenant");
const deleteTenant_1 = require("./multitenancy/deleteTenant");
const getTenant_1 = require("./multitenancy/getTenant");
const listTenants_1 = require("./multitenancy/listTenants");
const removeUserFromTenant_1 = require("./multitenancy/removeUserFromTenant");
const updateTenant_1 = require("./multitenancy/updateTenant");
const updateUserEmailPasswordData_1 = require("./users/updateUserEmailPasswordData");
const updateUserPasswordlessData_1 = require("./users/updateUserPasswordlessData");
const createUserRole_1 = require("./user-roles/createUserRole");
const createUser_1 = require("./users/createUser");
const deleteUser_1 = require("./users/deleteUser");
const updateUserMetadata_1 = require("./user-metadata/updateUserMetadata");
const getUserMetadata_1 = require("./user-metadata/getUserMetadata");
const error_1 = require("../common/error");
const config_1 = require("../common/config");
exports.Tools = [
    // Documentation
    readDocumentation_1.ReadDocumentationTool,
    searchDocumentation_1.SearchDocumentationTool,
    // Users
    listUsers_1.ListUsersTool,
    getUser_1.GetUserTool,
    createUser_1.CreateUserTool,
    updateUserEmailPasswordData_1.UpdateUserEmailPasswordDataTool,
    updateUserPasswordlessData_1.UpdateUserPasswordlessDataTool,
    deleteUser_1.DeleteUserTool,
    // User Metadata
    updateUserMetadata_1.UpdateUserMetadataTool,
    getUserMetadata_1.GetUserMetadataTool,
    // User Roles
    listUserRoles_1.ListUserRolesTool,
    assignUserRole_1.AssignUserRoleTool,
    getUserRolePermissions_1.GetUserRolePermissionsTool,
    listUsersByRole_1.ListUsersByRoleTool,
    removeUserRolePermission_1.RemoveUserRolePermissionTool,
    createUserRole_1.CreateUserRoleTool,
    deleteUserRole_1.DeleteUserRoleTool,
    unassignUserRole_1.UnassignUserRoleTool,
    addUserRolePermission_1.AddUserRolePermissionTool,
    // Multitenancy
    createTenant_1.CreateTenantTool,
    deleteTenant_1.DeleteTenantTool,
    getTenant_1.GetTenantTool,
    listTenants_1.ListTenantsTool,
    removeUserFromTenant_1.RemoveUserFromTenantTool,
    updateTenant_1.UpdateTenantTool,
    addUserToTenant_1.AddUserToTenantTool,
];
async function callTool(tool, args) {
    (0, logger_1.logDebugMessage)(`Tool ${tool.name} called with the following arguments: ${JSON.stringify(args)}`);
    if (tool.recipes.length > 0) {
        tool.recipes.forEach((recipe) => (0, error_1.isRecipeAvailable)(recipe));
    }
    const parsedParameters = tool.input.safeParse(args);
    if (!parsedParameters.success) {
        return {
            isError: true,
            content: [
                { type: "text", text: String(parsedParameters.error) },
            ],
        };
    }
    try {
        const context = (0, config_1.getToolContext)();
        const result = await tool.handler(parsedParameters.data, context);
        const parsedResult = typeof result === "string" ? result : JSON.stringify(result);
        return {
            content: [{ type: "text", text: parsedResult }],
        };
    }
    catch (error) {
        (0, logger_1.logDebugMessage)("Tool call failed");
        (0, logger_1.logDebugMessage)((0, error_1.getMessageFromError)(error));
        if (error instanceof Error) {
            return {
                isError: true,
                content: [
                    {
                        type: "text",
                        text: `The tool call failed with then following error message:`,
                    },
                    { type: "text", text: error.message },
                ],
            };
        }
        return {
            isError: true,
            content: [
                {
                    type: "text",
                    text: `The tool call failed.`,
                },
            ],
        };
    }
}
exports.callTool = callTool;
