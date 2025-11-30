/**
 * Vitest setup file for MSW (Mock Service Worker).
 *
 * Add this file to your vitest.config.ts setupFiles array to enable
 * API mocking in your tests.
 *
 * @example
 * ```typescript
 * // vitest.config.ts
 * import { defineConfig, mergeConfig } from 'vitest/config';
 * import { baseConfig } from '@repo/config/vitest/base';
 *
 * export default mergeConfig(baseConfig, defineConfig({
 *   test: {
 *     setupFiles: ['@repo/config/vitest/setup-msw'],
 *   },
 * }));
 * ```
 *
 * @see https://mswjs.io/docs/integrations/node
 */
import { afterAll, afterEach, beforeAll } from "vitest";

import { server } from "@repo/testing/mocks/server";

/**
 * Start MSW server before all tests.
 * - In CI: 'error' to fail tests on unmocked network calls
 * - Locally: 'bypass' allows non-mocked requests to pass through
 */
beforeAll(() => {
  const onUnhandledRequest = process.env.CI ? "error" : "bypass";
  server.listen({
    onUnhandledRequest,
  });
});

/**
 * Reset handlers after each test to prevent state leakage between tests.
 * This restores the default handlers defined in handlers.ts.
 */
afterEach(() => {
  server.resetHandlers();
});

/**
 * Close the server after all tests complete.
 * This cleans up the request interception.
 */
afterAll(() => {
  server.close();
});
