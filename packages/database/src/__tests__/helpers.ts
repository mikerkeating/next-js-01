/**
 * Shared Test Utilities and Fixtures
 *
 * Provides reusable test utilities, mock factories, and fixtures
 * for database package tests.
 *
 * Key features:
 * - Mock database client creator
 * - Test data generators using seed factories
 * - Assertion helpers for database operations
 * - Type-safe test fixtures
 *
 * @packageDocumentation
 */

import { expect, vi, type Mock } from "vitest";

import { setFakerSeed, createUserData, createOrganizationData } from "../seed/factories";
import { createId } from "../utils/ids";

/**
 * Mock database client interface for testing.
 *
 * Provides a minimal mock of the Drizzle database client
 * with commonly used methods.
 */
export interface MockDbClient {
  execute: Mock;
  select: Mock;
  insert: Mock;
  update: Mock;
  delete: Mock;
  transaction: Mock;
  query: Record<string, { findFirst: Mock; findMany: Mock }>;
}

/**
 * Creates a mock database client for unit testing.
 *
 * This mock provides type-safe stubs for common database operations
 * that can be configured per test.
 *
 * @returns A mock database client with common methods stubbed
 *
 * @example
 * ```typescript
 * import { createMockDbClient } from './__tests__/helpers';
 *
 * const mockDb = createMockDbClient();
 * mockDb.execute.mockResolvedValue({ rows: [{ count: 5 }] });
 *
 * // Use in tests
 * const result = await myFunction(mockDb);
 * expect(mockDb.execute).toHaveBeenCalledWith(expect.any(Object));
 * ```
 */
export function createMockDbClient(): MockDbClient {
  const createQueryMethods = () => ({
    findFirst: vi.fn(),
    findMany: vi.fn(),
  });

  return {
    execute: vi.fn(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    transaction: vi.fn(async (callback: (tx: MockDbClient) => unknown) => {
      return await callback(createMockDbClient());
    }),
    query: {
      users: createQueryMethods(),
      organizations: createQueryMethods(),
    },
  };
}

/**
 * Test fixture for user data with consistent IDs.
 *
 * Use this for tests that need predictable user data.
 */
export interface TestUserFixture {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Test fixture for organization data with consistent IDs.
 */
export interface TestOrgFixture {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Creates a deterministic test user fixture.
 *
 * Uses a fixed seed to ensure consistent data across test runs.
 * The ID is generated fresh but all faker-based fields are deterministic.
 *
 * @param overrides - Optional field overrides
 * @returns A test user fixture
 *
 * @example
 * ```typescript
 * const user = createTestUser();
 * expect(user.email).toBeDefined();
 *
 * const customUser = createTestUser({ email: 'test@example.com' });
 * expect(customUser.email).toBe('test@example.com');
 * ```
 */
export function createTestUser(overrides?: Partial<TestUserFixture>): TestUserFixture {
  setFakerSeed(12345); // Deterministic seed
  const userData = createUserData();
  return {
    id: createId(),
    email: userData.email,
    name: userData.name,
    createdAt: userData.createdAt,
    updatedAt: userData.updatedAt,
    ...overrides,
  };
}

/**
 * Creates multiple deterministic test user fixtures.
 *
 * @param count - Number of users to create
 * @param overrides - Optional field overrides applied to all users
 * @returns Array of test user fixtures
 *
 * @example
 * ```typescript
 * const users = createTestUsers(5);
 * expect(users).toHaveLength(5);
 * ```
 */
export function createTestUsers(
  count: number,
  overrides?: Partial<TestUserFixture>
): TestUserFixture[] {
  return Array.from({ length: count }, (_, index) => {
    setFakerSeed(12345 + index); // Unique seed per user
    const userData = createUserData();
    return {
      id: createId(),
      email: userData.email,
      name: userData.name,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      ...overrides,
    };
  });
}

/**
 * Creates a deterministic test organization fixture.
 *
 * @param overrides - Optional field overrides
 * @returns A test organization fixture
 *
 * @example
 * ```typescript
 * const org = createTestOrganization();
 * expect(org.slug).toBeDefined();
 * ```
 */
export function createTestOrganization(overrides?: Partial<TestOrgFixture>): TestOrgFixture {
  setFakerSeed(67890); // Different seed from users
  const orgData = createOrganizationData();
  return {
    id: createId(),
    name: orgData.name,
    slug: orgData.slug,
    createdAt: orgData.createdAt,
    updatedAt: orgData.updatedAt,
    ...overrides,
  };
}

/**
 * Creates multiple deterministic test organization fixtures.
 *
 * @param count - Number of organizations to create
 * @param overrides - Optional field overrides applied to all orgs
 * @returns Array of test organization fixtures
 */
export function createTestOrganizations(
  count: number,
  overrides?: Partial<TestOrgFixture>
): TestOrgFixture[] {
  return Array.from({ length: count }, (_, index) => {
    setFakerSeed(67890 + index);
    const orgData = createOrganizationData();
    return {
      id: createId(),
      name: orgData.name,
      slug: orgData.slug,
      createdAt: orgData.createdAt,
      updatedAt: orgData.updatedAt,
      ...overrides,
    };
  });
}

/**
 * Creates a valid UUID for testing.
 *
 * Useful for organization IDs which are UUIDs in the database.
 *
 * @param seed - Optional seed for deterministic generation
 * @returns A valid UUID string
 */
export function createTestUuid(seed: number = 0): string {
  // Deterministic UUID based on seed (default 0 for reproducible tests)
  const hex = seed.toString(16).padStart(32, "0").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/**
 * Assertion helper to verify database query was called with correct filters.
 *
 * @param mock - The mock function to check
 * @param expectedFilter - Expected filter object properties
 *
 * @example
 * ```typescript
 * assertQueryCalledWith(mockDb.execute, { where: expect.any(Object) });
 * ```
 */
export function assertQueryCalledWith(mock: Mock, expectedFilter: Record<string, unknown>): void {
  expect(mock).toHaveBeenCalledWith(expect.objectContaining(expectedFilter));
}

/**
 * Waits for a specified duration.
 *
 * Useful for testing async operations with timing requirements.
 *
 * @param ms - Duration in milliseconds
 * @returns Promise that resolves after the duration
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Creates a mock date for testing timestamp-related functionality.
 *
 * @param isoString - Optional ISO date string (defaults to fixed date)
 * @returns A Date object
 */
export function createTestDate(isoString?: string): Date {
  return new Date(isoString ?? "2024-01-15T10:30:00.000Z");
}

/**
 * Performance measurement helper for testing operation timing.
 *
 * @param operation - Async operation to measure
 * @returns Duration in milliseconds
 *
 * @example
 * ```typescript
 * const duration = await measureDuration(async () => {
 *   await someAsyncOperation();
 * });
 * expect(duration).toBeLessThan(100);
 * ```
 */
export async function measureDuration(operation: () => Promise<unknown>): Promise<number> {
  const start = performance.now();
  await operation();
  return performance.now() - start;
}

/**
 * Re-export seed utilities for convenience
 */
export { setFakerSeed, createUserData, createOrganizationData } from "../seed/factories";
