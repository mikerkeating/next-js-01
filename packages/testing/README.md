# @repo/testing

Shared testing utilities for the MK3 Platform monorepo. This package provides reusable testing utilities including component rendering with providers, API mocking with MSW, and data factories using Faker.

## Features

- **renderWithProviders**: Render React components with all necessary test providers
- **MSW Integration**: Mock Service Worker setup for API mocking
- **Data Factories**: Generate realistic test data with Faker.js
- **Testing Library Re-exports**: Consistent versions of React Testing Library utilities

## Installation

This package is available as a workspace dependency. Add it to your package's dependencies:

```json
{
  "devDependencies": {
    "@repo/testing": "workspace:*"
  }
}
```

Then run:

```bash
pnpm install
```

## Quick Start

```typescript
import {
  renderWithProviders,
  screen,
  userEvent,
  createUser,
  createOrganization,
} from "@repo/testing";

test("renders user profile", async () => {
  const user = userEvent.setup();
  const mockUser = createUser({ name: "Jane Doe" });

  renderWithProviders(<UserProfile user={mockUser} />);

  expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /edit/i }));
  expect(screen.getByRole("dialog")).toBeVisible();
});
```

## API Reference

### renderWithProviders

Renders a React component wrapped with all necessary test providers (React Query, Router, Theme, etc.).

```typescript
import { renderWithProviders, screen } from "@repo/testing";

// Basic usage
renderWithProviders(<MyComponent />);
expect(screen.getByRole("button")).toBeInTheDocument();

// With custom options
renderWithProviders(<MyComponent />, {
  container: document.createElement("div"),
  providerOptions: {
    wrapper: CustomWrapper,
  },
});
```

**Parameters:**

| Parameter | Type                          | Description                       |
| --------- | ----------------------------- | --------------------------------- |
| `ui`      | `ReactElement`                | The React element to render       |
| `options` | `RenderWithProvidersOptions?` | Optional render and provider opts |

**Returns:** `RenderResult` from React Testing Library with a modified `rerender` function that maintains provider context.

### Mock Factories

#### createUser

Generate realistic user test data.

```typescript
import { createUser, createUsers } from "@repo/testing";

// Create single user with defaults
const user = createUser();
// { id: 'uuid', email: 'john.doe@example.com', name: 'John Doe', ... }

// Create user with overrides
const admin = createUser({
  email: "admin@example.com",
  name: "Admin User",
});

// Create multiple users
const users = createUsers(5);
const teamMembers = createUsers(3, { name: "Team Member" });
```

**User Properties:**

| Property    | Type             | Description             |
| ----------- | ---------------- | ----------------------- |
| `id`        | `string`         | UUID                    |
| `email`     | `string`         | Email address           |
| `name`      | `string`         | Full name               |
| `clerkId`   | `string`         | Clerk authentication ID |
| `avatarUrl` | `string \| null` | Avatar URL              |
| `createdAt` | `Date`           | Creation timestamp      |
| `updatedAt` | `Date`           | Last update timestamp   |

#### createOrganization

Generate realistic organization test data.

```typescript
import { createOrganization, createOrganizations } from "@repo/testing";

// Create single organization with defaults
const org = createOrganization();
// { id: 'uuid', name: 'Acme Corp', slug: 'acme-corp', ... }

// Create organization with overrides
const techStartup = createOrganization({
  name: "Tech Startup",
  ownerId: "user-123",
});

// Create multiple organizations
const orgs = createOrganizations(5);

// Create organization for specific owner
import { createOrganizationForOwner } from "@repo/testing";
const myOrg = createOrganizationForOwner("user-456");
```

**Organization Properties:**

| Property      | Type             | Description             |
| ------------- | ---------------- | ----------------------- |
| `id`          | `string`         | UUID                    |
| `name`        | `string`         | Organization name       |
| `slug`        | `string`         | URL-friendly identifier |
| `description` | `string \| null` | Description             |
| `logoUrl`     | `string \| null` | Logo URL                |
| `ownerId`     | `string`         | Owner user ID           |
| `createdAt`   | `Date`           | Creation timestamp      |
| `updatedAt`   | `Date`           | Last update timestamp   |

#### Reproducible Data with setFakerSeed

For deterministic test data, set the Faker seed:

```typescript
import { setFakerSeed, createUser } from "@repo/testing";

// In your test setup
setFakerSeed(42);

// Now createUser() will always generate the same data
const user = createUser();
```

### MSW Server

Mock Service Worker integration for API mocking in tests.

#### Basic Setup

```typescript
import { server, setupMswServer } from "@repo/testing";

// Option 1: Use the helper function (recommended)
setupMswServer();

// Option 2: Manual setup with Vitest hooks
import { beforeAll, afterEach, afterAll } from "vitest";

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

#### Override Handlers in Tests

```typescript
import { server } from "@repo/testing";
import { http, HttpResponse } from "msw";

test("handles API error", async () => {
  // Override the default handler for this test
  server.use(
    http.get("/api/users", () => {
      return HttpResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    })
  );

  renderWithProviders(<UserList />);
  expect(await screen.findByText("Not found")).toBeInTheDocument();
});
```

#### Default Handlers

The package includes default handlers for common endpoints:

| Endpoint                 | Method | Description                |
| ------------------------ | ------ | -------------------------- |
| `/api/users`             | GET    | Returns list of mock users |
| `/api/users/:id`         | GET    | Returns single user by ID  |
| `/api/users`             | POST   | Creates new user           |
| `/api/organizations`     | GET    | Returns list of mock orgs  |
| `/api/organizations/:id` | GET    | Returns single org by ID   |

#### Creating Custom Handlers

```typescript
import { http, HttpResponse } from "msw";

// In your test file
const customHandlers = [
  http.get("/api/products", () => {
    return HttpResponse.json({
      success: true,
      data: [{ id: "1", name: "Product 1", price: 29.99 }],
    });
  }),

  http.post("/api/orders", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        success: true,
        data: { id: "order-123", ...body },
      },
      { status: 201 }
    );
  }),
];

// Add to server
server.use(...customHandlers);
```

### Re-exported Utilities

For version consistency across the monorepo, this package re-exports common testing utilities:

```typescript
// All from @repo/testing
import {
  screen, // Query rendered elements
  within, // Scope queries to a container
  waitFor, // Wait for async conditions
  act, // Wrap state updates
  cleanup, // Clean up after tests
  userEvent, // Simulate user interactions
} from "@repo/testing";
```

## Import Paths

For tree-shaking optimization, you can import from specific subpaths:

```typescript
// Main entry (includes everything)
import { renderWithProviders, createUser } from "@repo/testing";

// Specific subpaths
import { renderWithProviders } from "@repo/testing/render";
import { TestProviders, createTestWrapper } from "@repo/testing/providers";
import { server, setupMswServer } from "@repo/testing/mocks/server";
import { handlers, http, HttpResponse } from "@repo/testing/mocks/handlers";
import { createUser, createUsers } from "@repo/testing/factories/user";
import { createOrganization } from "@repo/testing/factories/organization";
```

## Troubleshooting

### "Cannot find module '@repo/testing'"

Ensure the package is listed in your `devDependencies` and run `pnpm install` from the repository root.

### MSW not intercepting requests

1. Verify `setupMswServer()` is called before tests run
2. Check that your fetch URLs match the handler patterns
3. Enable MSW debugging: `server.listen({ onUnhandledRequest: 'warn' })`

### Tests failing with "act(...) warnings"

Wrap state-updating code in `act()` or use `waitFor()` for async updates:

```typescript
import { waitFor } from "@repo/testing";

// Wait for async state updates
await waitFor(() => {
  expect(screen.getByText("Loaded")).toBeInTheDocument();
});
```

### Factory data not deterministic

Use `setFakerSeed()` at the start of your test file or in global setup:

```typescript
import { setFakerSeed } from "@repo/testing";

beforeAll(() => {
  setFakerSeed(12345);
});
```

## References

- [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md) - Detailed testing patterns and strategy
- [Vitest Documentation](https://vitest.dev/) - Test runner
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) - Component testing
- [MSW Documentation](https://mswjs.io/) - API mocking
- [Faker.js Documentation](https://fakerjs.dev/) - Test data generation
