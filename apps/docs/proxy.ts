/**
 * Basic Authentication Proxy for Documentation Site
 *
 * Uses the shared @repo/middleware package for Basic Auth protection.
 * Auth is disabled when BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD are not set,
 * allowing local development without credentials.
 */

import { createBasicAuthProxy } from "@repo/middleware/basic-auth";

// Use Node.js runtime for access to crypto.timingSafeEqual
export const runtime = "nodejs";

const { proxy, config } = createBasicAuthProxy({
  realm: "Documentation",
  bypassPaths: ["/_next/static/*", "/_next/image/*", "/favicon.ico"],
  bypassStaticFiles: true,
});

export { config, proxy };
