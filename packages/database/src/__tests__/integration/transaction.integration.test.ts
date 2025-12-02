/**
 * Transaction Integration Tests
 *
 * Tests that verify transaction behavior works correctly against
 * a live PostgreSQL instance.
 *
 * Per story S10 requirements:
 * - Verify transaction commits persist data
 * - Verify transaction rollback reverts data
 * - Verify createTestTransaction() helper isolates tests
 *
 * Note: These tests use a temporary table to avoid affecting the actual database schema.
 *
 * @packageDocumentation
 */

import { sql } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createTestDatabase, createTestTransaction, describeIntegration } from "./setup";

import type { TestDatabase } from "./setup";

/**
 * Test table name - using a unique name to avoid conflicts
 */
const TEST_TABLE = "integration_test_transactions";

describeIntegration("Transaction Integration Tests", () => {
  let db: TestDatabase;

  beforeEach(async () => {
    db = await createTestDatabase();

    // Create a temporary test table for transaction testing
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ${sql.identifier(TEST_TABLE)} (
        id SERIAL PRIMARY KEY,
        value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Clean up any leftover data from previous test runs
    await db.execute(sql`DELETE FROM ${sql.identifier(TEST_TABLE)}`);
  });

  afterEach(async () => {
    // Clean up test table after each test
    try {
      await db.execute(sql`DELETE FROM ${sql.identifier(TEST_TABLE)}`);
    } catch {
      // Table may not exist if test failed early
    }
  });

  describe("Transaction Commit Behavior", () => {
    it("should persist data when transaction completes normally", async () => {
      const testValue = `commit-test-${Date.now()}`;

      // Insert data using the database directly (auto-commit)
      await db.execute(sql`
        INSERT INTO ${sql.identifier(TEST_TABLE)} (value)
        VALUES (${testValue})
      `);

      // Verify data persisted
      const result = await db.execute(sql`
        SELECT value FROM ${sql.identifier(TEST_TABLE)}
        WHERE value = ${testValue}
      `);

      const rows = (result.rows || result) as Array<{ value: string }>;
      expect(rows).toHaveLength(1);
      expect(rows[0]?.value).toBe(testValue);
    });

    it("should persist data from explicit transaction commit", async () => {
      const testValue = `explicit-commit-${Date.now()}`;

      // Use an explicit transaction
      await db.transaction(async (tx) => {
        await tx.execute(sql`
          INSERT INTO ${sql.identifier(TEST_TABLE)} (value)
          VALUES (${testValue})
        `);
        // Transaction commits automatically when callback completes without error
      });

      // Verify data persisted
      const result = await db.execute(sql`
        SELECT value FROM ${sql.identifier(TEST_TABLE)}
        WHERE value = ${testValue}
      `);

      const rows = (result.rows || result) as Array<{ value: string }>;
      expect(rows).toHaveLength(1);
      expect(rows[0]?.value).toBe(testValue);
    });
  });

  describe("Transaction Rollback Behavior", () => {
    it("should rollback data when transaction throws error", async () => {
      const testValue = `rollback-test-${Date.now()}`;

      // Transaction that will be rolled back
      try {
        await db.transaction(async (tx) => {
          await tx.execute(sql`
            INSERT INTO ${sql.identifier(TEST_TABLE)} (value)
            VALUES (${testValue})
          `);

          // Intentionally throw to trigger rollback
          throw new Error("Intentional rollback");
        });
      } catch {
        // Expected error from rollback
      }

      // Verify data was NOT persisted
      const result = await db.execute(sql`
        SELECT value FROM ${sql.identifier(TEST_TABLE)}
        WHERE value = ${testValue}
      `);

      const rows = (result.rows || result) as Array<{ value: string }>;
      expect(rows).toHaveLength(0);
    });

    it("should rollback multiple inserts on error", async () => {
      const testValues = [
        `multi-rollback-1-${Date.now()}`,
        `multi-rollback-2-${Date.now()}`,
        `multi-rollback-3-${Date.now()}`,
      ];

      try {
        await db.transaction(async (tx) => {
          // Insert multiple rows
          for (const value of testValues) {
            await tx.execute(sql`
              INSERT INTO ${sql.identifier(TEST_TABLE)} (value)
              VALUES (${value})
            `);
          }

          // Throw after all inserts to trigger rollback
          throw new Error("Intentional rollback after multiple inserts");
        });
      } catch {
        // Expected error
      }

      // Verify NONE of the data was persisted
      const result = await db.execute(sql`
        SELECT value FROM ${sql.identifier(TEST_TABLE)}
        WHERE value LIKE 'multi-rollback-%'
      `);

      const rows = (result.rows || result) as Array<{ value: string }>;
      expect(rows).toHaveLength(0);
    });
  });

  describe("Test Transaction Helper (createTestTransaction)", () => {
    it("should automatically rollback after callback completes", async () => {
      const testValue = `helper-test-${Date.now()}`;

      // Use the test transaction helper
      const result = await createTestTransaction(async (tx) => {
        await tx.execute(sql`
          INSERT INTO ${sql.identifier(TEST_TABLE)} (value)
          VALUES (${testValue})
        `);

        // Verify data exists within transaction
        const checkResult = await tx.execute(sql`
          SELECT value FROM ${sql.identifier(TEST_TABLE)}
          WHERE value = ${testValue}
        `);

        const rows = (checkResult.rows || checkResult) as Array<{ value: string }>;
        expect(rows).toHaveLength(1);

        return rows[0]?.value;
      });

      // Callback should have succeeded
      expect(result.success).toBe(true);
      expect(result.result).toBe(testValue);

      // But data should NOT persist (rolled back)
      const persistCheck = await db.execute(sql`
        SELECT value FROM ${sql.identifier(TEST_TABLE)}
        WHERE value = ${testValue}
      `);

      const persistedRows = (persistCheck.rows || persistCheck) as Array<{ value: string }>;
      expect(persistedRows).toHaveLength(0);
    });

    it("should isolate multiple test transactions", async () => {
      const value1 = `isolation-1-${Date.now()}`;
      const value2 = `isolation-2-${Date.now()}`;

      // First test transaction
      await createTestTransaction(async (tx) => {
        await tx.execute(sql`
          INSERT INTO ${sql.identifier(TEST_TABLE)} (value)
          VALUES (${value1})
        `);
      });

      // Second test transaction
      await createTestTransaction(async (tx) => {
        await tx.execute(sql`
          INSERT INTO ${sql.identifier(TEST_TABLE)} (value)
          VALUES (${value2})
        `);
      });

      // Neither should persist
      const result = await db.execute(sql`
        SELECT value FROM ${sql.identifier(TEST_TABLE)}
        WHERE value LIKE 'isolation-%'
      `);

      const rows = (result.rows || result) as Array<{ value: string }>;
      expect(rows).toHaveLength(0);
    });

    it("should capture callback errors in result", async () => {
      const result = await createTestTransaction(() => {
        throw new Error("Test callback error");
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Test callback error");
    });

    it("should return callback result on success", async () => {
      const expectedResult = { foo: "bar", count: 42 };

      const result = await createTestTransaction(() => {
        return Promise.resolve(expectedResult);
      });

      expect(result.success).toBe(true);
      expect(result.result).toEqual(expectedResult);
    });
  });

  describe("Transaction Isolation Levels", () => {
    it("should maintain data consistency within transaction", async () => {
      const testValue = `consistency-${Date.now()}`;

      await createTestTransaction(async (tx) => {
        // Insert data
        await tx.execute(sql`
          INSERT INTO ${sql.identifier(TEST_TABLE)} (value)
          VALUES (${testValue})
        `);

        // Update data
        await tx.execute(sql`
          UPDATE ${sql.identifier(TEST_TABLE)}
          SET value = ${testValue + "-updated"}
          WHERE value = ${testValue}
        `);

        // Read updated data within same transaction
        const result = await tx.execute(sql`
          SELECT value FROM ${sql.identifier(TEST_TABLE)}
          WHERE value = ${testValue + "-updated"}
        `);

        const rows = (result.rows || result) as Array<{ value: string }>;
        expect(rows).toHaveLength(1);
        expect(rows[0]?.value).toBe(testValue + "-updated");
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle constraint violations and rollback", async () => {
      // Create a unique constraint for testing
      await db.execute(sql`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_test_value_unique
        ON ${sql.identifier(TEST_TABLE)} (value)
      `);

      const duplicateValue = `duplicate-${Date.now()}`;

      // First insert should succeed
      await db.execute(sql`
        INSERT INTO ${sql.identifier(TEST_TABLE)} (value)
        VALUES (${duplicateValue})
      `);

      // Transaction with duplicate should rollback
      try {
        await db.transaction(async (tx) => {
          // This should fail due to unique constraint
          await tx.execute(sql`
            INSERT INTO ${sql.identifier(TEST_TABLE)} (value)
            VALUES (${duplicateValue})
          `);
        });
        // Should not reach here
        expect.fail("Expected unique constraint violation");
      } catch (error) {
        // Expected error
        expect(error).toBeDefined();
      }

      // Verify only one row exists
      const result = await db.execute(sql`
        SELECT COUNT(*) as count FROM ${sql.identifier(TEST_TABLE)}
        WHERE value = ${duplicateValue}
      `);

      const rows = (result.rows || result) as Array<{ count: string | number }>;
      expect(Number(rows[0]?.count)).toBe(1);

      // Clean up the unique index
      await db.execute(sql`DROP INDEX IF EXISTS idx_test_value_unique`);
    });
  });
});
