"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(_pluginConfig) {
  return {
    id: "st-mcp",
    version: "1.0.0",
    compatibleSDKVersions: [],
    overrideMap: {
      oauth2provider: {
        recipeInitRequired: true,
      },
    },
    routeHandlers: () => {
      return {
        status: "OK",
        routeHandlers: [],
      };
    },
  };
}
exports.default = default_1;
