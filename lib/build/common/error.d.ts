type MCPServerErrorType = "MCP_TOOL_CALL_ERROR";
export declare class MCPServerError extends Error {
    type: MCPServerErrorType;
    constructor(message: string, type: MCPServerErrorType);
}
export declare function getMessageFromError(error: unknown): string;
export {};
