/**
 * Basic Authentication Proxy for Documentation Site
 *
 * Uses the shared @repo/middleware package for Basic Auth protection.
 *
 * Bypasses:
 * - /_next/* - Next.js static assets and internals
 * - Static file extensions (.svg, .png, .jpg, etc.)
 */

import { createBasicAuthProxy } from "@repo/middleware/basic-auth";

const { proxy, shouldBypassAuth } = createBasicAuthProxy({
  realm: "Documentation",
  bypassPaths: ["/_next/static/*", "/_next/image/*", "/favicon.ico"],
  bypassStaticFiles: true,
});

export { proxy, shouldBypassAuth };
