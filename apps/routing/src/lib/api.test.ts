/**
 * Sample test demonstrating MSW (Mock Service Worker) and data factory usage.
 *
 * This test file demonstrates:
 * - MSW intercepting fetch requests and returning mocked responses
 * - Using data factories to create realistic test data
 * - Overriding default MSW handlers for specific test scenarios
 * - Using factory overrides for custom test data
 *
 * @see https://mswjs.io/docs/basics/mocking-responses
 * @see https://fakerjs.dev/
 */
import { describe, it, expect, assert } from "vitest";

import { server, http, HttpResponse, type ApiResponse, type MockUser } from "@repo/testing/mocks";
import { createUser, createOrganization } from "@repo/testing/factories";

describe("MSW API Mocking", () => {
  describe("Default Handlers", () => {
    it("should intercept GET /api/users and return mocked response", async () => {
      // Act: Make a fetch request that MSW will intercept
      const response = await fetch("/api/users");
      const data: ApiResponse<MockUser[]> = await response.json();

      // Assert: Verify MSW handler responded with mock data
      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      assert(data.data, "Expected data.data to be defined");
      const users = data.data;
      expect(users.length).toBeGreaterThan(0);
      expect(users[0]).toHaveProperty("id");
      expect(users[0]).toHaveProperty("email");
      expect(users[0]).toHaveProperty("name");
    });

    it("should intercept GET /api/users/:id and return user by ID", async () => {
      // Act: Fetch a specific user
      const response = await fetch("/api/users/user-123");
      const data: ApiResponse<MockUser> = await response.json();

      // Assert: Verify the response includes the user ID from the URL
      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      assert(data.data, "Expected data.data to be defined");
      const user = data.data;
      expect(user.id).toBe("user-123");
    });

    it("should intercept POST /api/users and return created user", async () => {
      // Arrange: Prepare the request body
      const newUser = { email: "newuser@example.com", name: "New User" };

      // Act: Create a new user via POST request
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      const data: ApiResponse<MockUser> = await response.json();

      // Assert: Verify the created user matches the input
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      assert(data.data, "Expected data.data to be defined");
      const createdUser = data.data;
      expect(createdUser.email).toBe("newuser@example.com");
      expect(createdUser.name).toBe("New User");
    });
  });

  describe("Custom Handler Overrides", () => {
    it("should allow overriding handlers for specific test scenarios", async () => {
      // Arrange: Override the default handler with a custom error response
      server.use(
        http.get("/api/users", () => {
          return HttpResponse.json({ success: false, error: "Server error" }, { status: 500 });
        })
      );

      // Act: Make the request
      const response = await fetch("/api/users");
      const data: ApiResponse<MockUser[]> = await response.json();

      // Assert: Verify the custom error response
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Server error");
    });

    it("should reset handlers between tests (verify default handler works again)", async () => {
      // This test runs after the previous one but should get the default handler
      // because handlers are reset in afterEach (via MSW setup file)
      const response = await fetch("/api/users");
      const data: ApiResponse<MockUser[]> = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      assert(data.data, "Expected data.data to be defined");
    });
  });
});

describe("Data Factories", () => {
  describe("User Factory", () => {
    it("should create a valid user object with faker-generated data", () => {
      // Act: Create a user with default values
      const user = createUser();

      // Assert: Verify the user has all required properties
      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("email");
      expect(user).toHaveProperty("name");
      expect(user).toHaveProperty("clerkId");
      expect(user).toHaveProperty("createdAt");
      expect(user).toHaveProperty("updatedAt");

      // Verify types
      expect(typeof user.id).toBe("string");
      expect(typeof user.email).toBe("string");
      expect(user.email).toMatch(/@/); // Email contains @
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it("should accept partial overrides for custom values", () => {
      // Arrange: Define custom values
      const customEmail = "custom@example.com";
      const customName = "Custom User";

      // Act: Create user with overrides
      const user = createUser({
        email: customEmail,
        name: customName,
      });

      // Assert: Verify overrides are applied while defaults remain
      expect(user.email).toBe(customEmail);
      expect(user.name).toBe(customName);
      expect(user.id).toBeDefined(); // Default value
      expect(user.clerkId).toBeDefined(); // Default value
    });

    it("should generate unique users each time", () => {
      // Act: Create multiple users
      const user1 = createUser();
      const user2 = createUser();

      // Assert: Users should have different IDs and emails
      expect(user1.id).not.toBe(user2.id);
      expect(user1.email).not.toBe(user2.email);
    });
  });

  describe("Organization Factory", () => {
    it("should create a valid organization object with faker-generated data", () => {
      // Act: Create an organization with default values
      const org = createOrganization();

      // Assert: Verify the organization has all required properties
      expect(org).toHaveProperty("id");
      expect(org).toHaveProperty("name");
      expect(org).toHaveProperty("slug");
      expect(org).toHaveProperty("ownerId");
      expect(org).toHaveProperty("createdAt");
      expect(org).toHaveProperty("updatedAt");

      // Verify slug is URL-friendly (lowercase, no special chars)
      expect(org.slug).toMatch(/^[a-z0-9-]+$/);
    });

    it("should accept partial overrides for custom values", () => {
      // Arrange: Define custom values
      const customName = "Acme Corporation";
      const customOwnerId = "owner-123";

      // Act: Create organization with overrides
      const org = createOrganization({
        name: customName,
        ownerId: customOwnerId,
      });

      // Assert: Verify overrides are applied
      expect(org.name).toBe(customName);
      expect(org.ownerId).toBe(customOwnerId);
      expect(org.id).toBeDefined(); // Default value
    });

    it("should generate unique organizations each time", () => {
      // Act: Create multiple organizations
      const org1 = createOrganization();
      const org2 = createOrganization();

      // Assert: Organizations should have different IDs
      expect(org1.id).not.toBe(org2.id);
    });
  });
});
