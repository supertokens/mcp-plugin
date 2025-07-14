"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRecipeAvailable = exports.RecipeNameToSDKObjectRecord = exports.getMessageFromError = exports.MCPServerError = void 0;
const userroles_1 = __importDefault(require("supertokens-node/recipe/userroles"));
const usermetadata_1 = __importDefault(require("supertokens-node/recipe/usermetadata"));
const multitenancy_1 = __importDefault(require("supertokens-node/recipe/multitenancy"));
const emailpassword_1 = __importDefault(require("supertokens-node/recipe/emailpassword"));
const passwordless_1 = __importDefault(require("supertokens-node/recipe/passwordless"));
class MCPServerError extends Error {
    type;
    constructor(message, type) {
        super(message);
        this.type = type;
    }
}
exports.MCPServerError = MCPServerError;
function getMessageFromError(error) {
    if (error instanceof Error || error instanceof MCPServerError) {
        return error.message;
    }
    return String(error);
}
exports.getMessageFromError = getMessageFromError;
exports.RecipeNameToSDKObjectRecord = {
    userroles: userroles_1.default,
    usermetadata: usermetadata_1.default,
    multitenancy: multitenancy_1.default,
    emailpassword: emailpassword_1.default,
    passwordless: passwordless_1.default,
};
// TODO: Find a better way to figure out if a recipe is available
function isRecipeAvailable(recipe) {
    const sdkObject = exports.RecipeNameToSDKObjectRecord[recipe];
    if (!sdkObject) {
        throw new MCPServerError(`Recipe ${recipe} is not available`, "MCP_TOOL_CALL_ERROR");
    }
    try {
        // @ts-expect-error
        sdkObject.init();
    }
    catch (error) {
        const message = getMessageFromError(error);
        if (message.includes("has already been initialised"))
            return;
    }
    throw new MCPServerError(`You need to initialize the ${recipe}`, "MCP_TOOL_CALL_ERROR");
}
exports.isRecipeAvailable = isRecipeAvailable;
