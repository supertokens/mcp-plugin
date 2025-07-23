# SuperTokens MCP Plugin

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)

## Installation

```bash
npm install --save supertokens-mcp-plugin
```

## Usage

### Integrating MCP server with the application

**Create an MCP server**

Create `SuperTokensMcpServer`

```ts
import { SuperTokensMcpServer } from "supertokens-mcp-plugin";

const mcpServer = new SuperTokensMcpServer({
  name: "demo-server",
  version: "1.0.0",

  // Supertokens specific
  path: "/mcp", // Endpoint where the mcp will be available

  // There are two ways to validate the mcp request
  // 1.
  validateTokenPayload: (accessTokenPayload, userContext) => {
    // Validate access to the MCP based on the `accessTokenPayload`
    return { status: "OK" };
    // or return { status: "ERROR", message: "error message" }
    // returning error will result in 403 Forbidden
  },

  // 2.
  claimValidators: [
    // Standard Supertokens Session claim validators such as...
    UserRoleClaim.validators.includes("admin", 99999),
    // Make sure to use a large maxAge in the validators since OAuth2 Access token cannot be updated by fetching value again
  ],
});
```

**Register MCP tools**

```ts
mcpServer
  .registerTool
  // ... standard MCP tool registration
  ();
```

You can also expose each tool as a POST API by doing the following:

```ts
mcpServer.registerToolWithAPI(
  "tool-name",
  "/api/tool-name"
  // ... rest of the standard MCP tool parameters
);
```

**Enable the MCP Plugin**

Finally include the MCP Plugin in the `Supertokens.init`

```ts
import SuperTokensMcpPlugin from "supertokens-mcp-plugin";
import SuperTokens from "supertokens-node";

SuperTokens.init({
  // ... supertokens config
  experimental: {
    plugins: [
      SuperTokensMcpPlugin.init({
        mcpServers: [mcpServer],
      }),
    ],
  },
});
```

Note: OAuth2Provider recipe must be initialised for the MCP authentication to work.

## Admin Server

You can use the Admin MCP server in two ways:

- over HTTP, as an endpoint exposed by your current server
- as a CLI script, over STDIO

### Using HTTP

1. Install the plugin

```bash
npm install --save supertokens-mcp-plugin
```

2. Update the SDK configuration

```ts
import UserRoles, { UserRoleClaim } from "supertokens-node/recipe/userroles";
import OAuth2Provider from "supertokens-node/recipe/oauth2provider";
import SuperTokensMcpPlugin, {
  SuperTokensAdminMcpServer,
} from "supertokens-mcp-plugin";

const adminMcpServer = new SuperTokensAdminMcpServer({
  path: "/mcp/admin",
  validateTokenPayload: async (accessTokenPayload) => {
    // Use custom logic to authenticate who can access the admin MCP server
    return { status: "OK" };
  },
  claimValidators: [UserRoleClaim.validators.includes("admin")],
});

export const SuperTokensConfig = {
  supertokens: {
    connectionURI: "<SUPERTOKENS_CONNECTION_URI>",
    apiKey: "<SUPERTOKENS_API_KEY>",
  },
  appInfo: {
    appName: "<APP_NAME>",
    apiDomain: "<API_DOMAIN>",
    websiteDomain: "<WEBSITE_DOMAIN>",
    apiBasePath: "<API_BASE_PATH>",
    websiteBasePath: "<WEBSITE_BASE_PATH>",
  },
  recipeList: [
    // Include your existing recipes here
    // The OAuth2Provider recipe is required for the MCP authorization process
    OAuth2Provider.init(),
  ],
  // Pass the MCP server through the plguin configuration section
  experimental: {
    plugins: [
      SuperTokensMcpPlugin.init({
        mcpServers: [adminMcpServer],
      }),
    ],
  },
};
```

3. Add the MCP server in a client configuration

```json
{
  "mcpServers": {
    "server-with-authentication": {
      "command": "npx",
      "args": ["mcp-remote", "<API_DOMAIN>/mcp/admin"]
    }
  }
}
```

### Using STDIO

You can run it directly through `npx`. You have to provide a set of environment variables that match the SDK configuration values.
Here's an example configuration for `Claude Desktop`:

```json
{
  "mcpServers": {
    "stripe": {
      "command": "npx",
      "args": ["-y", "supertokens-mcp-plugin", "--stdio"],
      "env": {
        "APP_NAME": "<APP_NAME>",
        "API_DOMAIN": "<API_DOMAIN>",
        "WEBSITE_DOMAIN": "<WEBSITE_DOMAIN>",
        "API_BASE_PATH": "<API_BASE_PATH>",
        "WEBSITE_BASE_PATH": "<WEBSITE_BASE_PATH>",
        "CONNECTION_URI": "<CONNECTION_URI>",
        "API_KEY": "<API_KEY>"
      }
    }
  }
}
```

Add the snippet to your `claude_desktop_config.json` file.
