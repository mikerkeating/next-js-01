/**
 * MSW server setup for Node.js (Vitest) environment.
 *
 * This module provides the MSW server instance configured for use in tests.
 * Import from '@repo/testing/mocks/server' and use the exported server
 * with Vitest lifecycle hooks.
 *
 * @example
 * ```typescript
 * import { server } from '@repo/testing/mocks/server';
 * import { beforeAll, afterAll, afterEach } from 'vitest';
 *
 * beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
 * afterEach(() => server.resetHandlers());
 * afterAll(() => server.close());
 * ```
 *
 * @see https://mswjs.io/docs/integrations/node
 */
import type { SetupServer } from "msw/node";
import { setupServer } from "msw/node";
import { beforeAll, afterEach, afterAll } from "vitest";

import { handlers } from "./handlers";

/**
 * MSW server instance configured with default handlers.
 *
 * Use this in your test setup:
 * - `server.listen()` - Start intercepting requests (call in beforeAll)
 * - `server.resetHandlers()` - Reset to default handlers (call in afterEach)
 * - `server.close()` - Stop intercepting requests (call in afterAll)
 * - `server.use(handler)` - Add test-specific handler overrides
 */
export const server: SetupServer = setupServer(...handlers);

/**
 * Helper function to set up MSW server with Vitest lifecycle hooks.
 * Call this in your test file or global setup to configure MSW.
 *
 * @example
 * ```typescript
 * import { setupMswServer } from '@repo/testing/mocks/server';
 *
 * setupMswServer();
 *
 * test('my test', () => {
 *   // MSW is now active
 * });
 * ```
 */
/**
 * Guard to prevent duplicate MSW server setup within the same worker process.
 * Each Vitest worker gets its own server instance, so this is worker-scoped.
 * This is intentional - we want each worker to have its own isolated MSW setup.
 */
let isSetup = false;

export function setupMswServer(): void {
  if (isSetup) {
    return;
  }
  isSetup = true;

  // Start server before all tests
  beforeAll(() => {
    server.listen({
      // Allow unhandled requests to pass through (useful for non-mocked APIs)
      onUnhandledRequest: "bypass",
    });
  });

  // Reset handlers after each test to prevent state leakage
  afterEach(() => {
    server.resetHandlers();
  });

  // Clean up after all tests
  afterAll(() => {
    server.close();
  });
}

export { handlers };
