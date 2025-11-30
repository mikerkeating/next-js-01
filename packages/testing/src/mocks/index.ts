/**
 * Mock exports barrel file.
 *
 * Re-exports all mock utilities, server setup, and handlers.
 *
 * @example
 * ```typescript
 * import { server, setupMswServer, handlers, http, HttpResponse } from '@repo/testing/mocks';
 *
 * // Setup server in your test file
 * setupMswServer();
 *
 * // Or manually control the server
 * beforeAll(() => server.listen());
 * afterEach(() => server.resetHandlers());
 * afterAll(() => server.close());
 *
 * // Add custom handlers
 * server.use(
 *   http.get('/api/custom', () => HttpResponse.json({ data: 'custom' }))
 * );
 * ```
 */

// Server exports
export { server, setupMswServer, handlers } from "./server";

// Handler utilities and types
export {
  http,
  HttpResponse,
  type MockUser,
  type MockOrganization,
  type ApiResponse,
} from "./handlers";
