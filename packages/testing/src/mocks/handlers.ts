/**
 * Default MSW request handlers for API mocking in tests.
 *
 * These handlers provide baseline API responses that can be used across tests.
 * Individual tests can override these handlers using `server.use()` for
 * test-specific behavior.
 *
 * @example
 * ```typescript
 * // Override a handler in a specific test
 * import { server } from '@repo/testing/mocks/server';
 * import { http, HttpResponse } from 'msw';
 *
 * test('handles API error', () => {
 *   server.use(
 *     http.get('/api/users', () => {
 *       return HttpResponse.json({ error: 'Not found' }, { status: 404 });
 *     })
 *   );
 *   // ... test logic
 * });
 * ```
 */
import { http, HttpResponse } from "msw";

/**
 * User type for mock API responses
 */
export interface MockUser {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly createdAt: string;
}

/**
 * Organization type for mock API responses
 */
export interface MockOrganization {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly createdAt: string;
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
}

/**
 * Request body for creating a user
 */
export interface CreateUserRequest {
  email: string;
  name: string;
}

/**
 * Default handlers for common API endpoints.
 * These provide baseline mock responses for testing.
 */
export const handlers = [
  /**
   * GET /api/users - Returns a list of mock users
   */
  http.get("/api/users", () => {
    const response: ApiResponse<MockUser[]> = {
      success: true,
      data: [
        {
          id: "user-1",
          email: "user1@example.com",
          name: "Test User 1",
          createdAt: "2024-01-01T00:00:00.000Z",
        },
        {
          id: "user-2",
          email: "user2@example.com",
          name: "Test User 2",
          createdAt: "2024-01-02T00:00:00.000Z",
        },
      ],
    };
    return HttpResponse.json(response);
  }),

  /**
   * GET /api/users/:id - Returns a single mock user by ID
   */
  http.get("/api/users/:id", ({ params }) => {
    const { id } = params;
    const response: ApiResponse<MockUser> = {
      success: true,
      data: {
        id: String(id),
        email: `user-${id}@example.com`,
        name: `Test User ${id}`,
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    };
    return HttpResponse.json(response);
  }),

  /**
   * POST /api/users - Creates a new mock user
   */
  http.post("/api/users", async ({ request }) => {
    const body = (await request.json()) as CreateUserRequest;

    if (!body.email || !body.name) {
      return HttpResponse.json(
        {
          success: false,
          error: "Email and name are required",
        } as ApiResponse<never>,
        { status: 400 }
      );
    }

    const response: ApiResponse<MockUser> = {
      success: true,
      data: {
        id: `user-${Date.now()}`,
        email: body.email,
        name: body.name,
        createdAt: new Date().toISOString(),
      },
    };
    return HttpResponse.json(response, { status: 201 });
  }),

  /**
   * GET /api/organizations - Returns a list of mock organizations
   */
  http.get("/api/organizations", () => {
    const response: ApiResponse<MockOrganization[]> = {
      success: true,
      data: [
        {
          id: "org-1",
          name: "Test Organization 1",
          slug: "test-org-1",
          createdAt: "2024-01-01T00:00:00.000Z",
        },
        {
          id: "org-2",
          name: "Test Organization 2",
          slug: "test-org-2",
          createdAt: "2024-01-02T00:00:00.000Z",
        },
      ],
    };
    return HttpResponse.json(response);
  }),

  /**
   * GET /api/organizations/:id - Returns a single mock organization by ID
   */
  http.get("/api/organizations/:id", ({ params }) => {
    const { id } = params;
    const response: ApiResponse<MockOrganization> = {
      success: true,
      data: {
        id: String(id),
        name: `Test Organization ${id}`,
        slug: `test-org-${id}`,
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    };
    return HttpResponse.json(response);
  }),
];

export { http, HttpResponse };
