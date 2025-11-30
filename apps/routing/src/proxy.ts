/**
 * Basic Authentication Proxy
 *
 * Uses the shared @repo/middleware package for Basic Auth protection.
 * Auth is disabled when BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD are not set.
 *
 * Bypasses:
 * - /api/health - Health check endpoint for monitoring
 * - /_next/* - Next.js static assets and internals
 * - Static file extensions (.svg, .png, .jpg, etc.)
 */

import { createBasicAuthProxy } from "@repo/middleware/basic-auth";

const { proxy, shouldBypassAuth } = createBasicAuthProxy({
  realm: "Secure Area",
  bypassPaths: ["/api/health", "/_next/*", "/favicon.ico"],
  bypassStaticFiles: true,
});

export { proxy, shouldBypassAuth };
