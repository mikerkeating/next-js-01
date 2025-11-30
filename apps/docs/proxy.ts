/**
 * Basic Authentication Proxy for Documentation Site
 *
 * Uses the shared @repo/middleware package for Basic Auth protection.
 * Auth is disabled when BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD are not set,
 * allowing local development without credentials.
 *
 * Note: Proxy files in Next.js 16 always run on Node.js runtime and don't support
 * route segment config - they process all requests that reach the app.
 */

import { createBasicAuthProxy } from "@repo/middleware/basic-auth";

const { proxy } = createBasicAuthProxy({
  realm: "Documentation",
  bypassPaths: ["/_next/static/*", "/_next/image/*", "/favicon.ico"],
  bypassStaticFiles: true,
});

export { proxy };
