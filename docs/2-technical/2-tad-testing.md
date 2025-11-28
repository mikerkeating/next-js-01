## Testing Architecture

### Overview

Our testing strategy ensures code quality, reliability, and maintainability across all applications through a comprehensive testing pyramid. This section covers Epics 1A.3, 4A.1, 4A.2, and 4A.3.

**Testing Philosophy**:

- **Test Pyramid**: More unit tests, fewer integration tests, minimal E2E tests
- **Test Early**: Run fast tests in development, comprehensive tests in CI
- **Test Realistically**: Use real database for integration tests, real browser for E2E
- **Test Coverage**: Minimum 80% code coverage, 100% for critical paths
- **Test Isolation**: Each test is independent and can run in parallel

### Testing Strategy by Application

#### 1. Routing App (`apps/routing`)

**Purpose**: Main application routing layer with server components

**Testing Strategy**:

```typescript
// Test Distribution
Unit Tests: 60%          // Component logic, utilities, helpers
Integration Tests: 30%   // API routes, database queries, auth flows
E2E Tests: 10%          // Critical user journeys
```

**Unit Tests** (`*.test.ts`):

```typescript
// apps/routing/src/components/ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    const product = {
      id: '1',
      name: 'Test Product',
      price: 99.99,
      image: '/test.jpg',
    };

    render(<ProductCard product={product} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', '/test.jpg');
  });

  it('handles missing optional fields gracefully', () => {
    const product = {
      id: '1',
      name: 'Test Product',
      price: 99.99,
    };

    render(<ProductCard product={product} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
```

**Integration Tests** (`*.integration.test.ts`):

```typescript
// apps/routing/src/app/api/products/route.integration.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { GET, POST } from "./route";
import { db } from "@repo/database";
import { products } from "@repo/database/schema";

describe("Products API", () => {
  let OrganizationId: string;

  beforeEach(async () => {
    // Setup test data
    OrganizationId = "test-org-123";
  });

  afterEach(async () => {
    // Cleanup test data
    await db.delete(products).where(eq(products.OrganizationId, OrganizationId));
  });

  it("GET /api/products returns products for Organization", async () => {
    // Arrange: Insert test products
    await db.insert(products).values([
      { OrganizationId, name: "Product 1", price: 10 },
      { OrganizationId, name: "Product 2", price: 20 },
    ]);

    // Act: Make request
    const request = new Request("http://localhost:3000/api/products", {
      headers: { "x-Organization-id": OrganizationId },
    });
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(data.data[0].name).toBe("Product 1");
  });

  it("POST /api/products creates new product", async () => {
    const request = new Request("http://localhost:3000/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-Organization-id": OrganizationId,
      },
      body: JSON.stringify({
        name: "New Product",
        price: 49.99,
        description: "Test description",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.name).toBe("New Product");
    expect(data.data.price).toBe(49.99);

    // Verify product was created in database
    const created = await db.query.products.findFirst({
      where: eq(products.OrganizationId, OrganizationId),
    });
    expect(created).toBeDefined();
  });
});
```

**E2E Tests** (`*.e2e.test.ts`):

```typescript
// tests/e2e/product-management.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Product Management", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/sign-in");
    await page.fill('[name="email"]', "test@example.com");
    await page.fill('[name="password"]', "TestPass123!");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("should create, edit, and delete a product", async ({ page }) => {
    // Navigate to products page
    await page.goto("/products");
    await expect(page.locator("h1")).toContainText("Products");

    // Create product
    await page.click('button:has-text("New Product")');
    await page.fill('[name="name"]', "E2E Test Product");
    await page.fill('[name="price"]', "29.99");
    await page.fill('[name="description"]', "E2E test description");
    await page.click('button:has-text("Create")');

    // Verify product appears in list
    await expect(page.locator("text=E2E Test Product")).toBeVisible();
    await expect(page.locator("text=$29.99")).toBeVisible();

    // Edit product
    await page.click('[aria-label="Edit E2E Test Product"]');
    await page.fill('[name="price"]', "39.99");
    await page.click('button:has-text("Save")');

    // Verify updated price
    await expect(page.locator("text=$39.99")).toBeVisible();

    // Delete product
    await page.click('[aria-label="Delete E2E Test Product"]');
    await page.click('button:has-text("Confirm")');

    // Verify product is removed
    await expect(page.locator("text=E2E Test Product")).not.toBeVisible();
  });
});
```

**Coverage Target**: 85%

---

#### 2. API App (`apps/api`)

**Purpose**: REST API endpoints with business logic

**Testing Strategy**:

```typescript
// Test Distribution
Unit Tests: 50%          // Business logic, validators, utilities
Integration Tests: 45%   // API endpoints, database operations
E2E Tests: 5%           // Critical API workflows
```

**Unit Tests**:

```typescript
// apps/api/src/services/pricing.test.ts
import { describe, it, expect } from "vitest";
import { PricingService } from "./pricing";

describe("PricingService", () => {
  const service = new PricingService();

  describe("calculatePrice", () => {
    it("applies percentage discount correctly", () => {
      const result = service.calculatePrice({
        basePrice: 100,
        discount: { type: "percentage", value: 20 },
      });

      expect(result.finalPrice).toBe(80);
      expect(result.discountAmount).toBe(20);
    });

    it("applies fixed discount correctly", () => {
      const result = service.calculatePrice({
        basePrice: 100,
        discount: { type: "fixed", value: 15 },
      });

      expect(result.finalPrice).toBe(85);
      expect(result.discountAmount).toBe(15);
    });

    it("never allows negative price", () => {
      const result = service.calculatePrice({
        basePrice: 10,
        discount: { type: "fixed", value: 20 },
      });

      expect(result.finalPrice).toBe(0);
      expect(result.discountAmount).toBe(10);
    });

    it("handles bulk pricing tiers", () => {
      const result = service.calculatePrice({
        basePrice: 10,
        quantity: 100,
        bulkTiers: [
          { minQuantity: 50, discount: 10 },
          { minQuantity: 100, discount: 20 },
        ],
      });

      expect(result.finalPrice).toBe(8); // 20% off
      expect(result.totalPrice).toBe(800); // 100 * 8
    });
  });
});
```

**Integration Tests**:

```typescript
// apps/api/src/app/api/v1/orders/route.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { testDb, createTestUser, createTestOrg } from "@repo/testing/helpers";

describe("Orders API", () => {
  let userId: string;
  let orgId: string;
  let authToken: string;

  beforeAll(async () => {
    const user = await createTestUser();
    const org = await createTestOrg({ ownerId: user.id });
    userId = user.id;
    orgId = org.id;
    authToken = user.token;
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  it("POST /api/v1/orders creates order with items", async () => {
    const response = await fetch("http://localhost:3000/api/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        "x-Organization-id": orgId,
      },
      body: JSON.stringify({
        items: [
          { productId: "prod_123", quantity: 2, price: 29.99 },
          { productId: "prod_456", quantity: 1, price: 49.99 },
        ],
        shippingAddress: {
          street: "123 Test St",
          city: "Test City",
          state: "TS",
          zip: "12345",
        },
      }),
    });

    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.items).toHaveLength(2);
    expect(data.data.total).toBe(109.97); // (29.99 * 2) + 49.99
    expect(data.data.status).toBe("pending");
  });

  it("GET /api/v1/orders/:id returns order details", async () => {
    // Create order first
    const createResponse = await fetch("http://localhost:3000/api/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        "x-Organization-id": orgId,
      },
      body: JSON.stringify({
        items: [{ productId: "prod_123", quantity: 1, price: 99.99 }],
      }),
    });
    const createData = await createResponse.json();
    const orderId = createData.data.id;

    // Fetch order
    const response = await fetch(`http://localhost:3000/api/v1/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "x-Organization-id": orgId,
      },
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe(orderId);
    expect(data.data.items).toHaveLength(1);
  });

  it("prevents accessing orders from different Organization", async () => {
    // Create order in org1
    const org2 = await createTestOrg({ ownerId: userId });

    const response = await fetch(`http://localhost:3000/api/v1/orders/order_123`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "x-Organization-id": org2.id, // Different org
      },
    });

    expect(response.status).toBe(404); // Not found (tenant isolation)
  });
});
```

**Coverage Target**: 90% (higher for API logic)

---

#### 3. Shared Packages (`packages/*`)

**Purpose**: Reusable utilities and business logic

**Testing Strategy**:

```typescript
// Test Distribution
Unit Tests: 90%          // Pure functions, utilities, validators
Integration Tests: 10%   // Database interactions, external APIs
```

**Example: Database Package Tests**:

```typescript
// packages/database/src/queries/users.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createUser, getUserById, updateUser, deleteUser } from "./users";
import { testDb } from "@repo/testing/helpers";

describe("User Queries", () => {
  beforeEach(async () => {
    await testDb.reset();
  });

  describe("createUser", () => {
    it("creates user with valid data", async () => {
      const user = await createUser({
        clerkId: "clerk_123",
        email: "test@example.com",
        name: "Test User",
      });

      expect(user.id).toBeDefined();
      expect(user.email).toBe("test@example.com");
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it("throws error for duplicate email", async () => {
      await createUser({
        clerkId: "clerk_123",
        email: "test@example.com",
        name: "User 1",
      });

      await expect(
        createUser({
          clerkId: "clerk_456",
          email: "test@example.com",
          name: "User 2",
        })
      ).rejects.toThrow("Email already exists");
    });
  });

  describe("updateUser", () => {
    it("updates user fields", async () => {
      const user = await createUser({
        clerkId: "clerk_123",
        email: "test@example.com",
        name: "Old Name",
      });

      const updated = await updateUser(user.id, {
        name: "New Name",
      });

      expect(updated.name).toBe("New Name");
      expect(updated.email).toBe("test@example.com"); // Unchanged
    });
  });

  describe("deleteUser", () => {
    it("soft deletes user", async () => {
      const user = await createUser({
        clerkId: "clerk_123",
        email: "test@example.com",
        name: "Test User",
      });

      await deleteUser(user.id);

      const deleted = await getUserById(user.id);
      expect(deleted).toBeNull(); // Soft deleted, not returned
    });
  });
});
```

**Example: Validation Package Tests**:

```typescript
// packages/validation/src/schemas/product.test.ts
import { describe, it, expect } from "vitest";
import { ProductSchema } from "./product";

describe("ProductSchema", () => {
  it("validates valid product data", () => {
    const result = ProductSchema.safeParse({
      name: "Test Product",
      price: 29.99,
      description: "A great product",
      category: "electronics",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Test Product");
    }
  });

  it("rejects negative price", () => {
    const result = ProductSchema.safeParse({
      name: "Test Product",
      price: -10,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("positive");
    }
  });

  it("sanitizes description HTML", () => {
    const result = ProductSchema.safeParse({
      name: "Test Product",
      price: 29.99,
      description: '<script>alert("xss")</script><p>Safe content</p>',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).not.toContain("<script>");
      expect(result.data.description).toContain("<p>Safe content</p>");
    }
  });

  it("requires name to be non-empty", () => {
    const result = ProductSchema.safeParse({
      name: "",
      price: 29.99,
    });

    expect(result.success).toBe(false);
  });
});
```

**Coverage Target**: 95% (critical shared code)

---

### Load Testing Approach

#### Load Testing Strategy

**Tools**: k6 (primary), Artillery (alternative)

**Test Types**:

| Test Type       | Duration | Users   | Purpose                            |
| --------------- | -------- | ------- | ---------------------------------- |
| **Smoke Test**  | 5 min    | 1-10    | Verify system handles minimal load |
| **Load Test**   | 15 min   | 10-100  | Test expected production load      |
| **Stress Test** | 30 min   | 100-500 | Find breaking point                |
| **Spike Test**  | 10 min   | 0-500-0 | Test sudden traffic spikes         |
| **Soak Test**   | 4 hours  | 50      | Test long-term stability           |

#### k6 Load Test Configuration

```javascript
// tests/load/api-endpoints.js
import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

const errorRate = new Rate("errors");

export const options = {
  stages: [
    { duration: "2m", target: 10 }, // Ramp up to 10 users
    { duration: "5m", target: 50 }, // Ramp up to 50 users
    { duration: "5m", target: 50 }, // Stay at 50 users
    { duration: "2m", target: 100 }, // Ramp up to 100 users
    { duration: "3m", target: 100 }, // Stay at 100 users
    { duration: "2m", target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1000"], // 95% under 500ms, 99% under 1s
    http_req_failed: ["rate<0.01"], // Error rate < 1%
    errors: ["rate<0.05"], // Custom error rate < 5%
  },
};

const BASE_URL = __ENV.BASE_URL || "https://staging.example.com";
const API_TOKEN = __ENV.API_TOKEN;

export default function () {
  // Test 1: Get products list
  let res = http.get(`${BASE_URL}/api/v1/products`, {
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "x-Organization-id": "test-org-123",
    },
  });

  check(res, {
    "products list status is 200": (r) => r.status === 200,
    "products list response time < 500ms": (r) => r.timings.duration < 500,
    "products list returns data": (r) => JSON.parse(r.body).success === true,
  }) || errorRate.add(1);

  sleep(1);

  // Test 2: Get single product
  res = http.get(`${BASE_URL}/api/v1/products/prod_123`, {
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "x-Organization-id": "test-org-123",
    },
  });

  check(res, {
    "product detail status is 200": (r) => r.status === 200,
    "product detail response time < 300ms": (r) => r.timings.duration < 300,
  }) || errorRate.add(1);

  sleep(1);

  // Test 3: Create order (POST)
  const payload = JSON.stringify({
    items: [{ productId: "prod_123", quantity: 2, price: 29.99 }],
  });

  res = http.post(`${BASE_URL}/api/v1/orders`, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_TOKEN}`,
      "x-Organization-id": "test-org-123",
    },
  });

  check(res, {
    "create order status is 201": (r) => r.status === 201,
    "create order response time < 1s": (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  sleep(2);
}

// Lifecycle hooks
export function setup() {
  console.log("Load test starting...");
  console.log(`Target: ${BASE_URL}`);
}

export function teardown(data) {
  console.log("Load test completed");
}
```

#### Stress Test Configuration

```javascript
// tests/load/stress-test.js
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "2m", target: 50 }, // Ramp up to 50 users
    { duration: "5m", target: 100 }, // Ramp up to 100 users
    { duration: "5m", target: 200 }, // Ramp up to 200 users (stress)
    { duration: "5m", target: 300 }, // Ramp up to 300 users (breaking point)
    { duration: "5m", target: 400 }, // Ramp up to 400 users
    { duration: "2m", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(99)<3000"], // 99% under 3s (degraded acceptable)
    http_req_failed: ["rate<0.1"], // Error rate < 10% (some failures expected)
  },
};

const BASE_URL = __ENV.BASE_URL || "https://staging.example.com";

export default function () {
  const res = http.get(`${BASE_URL}/api/health`);

  check(res, {
    "health check responds": (r) => r.status !== 0,
  });

  sleep(1);
}
```

#### Spike Test Configuration

```javascript
// tests/load/spike-test.js
import http from "k6/http";
import { check } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 10 }, // Normal load
    { duration: "10s", target: 500 }, // Sudden spike
    { duration: "1m", target: 500 }, // Sustained spike
    { duration: "10s", target: 10 }, // Drop back to normal
    { duration: "1m", target: 10 }, // Recovery period
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"], // Allow degradation during spike
    http_req_failed: ["rate<0.05"], // 5% error rate acceptable during spike
  },
};

const BASE_URL = __ENV.BASE_URL || "https://staging.example.com";

export default function () {
  http.get(`${BASE_URL}/`);
}
```

#### Load Test Execution

```bash
# Run smoke test (pre-deploy validation)
k6 run tests/load/smoke-test.js

# Run load test against staging
k6 run --env BASE_URL=https://staging.example.com tests/load/api-endpoints.js

# Run stress test to find limits
k6 run tests/load/stress-test.js

# Run spike test for traffic surges
k6 run tests/load/spike-test.js

# Run with cloud reporting (k6 Cloud)
k6 cloud tests/load/api-endpoints.js

# Run soak test (4 hours)
k6 run --duration 4h --vus 50 tests/load/soak-test.js
```

#### Performance Targets

| Endpoint Type | p95 Latency | p99 Latency | Max Error Rate |
| ------------- | ----------- | ----------- | -------------- |
| GET (simple)  | < 200ms     | < 500ms     | < 0.1%         |
| GET (complex) | < 500ms     | < 1s        | < 0.5%         |
| POST/PUT      | < 500ms     | < 1s        | < 1%           |
| File Upload   | < 2s        | < 5s        | < 2%           |

**Load Test Schedule**:

- **Daily**: Smoke tests in CI/CD pipeline
- **Weekly**: Full load test on staging (50 concurrent users)
- **Monthly**: Stress test to validate capacity planning
- **Before Major Releases**: Full suite (smoke, load, stress, spike)

---

### Visual Regression Testing

#### Strategy

**Tool**: Chromatic (Storybook-based visual testing)

**Coverage**:

- All UI components in Storybook
- Critical pages (homepage, product pages, checkout)
- Responsive breakpoints (mobile, tablet, desktop)
- Dark mode variations (if applicable)

#### Storybook Configuration

```typescript
// packages/ui/.storybook/main.ts
import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx|mdx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-a11y",
    "@storybook/addon-interactions",
    "@chromatic-com/storybook",
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  staticDirs: ["../public"],
};

export default config;
```

#### Component Stories

```typescript
// packages/ui/src/components/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    chromatic: {
      // Visual testing configuration
      viewports: [320, 768, 1200], // Test on mobile, tablet, desktop
      delay: 300, // Wait for animations
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    children: 'Disabled Button',
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    children: 'Loading...',
    loading: true,
  },
};

export const WithIcon: Story = {
  args: {
    variant: 'primary',
    children: (
      <>
        <Icon name="check" />
        Button with Icon
      </>
    ),
  },
};

// Test all sizes
export const Sizes: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

// Test all variants
export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
};
```

#### Chromatic Configuration

```javascript
// .chromatic/config.js
module.exports = {
  projectId: "PROJECT_ID",
  buildScriptName: "build-storybook",

  // Auto-accept changes on main branch
  autoAcceptChanges: "main",

  // Exit with error code if changes detected
  exitZeroOnChanges: false,

  // Only capture specified stories
  onlyChanged: true,

  // Ignore specific files
  externals: ["public/**"],
};
```

#### GitHub Actions Integration

```yaml
# .github/workflows/visual-regression.yml
name: Visual Regression Tests

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  visual-regression:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Full git history for Chromatic

      - uses: pnpm/action-setup@v2
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - run: pnpm install --frozen-lockfile

      - name: Build Storybook
        run: pnpm run build-storybook
        working-directory: packages/ui

      - name: Run Chromatic
        uses: chromaui/action@v1
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          buildScriptName: "build-storybook"
          workingDir: packages/ui
          exitZeroOnChanges: false
          autoAcceptChanges: main
```

#### Visual Testing Workflow

1. **Developer**: Creates/updates component and story
2. **CI**: Builds Storybook and runs Chromatic on PR
3. **Chromatic**: Captures screenshots and compares with baseline
4. **Review**: If changes detected, reviewer approves/rejects in Chromatic UI
5. **Merge**: Approved changes become new baseline

**Review Checklist**:

- [ ] Visual changes are intentional
- [ ] All breakpoints render correctly
- [ ] No unintended layout shifts
- [ ] Text remains readable at all sizes
- [ ] Focus states are visible
- [ ] Color contrast meets WCAG AA standards

---

### Accessibility Testing

#### Strategy

**Goal**: WCAG 2.1 Level AA compliance

**Tools**:

- **axe-core**: Automated accessibility testing
- **Storybook a11y addon**: Component-level testing
- **Playwright axe**: E2E accessibility testing
- **Manual testing**: Screen reader testing (NVDA, JAWS)

#### Component-Level Testing (Storybook)

```typescript
// packages/ui/src/components/FormInput.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { within, userEvent } from "@storybook/testing-library";
import { expect } from "@storybook/jest";
import { FormInput } from "./FormInput";

const meta: Meta<typeof FormInput> = {
  title: "Forms/FormInput",
  component: FormInput,
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: "color-contrast",
            enabled: true,
          },
          {
            id: "label",
            enabled: true,
          },
        ],
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FormInput>;

export const Default: Story = {
  args: {
    label: "Email Address",
    name: "email",
    type: "email",
    placeholder: "Enter your email",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test keyboard navigation
    const input = canvas.getByLabelText("Email Address");
    await userEvent.tab();
    expect(input).toHaveFocus();

    // Test input
    await userEvent.type(input, "test@example.com");
    expect(input).toHaveValue("test@example.com");
  },
};

export const WithError: Story = {
  args: {
    label: "Email Address",
    name: "email",
    type: "email",
    error: "Please enter a valid email address",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify error is announced to screen readers
    const errorMessage = canvas.getByRole("alert");
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent("Please enter a valid email address");

    // Verify input has aria-invalid
    const input = canvas.getByLabelText("Email Address");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby");
  },
};

export const Required: Story = {
  args: {
    label: "Email Address",
    name: "email",
    type: "email",
    required: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByLabelText(/Email Address/);
    expect(input).toHaveAttribute("required");
    expect(input).toHaveAttribute("aria-required", "true");
  },
};
```

#### E2E Accessibility Testing

```typescript
// tests/e2e/accessibility.spec.ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility", () => {
  test("homepage should not have any automatically detectable accessibility issues", async ({
    page,
  }) => {
    await page.goto("/");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("product page should be accessible", async ({ page }) => {
    await page.goto("/products/test-product");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("checkout flow should be keyboard navigable", async ({ page }) => {
    await page.goto("/checkout");

    // Tab through all interactive elements
    await page.keyboard.press("Tab");
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(["INPUT", "BUTTON", "A"]).toContain(focusedElement);

    // Verify focus indicators are visible
    const focusedStyles = await page.evaluate(() => {
      const el = document.activeElement;
      const styles = window.getComputedStyle(el!);
      return {
        outline: styles.outline,
        boxShadow: styles.boxShadow,
      };
    });

    // Should have visible focus indicator
    expect(focusedStyles.outline !== "none" || focusedStyles.boxShadow !== "none").toBe(true);
  });

  test("form errors should be announced to screen readers", async ({ page }) => {
    await page.goto("/contact");

    // Submit empty form
    await page.click('button[type="submit"]');

    // Wait for error messages
    await page.waitForSelector('[role="alert"]');

    // Verify error has aria-live region
    const errorRegion = page.locator('[role="alert"]').first();
    await expect(errorRegion).toBeVisible();

    // Verify form field has aria-invalid
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toHaveAttribute("aria-invalid", "true");
  });

  test("modal dialogs should trap focus", async ({ page }) => {
    await page.goto("/");

    // Open modal
    await page.click('button:has-text("Open Modal")');

    // Verify modal is visible
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Tab through all elements in modal
    let focusedElement;
    const modalElements: string[] = [];

    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
      focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.tagName + (el?.textContent?.slice(0, 20) || "");
      });
      modalElements.push(focusedElement);
    }

    // Focus should cycle within modal (not escape to page)
    const dialog = page.locator('[role="dialog"]');
    const allFocusedWithinDialog = await Promise.all(
      modalElements.map(async () => {
        const focused = page.locator(":focus");
        return (await dialog.locator(":focus").count()) > 0;
      })
    );

    // At least some elements should be focused within dialog
    expect(allFocusedWithinDialog.some(Boolean)).toBe(true);
  });
});
```

#### Accessibility Checklist

**Component Development**:

- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible (not removed with `outline: none`)
- [ ] Proper semantic HTML elements used (`<button>`, `<a>`, `<nav>`, etc.)
- [ ] ARIA labels provided for icon-only buttons
- [ ] Form inputs have associated `<label>` elements
- [ ] Error messages use `role="alert"` or `aria-live="polite"`
- [ ] Images have `alt` text (or `alt=""` for decorative images)
- [ ] Color contrast meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- [ ] No information conveyed by color alone
- [ ] Skip links provided for keyboard users

**Page Development**:

- [ ] Page has descriptive `<title>`
- [ ] Proper heading hierarchy (`<h1>` → `<h2>` → `<h3>`)
- [ ] Landmark regions defined (`<header>`, `<nav>`, `<main>`, `<footer>`)
- [ ] Language declared (`<html lang="en">`)
- [ ] Viewport meta tag configured properly
- [ ] No automatic page refreshes or redirects
- [ ] Videos have captions/transcripts

**Testing**:

- [ ] Automated tests pass (axe-core)
- [ ] Manual keyboard navigation tested
- [ ] Screen reader tested (NVDA on Windows, VoiceOver on Mac)
- [ ] Tested at 200% zoom
- [ ] Tested with reduced motion preferences

---

### Test Infrastructure

#### Test Database Setup

```typescript
// packages/testing/src/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@repo/database/schema";

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || "postgresql://test:test@localhost:5432/test_db";

// Create test database connection
const client = postgres(TEST_DATABASE_URL, { max: 1 });
export const testDb = drizzle(client, { schema });

// Reset database to clean state
export async function resetDatabase() {
  // Delete all data from tables (in correct order to respect foreign keys)
  await testDb.delete(schema.analytics_events);
  await testDb.delete(schema.content);
  await testDb.delete(schema.user_Organizations);
  await testDb.delete(schema.Organizations);
  await testDb.delete(schema.users);
}

// Cleanup database connection
export async function closeDatabase() {
  await client.end();
}
```

#### Test Helpers

```typescript
// packages/testing/src/helpers.ts
import { testDb } from "./db";
import { users, Organizations, user_Organizations } from "@repo/database/schema";
import { randomUUID } from "crypto";

export async function createTestUser(data?: Partial<typeof users.$inferInsert>) {
  const [user] = await testDb
    .insert(users)
    .values({
      clerkId: `clerk_test_${randomUUID()}`,
      email: data?.email || `test-${randomUUID()}@example.com`,
      name: data?.name || "Test User",
      ...data,
    })
    .returning();

  return user;
}

export async function createTestOrg(
  data?: Partial<typeof Organizations.$inferInsert> & { ownerId?: string }
) {
  const [org] = await testDb
    .insert(Organizations)
    .values({
      name: data?.name || `Test Org ${randomUUID()}`,
      slug: data?.slug || `test-org-${randomUUID()}`,
      ...data,
    })
    .returning();

  // Add owner to Organization
  if (data?.ownerId) {
    await testDb.insert(user_Organizations).values({
      userId: data.ownerId,
      OrganizationId: org.id,
      role: "internal",
    });
  }

  return org;
}

export async function createAuthToken(userId: string): Promise<string> {
  // Generate test JWT token (simplified)
  return `test_token_${userId}`;
}
```

#### CI/CD Test Configuration

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  pull_request:
  push:
    branches: [main, staging]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - run: pnpm install --frozen-lockfile

      - name: Run unit tests
        run: pnpm run test:unit

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - run: pnpm install --frozen-lockfile

      - name: Run database migrations
        run: pnpm run db:migrate
        env:
          TEST_DATABASE_URL: postgresql://test:test@localhost:5432/test_db

      - name: Run integration tests
        run: pnpm run test:integration
        env:
          TEST_DATABASE_URL: postgresql://test:test@localhost:5432/test_db

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - run: pnpm install --frozen-lockfile

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps

      - name: Wait for Vercel preview
        uses: patrickedqvist/wait-for-vercel-preview@v1.3.1
        id: vercel-preview
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          max_timeout: 300

      - name: Run E2E tests
        run: pnpm run test:e2e
        env:
          BASE_URL: ${{ steps.vercel-preview.outputs.url }}

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  accessibility-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - run: pnpm install --frozen-lockfile

      - name: Install Playwright
        run: pnpm exec playwright install --with-deps

      - name: Run accessibility tests
        run: pnpm run test:a11y
        env:
          BASE_URL: ${{ steps.vercel-preview.outputs.url }}
```

### Test Coverage Requirements

| Package/App             | Unit | Integration | E2E                | Overall |
| ----------------------- | ---- | ----------- | ------------------ | ------- |
| **packages/database**   | 95%  | 90%         | -                  | 90%     |
| **packages/auth**       | 90%  | 85%         | -                  | 85%     |
| **packages/validation** | 95%  | -           | -                  | 95%     |
| **packages/ui**         | 85%  | -           | -                  | 85%     |
| **apps/routing**        | 80%  | 70%         | Critical paths     | 80%     |
| **apps/api**            | 85%  | 80%         | Critical endpoints | 85%     |
| **Overall Target**      | -    | -           | -                  | **80%** |

---
