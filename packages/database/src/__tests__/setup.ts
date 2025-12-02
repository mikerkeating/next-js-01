/**
 * Test Environment Setup and Teardown
 *
 * Provides global test setup and teardown hooks for the database package.
 * This file configures the test environment for both unit and integration tests.
 *
 * Key features:
 * - Environment variable setup for test database
 * - Test isolation via transaction rollback pattern
 * - Cleanup utilities for test data
 *
 * @packageDocumentation
 */

import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";

/**
 * Test database URL environment variable name
 */
export const TEST_DATABASE_URL_ENV = "DATABASE_URL_TEST";

/**
 * Original DATABASE_URL value to restore after tests
 */
let originalDatabaseUrl: string | undefined;

/**
 * Whether the test environment has been initialized
 */
let isInitialized = false;

/**
 * Sets up the test environment.
 *
 * This function:
 * - Swaps DATABASE_URL with DATABASE_URL_TEST if available
 * - Sets up any global test state
 *
 * @remarks
 * For unit tests that mock the database client, this setup is optional.
 * For integration tests requiring a real database, ensure DATABASE_URL_TEST is set.
 */
export function setupTestEnvironment(): void {
  if (isInitialized) return;

  // Store original DATABASE_URL
  originalDatabaseUrl = process.env.DATABASE_URL;

  // Use test database URL if available
  const testDbUrl = process.env[TEST_DATABASE_URL_ENV];
  if (testDbUrl) {
    process.env.DATABASE_URL = testDbUrl;
  }

  isInitialized = true;
}

/**
 * Tears down the test environment.
 *
 * This function:
 * - Restores the original DATABASE_URL
 * - Cleans up any global test state
 */
export function teardownTestEnvironment(): void {
  if (!isInitialized) return;

  // Restore original DATABASE_URL
  if (originalDatabaseUrl !== undefined) {
    process.env.DATABASE_URL = originalDatabaseUrl;
  } else {
    delete process.env.DATABASE_URL;
  }

  isInitialized = false;
}

/**
 * Creates a test suite with automatic setup and teardown.
 *
 * Use this for integration tests that need the test database environment.
 *
 * @example
 * ```typescript
 * import { setupIntegrationTest } from './__tests__/setup';
 *
 * setupIntegrationTest();
 *
 * describe('Database operations', () => {
 *   it('performs database query', async () => {
 *     // Test code here
 *   });
 * });
 * ```
 */
export function setupIntegrationTest(): void {
  beforeAll(() => {
    setupTestEnvironment();
  });

  afterAll(() => {
    teardownTestEnvironment();
  });
}

/**
 * Transaction wrapper type for test isolation.
 *
 * This type represents the interface for running code within a transaction
 * that will be rolled back after the test completes.
 */
export interface TestTransaction {
  /** Execute a callback within the transaction */
  execute<T>(callback: () => Promise<T>): Promise<T>;
  /** Rollback the transaction */
  rollback(): Promise<void>;
}

/**
 * Creates hooks for test isolation using transaction rollback.
 *
 * This pattern ensures each test runs in isolation by:
 * 1. Starting a transaction before each test
 * 2. Rolling back the transaction after each test
 *
 * @param createTransaction - Factory function to create a transaction
 *
 * @example
 * ```typescript
 * import { createTransactionIsolation } from './__tests__/setup';
 * import { db } from '../client';
 *
 * const { transaction } = createTransactionIsolation(async () => {
 *   return db.transaction();
 * });
 *
 * describe('User operations', () => {
 *   it('creates user', async () => {
 *     await transaction.execute(async () => {
 *       // Operations will be rolled back after test
 *     });
 *   });
 * });
 * ```
 */
export function createTransactionIsolation(createTransaction: () => Promise<TestTransaction>): {
  transaction: TestTransaction;
} {
  let currentTransaction: TestTransaction | null = null;

  beforeEach(async () => {
    currentTransaction = await createTransaction();
  });

  afterEach(async () => {
    if (currentTransaction) {
      await currentTransaction.rollback();
      currentTransaction = null;
    }
  });

  return {
    get transaction(): TestTransaction {
      if (!currentTransaction) {
        throw new Error("No active transaction. Ensure beforeEach has completed.");
      }
      return currentTransaction;
    },
  };
}

/**
 * Skips tests when DATABASE_URL_TEST is not available.
 *
 * Use this for integration tests that require a real database connection.
 *
 * @returns true if tests should be skipped, false otherwise
 *
 * @example
 * ```typescript
 * import { shouldSkipDatabaseTests } from './__tests__/setup';
 *
 * describe.skipIf(shouldSkipDatabaseTests())('Database integration', () => {
 *   it('queries database', async () => {
 *     // Test code
 *   });
 * });
 * ```
 */
export function shouldSkipDatabaseTests(): boolean {
  return !process.env[TEST_DATABASE_URL_ENV] && process.env.SKIP_DB_TESTS === "true";
}

/**
 * Test timeout constants in milliseconds
 */
export const TEST_TIMEOUTS = {
  /** Timeout for unit tests (fast, no I/O) */
  unit: 5000,
  /** Timeout for integration tests (database operations) */
  integration: 10000,
  /** Timeout for performance tests */
  performance: 30000,
} as const;
