import { ToolContext } from "./types";
export declare const PLUGIN_VERSION = "0.1.0";
export declare const PLUGIN_ID = "supertokens-mcp-plugin";
export declare const getToolContext: () => {
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
};
export declare const setToolContext: (config?: ToolContext) => {
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
};
