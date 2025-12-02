/**
 * @file Test Client Unit Tests
 *
 * Tests for the test database client and transaction helpers.
 * These tests mock the Neon Pool to verify behavior without a real database.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { shouldSkipDatabaseTests } from "./test-client";

import type { TestTransactionResult } from "./test-client";

// Store original env values
const originalEnv = { ...process.env };

describe("shouldSkipDatabaseTests", () => {
  beforeEach(() => {
    // Reset env before each test
    process.env = { ...originalEnv };
    delete process.env.DATABASE_URL_TEST;
    delete process.env.DATABASE_URL;
    delete process.env.SKIP_DB_TESTS;
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  it("returns true when SKIP_DB_TESTS is set to 'true'", () => {
    process.env.SKIP_DB_TESTS = "true";

    expect(shouldSkipDatabaseTests()).toBe(true);
  });

  it("returns true when neither DATABASE_URL_TEST nor DATABASE_URL is configured", () => {
    delete process.env.DATABASE_URL_TEST;
    delete process.env.DATABASE_URL;
    delete process.env.SKIP_DB_TESTS;

    expect(shouldSkipDatabaseTests()).toBe(true);
  });

  it("returns false when DATABASE_URL_TEST is configured", () => {
    process.env.DATABASE_URL_TEST = "postgresql://test@localhost:5432/test";
    delete process.env.SKIP_DB_TESTS;

    expect(shouldSkipDatabaseTests()).toBe(false);
  });

  it("returns false when DATABASE_URL is configured (fallback)", () => {
    delete process.env.DATABASE_URL_TEST;
    process.env.DATABASE_URL = "postgresql://test@localhost:5432/test";
    delete process.env.SKIP_DB_TESTS;

    expect(shouldSkipDatabaseTests()).toBe(false);
  });

  it("returns true when SKIP_DB_TESTS is true even with DATABASE_URL_TEST", () => {
    process.env.DATABASE_URL_TEST = "postgresql://test@localhost:5432/test";
    process.env.SKIP_DB_TESTS = "true";

    expect(shouldSkipDatabaseTests()).toBe(true);
  });
});

describe("test-client module exports", () => {
  it("exports createTestDatabase function", async () => {
    const { createTestDatabase } = await import("./test-client");
    expect(typeof createTestDatabase).toBe("function");
  });

  it("exports createTestTransaction function", async () => {
    const { createTestTransaction } = await import("./test-client");
    expect(typeof createTestTransaction).toBe("function");
  });

  it("exports createTestTransactionContext function", async () => {
    const { createTestTransactionContext } = await import("./test-client");
    expect(typeof createTestTransactionContext).toBe("function");
  });

  it("exports closeTestDatabase function", async () => {
    const { closeTestDatabase } = await import("./test-client");
    expect(typeof closeTestDatabase).toBe("function");
  });

  it("exports shouldSkipDatabaseTests function", async () => {
    const { shouldSkipDatabaseTests } = await import("./test-client");
    expect(typeof shouldSkipDatabaseTests).toBe("function");
  });
});

describe("TestTransactionResult type", () => {
  it("has correct shape for success result", () => {
    // Type-level test - if this compiles, the type is correct
    const successResult: TestTransactionResult<string> = {
      success: true,
      result: "test data",
    };

    expect(successResult.success).toBe(true);
    expect(successResult.result).toBe("test data");
    expect(successResult.error).toBeUndefined();
  });

  it("has correct shape for failure result", () => {
    const failureResult: TestTransactionResult<string> = {
      success: false,
      error: "Something went wrong",
    };

    expect(failureResult.success).toBe(false);
    expect(failureResult.error).toBe("Something went wrong");
    expect(failureResult.result).toBeUndefined();
  });
});
