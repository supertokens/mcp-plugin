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
        return { status: "OK" }
        // or return { status: "ERROR", message: "error message" }
        // returning error will result in 403 Forbidden
    },

    // 2.
    claimValidators: [
        // Standard Supertokens Session claim validators such as...
        UserRoleClaim.validators.includes("admin", 99999)
        // Make sure to use a large maxAge in the validators since OAuth2 Access token cannot be updated by fetching value again
    ]
});
```

**Register MCP tools**

```ts
mcpServer.registerTool(
    // ... standard MCP tool registration
)
```

You can also expose each tool as a POST API by doing the following:

```ts
mcpServer.registerToolWithAPI(
    "tool-name",
    "/api/tool-name",
    // ... rest of the standard MCP tool parameters
)
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
        ]
    }
})
```
