"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadDocumentationTool = void 0;
const zod_1 = require("zod");
const logger_1 = require("../../common/logger");
const error_1 = require("../../common/error");
const ReadDocumentationParametersSchema = zod_1.z.object({
    url: zod_1.z
        .string()
        .url({
        message: "Invalid URL format",
    })
        .refine((url) => {
        try {
            const parsedUrl = new URL(url);
            const allowedDomains = ["supertokens.com"];
            const validProtocols = ["https:", "http:"];
            return (validProtocols.includes(parsedUrl.protocol) &&
                allowedDomains.includes(parsedUrl.hostname) &&
                parsedUrl.pathname.startsWith("/docs"));
        }
        catch {
            return false;
        }
    }, {
        message: "The URL should be a valid SuperTokens documentation URL (https://supertokens.com/docs/additional-verification/email-verification/initial-setup)",
    }).describe(`
URL of the SuperTokens documentation page to read
  - Must be from the supertokens.com domain
  - Must have a path that starts with /docs
Examples:
  - https://supertokens.com/docs/additional-verification/email-verification/initial-setup
  - https://supertokens.com/docs/authentication/passwordless/initial-setup 
`),
    offset: zod_1.z
        .number()
        .optional()
        .default(0)
        .describe("The offset (number of characters) to start reading from. Optional argument. If not provided, the server will read from the beginning of the page"),
    length: zod_1.z
        .number()
        .optional()
        .describe("The number of characters that should be read. Optional argument. If not provided, the entire page will be read"),
});
async function readDocumentationHandler({ url }) {
    const processedUrl = new URL(url);
    const mardkdownUrl = `${processedUrl.origin}${processedUrl.pathname}.md`;
    (0, logger_1.logDebugMessage)(`Reading documentation from ${mardkdownUrl}`);
    const response = await fetch(mardkdownUrl);
    if (!response.ok) {
        throw new error_1.MCPServerError(`Failed to fetch documentation from ${url}`, "MCP_TOOL_CALL_ERROR");
    }
    return await response.text();
}
exports.ReadDocumentationTool = {
    name: "read_documentation",
    annotations: {
        title: "Read documentation",
    },
    description: `
  Retrieves the content of a SuperTokens documentation page and converts it to markdown format.
  If the document is too long use the offset and length parameters to read only a portion of it. 

  ## Input:
  - url:
  ${ReadDocumentationParametersSchema.shape.url.description}
  - offset:
  ${ReadDocumentationParametersSchema.shape.offset.description}
  - length:
  ${ReadDocumentationParametersSchema.shape.length.description}

  ## Return Value:
  Markdown content of the SuperTokens documentation

  The output is formatted as markdown text with:
  - Preserved headings and structure
  - Code blocks for examples
  - Lists and tables converted to markdown format
  `,
    input: ReadDocumentationParametersSchema,
    handler: readDocumentationHandler,
    recipes: [],
};
