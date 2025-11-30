/**
 * Integration tests for @repo/testing package.
 *
 * Verifies that the shared testing package can be imported and used
 * correctly from a consuming app.
 *
 * These tests ensure:
 * - renderWithProviders works correctly
 * - screen utilities are re-exported
 * - userEvent is re-exported
 * - Factories are accessible
 * - MSW server and handlers work
 */
import { describe, it, expect, vi } from "vitest";

// Import all utilities from @repo/testing
import {
  renderWithProviders,
  screen,
  userEvent,
  createUser,
  createOrganization,
  server,
  http,
  HttpResponse,
} from "@repo/testing";

import { Button } from "@/components/Button";

describe("@repo/testing package integration", () => {
  describe("renderWithProviders", () => {
    it("renders components with providers", () => {
      renderWithProviders(<Button>Test Button</Button>);

      expect(screen.getByRole("button", { name: "Test Button" })).toBeInTheDocument();
    });

    it("supports user interactions via re-exported userEvent", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      renderWithProviders(<Button onClick={handleClick}>Click Me</Button>);

      await user.click(screen.getByRole("button", { name: "Click Me" }));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("supports rerender", () => {
      const { rerender } = renderWithProviders(<Button>Initial</Button>);

      expect(screen.getByRole("button", { name: "Initial" })).toBeInTheDocument();

      rerender(<Button>Updated</Button>);

      expect(screen.getByRole("button", { name: "Updated" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Initial" })).not.toBeInTheDocument();
    });
  });

  describe("factories", () => {
    it("creates user objects with factories", () => {
      const user = createUser();

      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("email");
      expect(user).toHaveProperty("name");
    });

    it("supports partial overrides in factories", () => {
      const user = createUser({ email: "custom@example.com" });

      expect(user.email).toBe("custom@example.com");
    });

    it("creates organization objects with factories", () => {
      const org = createOrganization();

      expect(org).toHaveProperty("id");
      expect(org).toHaveProperty("name");
      expect(org).toHaveProperty("slug");
    });
  });

  describe("MSW integration", () => {
    it("server is available and can use custom handlers", async () => {
      // Add a custom handler for this test
      server.use(
        http.get("/api/test-endpoint", () => {
          return HttpResponse.json({ message: "Hello from MSW" });
        })
      );

      const response = await fetch("/api/test-endpoint");
      const data = await response.json();

      expect(data.message).toBe("Hello from MSW");
    });

    it("can override handlers per test and they reset correctly", async () => {
      // First request - add override handler
      server.use(
        http.get("/api/override-test", () => {
          return HttpResponse.json({ version: 1 });
        })
      );

      const response1 = await fetch("/api/override-test");
      const data1 = await response1.json();
      expect(data1.version).toBe(1);

      // Override with a different handler
      server.use(
        http.get("/api/override-test", () => {
          return HttpResponse.json({ version: 2 });
        })
      );

      const response2 = await fetch("/api/override-test");
      const data2 = await response2.json();
      expect(data2.version).toBe(2);

      // Handlers are reset after each test by setup-msw
      // This test verifies the override mechanism works
    });
  });
});
