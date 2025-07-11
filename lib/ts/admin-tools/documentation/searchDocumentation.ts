import { z } from "zod";
import { Tool } from "../../common/types";
import { MCPServerError } from "../../common/error";

const SearchDocumentationParametersSchema = z.object({
  searchPhrase: z.string().describe(`The search phrase to use.`),
});

type SearchDocumentationParameters = z.infer<
  typeof SearchDocumentationParametersSchema
>;

const DocumenatationSearchEndpoint = `https://api.supertokens.com/website/documentation/search`;

async function searchDocumentationHandler({
  searchPhrase,
}: SearchDocumentationParameters) {
  const response = await fetch(DocumenatationSearchEndpoint, {
    method: "POST",
    body: JSON.stringify({ searchPhrase }),
  });
  if (!response.ok) {
    throw new MCPServerError(
      "Failed to search documentation",
      "MCP_TOOL_CALL_ERROR"
    );
  }

  const responseBody = (await response.json()) as {
    data: { url: string; pageTitle: string; matchedContent: string }[];
  };
  return { results: responseBody.data };
}

export const SearchDocumentationTool: Tool = {
  name: "search_documentation",
  annotations: {
    title: "Search documentation",
  },
  description: `
  Searches across the SuperTokens documentation for pages that match your search phrase.
  Use it to find relevant information when you don't have a specific URL or you don't know how to resolve a problem.
  Select an item from the returned list and use the "read_documentation" tool to access the documentation page.

  ## Search Tips

  - Use specific technical terms rather than general phrases
  - Include recipe names to narrow results (e.g., "emailpassword", "passwordless", "thirdparty", "multitenancy")

  ## Input:
  - phrase:
  ${SearchDocumentationParametersSchema.shape.searchPhrase.description}

  ## Return Value:
  List of search results where each item has the following fields:
  - url: The documentation page URL
  - pageTitle: The page title
  - matchedContent: The content that was matched
  `,
  input: SearchDocumentationParametersSchema,
  handler: searchDocumentationHandler,
  recipes: [],
};
