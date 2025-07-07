import EmailPassword from "supertokens-node/recipe/emailpassword";
import ThirdParty from "supertokens-node/recipe/thirdparty";
import Session from "supertokens-node/recipe/session";
import Dashboard from "supertokens-node/recipe/dashboard";
import UserRoles, { UserRoleClaim } from "supertokens-node/recipe/userroles";
import OAuth2Provider from "supertokens-node/recipe/oauth2provider";
import type { TypeInput } from "supertokens-node/types";
import { z } from "zod";

import { SuperTokensMcpServer, createPlugin } from "supertokens-mcp-plugin";
import SuperTokens from "supertokens-node";

const server = new SuperTokensMcpServer({
  name: "my-mcp",
  version: "1.0.0",
  path: "/mcp",
  validateTokenPayload: async (_accessTokenPayload, _userContext) => {
    return {
      status: "OK",
    };
  },
  claimValidators: [UserRoleClaim.validators.includes("admin")],
});

server.registerTool(
  "session-info",
  {
    inputSchema: {},
    description: "Get session information",
  },
  async (_args, extra) => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(extra.authInfo),
        },
      ],
      structuredContent: extra.authInfo as any,
    };
  }
);

server.registerTool(
  "my-email",
  {
    description: "Get the email of the current user",
    inputSchema: {},
    title: "My Email",
  },
  async (_args, extra) => {
    const userId = extra.authInfo?.extra?.sub as string;
    const user = await SuperTokens.getUser(userId);
    return {
      content: [
        { type: "text", text: JSON.stringify({ emails: user?.emails }) },
      ],
      structuredContent: {
        emails: user?.emails,
      },
    };
  }
);

server.registerTool(
  "add-two-numbers",
  {
    title: "Add Two Numbers",
    description: "Add two numbers together",
    inputSchema: {
      a: z.number(),
      b: z.number(),
    },
  },
  async (args) => {
    return {
      content: [
        { type: "text", text: JSON.stringify({ result: args.a + args.b }) },
      ],
      structuredContent: {
        result: args.a + args.b,
      },
    };
  }
);

export function getApiDomain() {
  const apiPort = 3001;
  const apiUrl = `http://localhost:${apiPort}`;
  return apiUrl;
}

export function getWebsiteDomain() {
  const websitePort = 3000;
  const websiteUrl = `http://localhost:${websitePort}`;
  return websiteUrl;
}

export const SuperTokensConfig: TypeInput = {
  supertokens: {
    connectionURI: "https://try.supertokens.com",
  },
  appInfo: {
    appName: "SuperTokens Demo App",
    apiDomain: getApiDomain(),
    websiteDomain: getWebsiteDomain(),
    apiBasePath: "/auth",
    websiteBasePath: "/auth",
  },
  recipeList: [
    EmailPassword.init(),
    ThirdParty.init({
      signInAndUpFeature: {
        providers: [
          {
            config: {
              thirdPartyId: "google",
              clients: [
                {
                  clientId:
                    "1060725074195-kmeum4crr01uirfl2op9kd5acmi9jutn.apps.googleusercontent.com",
                  clientSecret: "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",
                },
              ],
            },
          },
          {
            config: {
              thirdPartyId: "github",
              clients: [
                {
                  clientId: "467101b197249757c71f",
                  clientSecret: "e97051221f4b6426e8fe8d51486396703012f5bd",
                },
              ],
            },
          },
          {
            config: {
              thirdPartyId: "apple",
              clients: [
                {
                  clientId: "4398792-io.supertokens.example.service",
                  clientSecret: "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",
                  additionalConfig: {
                    keyId: "7M48Y4RYDL",
                    privateKey:
                      "-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgu8gXs+XYkqXD6Ala9Sf/iJXzhbwcoG5dMh1OonpdJUmgCgYIKoZIzj0DAQehRANCAASfrvlFbFCYqn3I2zeknYXLwtH30JuOKestDbSfZYxZNMqhF/OzdZFTV0zc5u5s3eN+oCWbnvl0hM+9IW0UlkdA\n-----END PRIVATE KEY-----",
                    teamId: "YWQCXGJRJL",
                  },
                },
              ],
            },
          },
          {
            config: {
              thirdPartyId: "twitter",
              clients: [
                {
                  clientId: "4398792-WXpqVXRiazdRMGNJdEZIa3RVQXc6MTpjaQ",
                  clientSecret:
                    "BivMbtwmcygbRLNQ0zk45yxvW246tnYnTFFq-LH39NwZMxFpdC",
                },
              ],
            },
          },
        ],
      },
    }),
    Dashboard.init({
      apiKey: "test",
    }),
    UserRoles.init(),
    Session.init(),
    OAuth2Provider.init(),
  ],
  experimental: {
    plugins: [
      createPlugin({
        mcpServers: [server],
      }),
    ],
  },
};
