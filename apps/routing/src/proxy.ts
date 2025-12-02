/**
 * Basic Authentication Proxy
 *
 * Uses the shared @repo/middleware package for Basic Auth protection.
 * When BASIC_AUTH_USERNAME or BASIC_AUTH_PASSWORD are not set:
 * - Returns 500 Internal Server Error (fail-fast security behavior)
 * - This prevents accidental exposure without authentication
 *
 * Bypasses (no auth required):
 * - /api/health - Health check endpoint for monitoring (exact match only)
 * - /_next/* - Next.js static assets and internals
 * - Static file extensions (.svg, .png, .jpg, etc.)
 */

import { createBasicAuthProxy } from '@repo/middleware/basic-auth';

const { proxy, shouldBypassAuth } = createBasicAuthProxy({
  realm: 'Secure Area',
  bypassPaths: ['/api/health', '/_next/*', '/favicon.ico'],
  bypassStaticFiles: true,
});

export { proxy, shouldBypassAuth };
