import { z } from "zod";
import { Tool } from "@/common/types";
import { logDebugMessage } from "../../common/logger";
import { MCPServerError } from "../../common/error";

const ReadDocumentationParametersSchema = z.object({
  url: z
    .string()
    .url({
      message: "Invalid URL format",
    })
    .refine(
      (url) => {
        try {
          const parsedUrl = new URL(url);
          const allowedDomains = ["supertokens.com"];
          const validProtocols = ["https:", "http:"];

          return (
            validProtocols.includes(parsedUrl.protocol) &&
            allowedDomains.includes(parsedUrl.hostname) &&
            parsedUrl.pathname.startsWith("/docs")
          );
        } catch {
          return false;
        }
      },
      {
        message:
          "The URL should be a valid SuperTokens documentation URL (https://supertokens.com/docs/additional-verification/email-verification/initial-setup)",
      }
    ).describe(`
URL of the SuperTokens documentation page to read
  - Must be from the supertokens.com domain
  - Must have a path that starts with /docs
Examples:
  - https://supertokens.com/docs/additional-verification/email-verification/initial-setup
  - https://supertokens.com/docs/authentication/passwordless/initial-setup 
`),
  offset: z
    .number()
    .optional()
    .default(0)
    .describe(
      "The offset (number of characters) to start reading from. Optional argument. If not provided, the server will read from the beginning of the page"
    ),
  length: z
    .number()
    .optional()
    .describe(
      "The number of characters that should be read. Optional argument. If not provided, the entire page will be read"
    ),
});

type ReadDocumentationParameters = z.infer<
  typeof ReadDocumentationParametersSchema
>;

async function readDocumentationHandler({ url }: ReadDocumentationParameters) {
  const processedUrl = new URL(url);
  const mardkdownUrl = `${processedUrl.origin}${processedUrl.pathname}.md`;
  logDebugMessage(`Reading documentation from ${mardkdownUrl}`);

  const response = await fetch(mardkdownUrl);
  if (!response.ok) {
    throw new MCPServerError(
      `Failed to fetch documentation from ${url}`,
      "MCP_TOOL_CALL_ERROR"
    );
  }

  return await response.text();
}

export const ReadDocumentationTool: Tool = {
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
