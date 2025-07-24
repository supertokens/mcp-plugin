"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchDocumentationTool = void 0;
const zod_1 = require("zod");
const error_1 = require("../../common/error");
const SearchDocumentationParametersSchema = zod_1.z.object({
    searchTerm: zod_1.z.string().describe(`The search phrase to use.`),
});
const DocumenatationSearchEndpoint = `https://api.supertokens.com/website/documentation/search`;
async function searchDocumentationHandler({ searchTerm, }) {
    const response = await fetch(DocumenatationSearchEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ searchTerm }),
    });
    if (!response.ok) {
        throw new error_1.MCPServerError("Failed to search documentation", "MCP_TOOL_CALL_ERROR");
    }
    const responseBody = (await response.json());
    return { results: responseBody.data };
}
exports.SearchDocumentationTool = {
    name: "search_documentation",
    annotations: {
        title: "Search documentation",
    },
    description: `
  Searches across the SuperTokens documentation for pages that match your query.
  Use it to find relevant information when you don't have a specific URL or you don't know how to resolve a problem.
  Select an item from the returned list and use the "read_documentation" tool to access the documentation page.

  ## Search Tips
  - Use specific technical terms rather than general phrases
  - Include recipe names to narrow results (e.g., "emailpassword", "passwordless", "thirdparty", "multitenancy")

  ## Input:
  - searchTerm:
  ${SearchDocumentationParametersSchema.shape.searchTerm.description}

  ## Return Value:
  List of search results where each item has the following fields:
  - url: The documentation page URL
  - title: The title of the section/page that was matched
  - content: The content that was matched
  - hierarchy: The nested hierarchy that points to where in the page is the match located
  - metadata: Information about that particular page (the recipe that it belongs to, the page type, etc.)
  `,
    input: SearchDocumentationParametersSchema,
    handler: searchDocumentationHandler,
    recipes: [],
};
