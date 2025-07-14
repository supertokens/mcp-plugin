"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setToolContext = exports.getToolContext = exports.PLUGIN_ID = exports.PLUGIN_VERSION = void 0;
const schemas_1 = require("./schemas");
exports.PLUGIN_VERSION = "0.1.0";
exports.PLUGIN_ID = "supertokens-mcp-plugin";
let ToolContextValue = undefined;
const getToolContext = () => {
    if (!ToolContextValue) {
        throw new Error("Admin server config not set");
    }
    return ToolContextValue;
};
exports.getToolContext = getToolContext;
const setToolContext = (config) => {
    const envConfig = {
        appInfo: {
            appName: process.env.APP_NAME,
            apiDomain: process.env.API_DOMAIN,
            websiteDomain: process.env.WEBSITE_DOMAIN,
            apiBasePath: process.env.API_BASE_PATH,
            websiteBasePath: process.env.WEBSITE_BASE_PATH,
        },
        supertokens: {
            connectionURI: process.env.CONNECTION_URI,
            apiKey: process.env.API_KEY,
        },
    };
    const parsedConfig = schemas_1.ToolContextSchema.safeParse(config || envConfig);
    if (!parsedConfig.success) {
        throw new Error(`Invalid config: ${parsedConfig.error}`);
    }
    ToolContextValue = parsedConfig.data;
    return ToolContextValue;
};
exports.setToolContext = setToolContext;
