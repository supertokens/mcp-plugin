import debug from "debug";
import { ADMIN_MCP_TRANSPORT, PLUGIN_VERSION } from "./config";

const PLUGIN_DEBUG_NAMESPACE = "com.supertokens-mcp";

export function logDebugMessage(message: string) {
  if (!isLoggingEnabled()) {
    return;
  }

  const formattedMessage = `{t: "${new Date().toISOString()}", message: \"${message}\", pluginVersion: "${PLUGIN_VERSION}"}`;

  if (ADMIN_MCP_TRANSPORT !== "stdio") {
    debug(PLUGIN_DEBUG_NAMESPACE)(formattedMessage);
  } else {
    console.error(`PLUGIN_DEBUG_NAMESPACE: ${formattedMessage}`);
  }
}

function isLoggingEnabled() {
  if (ADMIN_MCP_TRANSPORT !== "stdio") {
    return debug.enabled(PLUGIN_DEBUG_NAMESPACE);
  }
  return true;
}

export function enableDebugLogs() {
  debug.enable(PLUGIN_DEBUG_NAMESPACE);
}
