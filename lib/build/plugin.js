"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const session_1 = __importDefault(require("supertokens-node/recipe/session"));
const supertokens_js_override_1 = __importDefault(
  require("supertokens-js-override")
);
const config_1 = require("./common/config");
const logger_1 = require("./common/logger");
const pluginInterfaceImpl_1 = __importDefault(require("./pluginInterfaceImpl"));
function default_1(pluginConfig) {
  let pluginInterface;
  const claims = [];
  for (const server of pluginConfig?.mcpServers ?? []) {
    for (const claim of server.getClaims()) {
      if (!claims.includes(claim)) {
        claims.push(claim);
      }
    }
  }
  return {
    id: config_1.PLUGIN_ID,
    version: config_1.PLUGIN_VERSION,
    compatibleSDKVersions: ["23.0.0"],
    overrideMap: {
      oauth2provider: {
        recipeInitRequired: true,
        functions: (oI) => {
          return {
            ...oI,
            buildAccessTokenPayload: async (input) => {
              let payload = await oI.buildAccessTokenPayload(input);
              console.log("buildAccessTokenPayload", payload);
              if (input.sessionHandle === undefined) {
                return payload;
              }
              const session = await session_1.default.getSessionInformation(
                input.sessionHandle,
                input.userContext
              );
              if (session === undefined) {
                return payload;
              }
              const userId = session.userId;
              const recipeUserId = session.recipeUserId;
              const tenantId = session.tenantId;
              for (const claim of claims) {
                const claimValue = await claim.fetchValue(
                  userId,
                  recipeUserId,
                  tenantId,
                  payload,
                  input.userContext
                );
                payload = claim.addToPayload_internal(
                  payload,
                  claimValue,
                  input.userContext
                );
              }
              console.log("Final-buildAccessTokenPayload", payload);
              return payload;
            },
          };
        },
      },
      openid: {
        recipeInitRequired: true,
      },
      userroles: {
        recipeInitRequired: true,
      },
      usermetadata: {},
      multitenancy: {},
    },
    init: (config) => {
      pluginInterface = (0, pluginInterfaceImpl_1.default)(
        config.appInfo,
        pluginConfig
      );
      if (pluginConfig?.override) {
        const builder = new supertokens_js_override_1.default(pluginInterface);
        pluginInterface = builder.override(pluginConfig.override).build();
      }
      if (config.debug) {
        (0, logger_1.enableDebugLogs)();
      }
      if (!config.supertokens) {
        throw new Error("SuperTokens configuration is required");
      }
      (0, config_1.setToolContext)({
        appInfo: {
          appName: config.appInfo.appName,
          apiDomain: config.appInfo.apiDomain,
          websiteDomain: config.appInfo.websiteDomain,
          apiBasePath: config.appInfo.apiBasePath ?? "/auth",
          websiteBasePath: config.appInfo.websiteBasePath ?? "/auth",
          apiGatewayPath: config.appInfo.apiGatewayPath,
        },
        supertokens: {
          connectionURI: config.supertokens.connectionURI,
          apiKey: config.supertokens.apiKey,
        },
      });
    },
    routeHandlers: () => {
      const routeHandlers = [];
      if (pluginConfig?.mcpServers) {
        for (const server of pluginConfig.mcpServers) {
          for (const handler of server.getHandlers()) {
            routeHandlers.push(handler);
          }
        }
      }
      // handlers to support MCP auth
      routeHandlers.push({
        method: "get",
        path: "/.well-known/oauth-authorization-server",
        verifySessionOptions: {
          sessionRequired: false,
        },
        handler: async (_req, res, _session, userContext) => {
          let resp = await pluginInterface.wellKnownOAuthAuthorizationServer(
            userContext
          );
          await res.sendJSONResponse(resp);
          return null;
        },
      });
      routeHandlers.push({
        path: "/.well-known/oauth-protected-resource",
        method: "get",
        verifySessionOptions: { sessionRequired: false },
        handler: async (_req, res, _session, userContext) => {
          let resp = await pluginInterface.wellKnownOAuthProtectedResource(
            userContext
          );
          res.sendJSONResponse(resp);
          return null;
        },
      });
      routeHandlers.push({
        path: pluginConfig?.oauth?.registrationEndpoint ?? "/oauth/register",
        method: "post",
        verifySessionOptions: { sessionRequired: false },
        handler: async (req, res, _session, userContext) => {
          const response = await pluginInterface.registerOAuthClient(
            await req.getBodyAsJSONOrFormData(),
            userContext
          );
          if (response.status === "OK") {
            res.setStatusCode(201);
            res.sendJSONResponse(response);
          } else {
            res.setStatusCode(400);
            res.sendJSONResponse(response);
          }
          return null;
        },
      });
      routeHandlers.push({
        path: pluginConfig?.oauth?.clientsEndpoint ?? "/oauth/clients",
        method: "get",
        verifySessionOptions: { sessionRequired: false },
        handler: async (req, res, _session, userContext) => {
          const clientId = req.getKeyValueFromQuery("client_id");
          if (clientId === undefined) {
            res.setStatusCode(400);
            res.sendJSONResponse({
              status: "ERROR",
              error: "client_id is required",
              errorDescription: "client_id is required",
            });
            return null;
          }
          const response = await pluginInterface.getOAuthClient(
            clientId,
            userContext
          );
          if (response.status === "OK") {
            res.setStatusCode(200);
            res.sendJSONResponse(response);
          } else {
            res.setStatusCode(400);
            res.sendJSONResponse(response);
          }
          return null;
        },
      });
      routeHandlers.push({
        path: pluginConfig?.oauth?.clientsEndpoint ?? "/oauth/clients",
        method: "put",
        verifySessionOptions: { sessionRequired: false },
        handler: async (req, res, _session, userContext) => {
          const clientId = req.getKeyValueFromQuery("client_id");
          if (clientId === undefined) {
            res.setStatusCode(400);
            res.sendJSONResponse({
              status: "ERROR",
              error: "client_id is required",
              errorDescription: "client_id is required",
            });
            return null;
          }
          const response = await pluginInterface.updateOAuthClient(
            clientId,
            await req.getBodyAsJSONOrFormData(),
            userContext
          );
          if (response.status === "OK") {
            res.setStatusCode(200);
            res.sendJSONResponse(response);
          } else {
            res.setStatusCode(400);
            res.sendJSONResponse(response);
          }
          return null;
        },
      });
      routeHandlers.push({
        path: pluginConfig?.oauth?.clientsEndpoint ?? "/oauth/clients",
        method: "delete",
        verifySessionOptions: { sessionRequired: false },
        handler: async (req, res, _session, userContext) => {
          const clientId = req.getKeyValueFromQuery("client_id");
          if (clientId === undefined) {
            res.setStatusCode(400);
            res.sendJSONResponse({
              status: "ERROR",
              error: "client_id is required",
              errorDescription: "client_id is required",
            });
            return null;
          }
          const response = await pluginInterface.deleteOAuth2Client(
            clientId,
            userContext
          );
          if (response.status === "OK") {
            res.setStatusCode(200);
            res.sendJSONResponse(response);
          } else {
            res.setStatusCode(400);
            res.sendJSONResponse(response);
          }
          return null;
        },
      });
      return {
        status: "OK",
        routeHandlers,
      };
    },
  };
}
exports.default = default_1;
