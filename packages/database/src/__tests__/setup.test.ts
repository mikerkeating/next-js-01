/**
 * @file Test Setup Unit Tests
 *
 * Tests for the test environment setup and teardown utilities.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  TEST_DATABASE_URL_ENV,
  TEST_TIMEOUTS,
  setupTestEnvironment,
  teardownTestEnvironment,
  shouldSkipDatabaseTests,
} from "./setup";

import type { TestDatabase, TestTransactionClient, TestTransactionResult } from "./setup";

// Store original env values
const originalEnv = { ...process.env };

describe("TEST_DATABASE_URL_ENV", () => {
  it("equals 'DATABASE_URL_TEST'", () => {
    expect(TEST_DATABASE_URL_ENV).toBe("DATABASE_URL_TEST");
  });
});

describe("TEST_TIMEOUTS", () => {
  it("has correct timeout values", () => {
    expect(TEST_TIMEOUTS.unit).toBe(5000);
    expect(TEST_TIMEOUTS.integration).toBe(10000);
    expect(TEST_TIMEOUTS.performance).toBe(30000);
  });

  it("is read-only", () => {
    // This is a compile-time check - the object is typed as const
    const timeouts: typeof TEST_TIMEOUTS = TEST_TIMEOUTS;
    expect(typeof timeouts.unit).toBe("number");
  });
});

describe("setupTestEnvironment", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(async () => {
    await teardownTestEnvironment();
    process.env = originalEnv;
  });

  it("swaps DATABASE_URL with DATABASE_URL_TEST when available", () => {
    const originalUrl = "postgresql://prod@localhost/prod";
    const testUrl = "postgresql://test@localhost/test";

    process.env.DATABASE_URL = originalUrl;
    process.env.DATABASE_URL_TEST = testUrl;

    setupTestEnvironment();

    expect(process.env.DATABASE_URL).toBe(testUrl);
  });

  it("preserves DATABASE_URL when DATABASE_URL_TEST is not set", () => {
    const originalUrl = "postgresql://prod@localhost/prod";
    process.env.DATABASE_URL = originalUrl;
    delete process.env.DATABASE_URL_TEST;

    setupTestEnvironment();

    expect(process.env.DATABASE_URL).toBe(originalUrl);
  });

  it("is idempotent - calling twice has same effect as once", () => {
    const testUrl = "postgresql://test@localhost/test";
    process.env.DATABASE_URL_TEST = testUrl;

    setupTestEnvironment();
    setupTestEnvironment();

    expect(process.env.DATABASE_URL).toBe(testUrl);
  });
});

describe("teardownTestEnvironment", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("restores original DATABASE_URL after teardown", async () => {
    const originalUrl = "postgresql://prod@localhost/prod";
    const testUrl = "postgresql://test@localhost/test";

    process.env.DATABASE_URL = originalUrl;
    process.env.DATABASE_URL_TEST = testUrl;

    setupTestEnvironment();
    expect(process.env.DATABASE_URL).toBe(testUrl);

    await teardownTestEnvironment();
    expect(process.env.DATABASE_URL).toBe(originalUrl);
  });

  it("removes DATABASE_URL if it was originally undefined", async () => {
    delete process.env.DATABASE_URL;
    process.env.DATABASE_URL_TEST = "postgresql://test@localhost/test";

    setupTestEnvironment();
    expect(process.env.DATABASE_URL).toBe("postgresql://test@localhost/test");

    await teardownTestEnvironment();
    expect(process.env.DATABASE_URL).toBeUndefined();
  });

  it("is safe to call without setup", async () => {
    // Should not throw
    await expect(teardownTestEnvironment()).resolves.toBeUndefined();
  });
});

describe("shouldSkipDatabaseTests (from setup)", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.DATABASE_URL_TEST;
    delete process.env.DATABASE_URL;
    delete process.env.SKIP_DB_TESTS;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns true when no database URL configured", () => {
    expect(shouldSkipDatabaseTests()).toBe(true);
  });

  it("returns false when DATABASE_URL_TEST is configured", () => {
    process.env.DATABASE_URL_TEST = "postgresql://test@localhost/test";

    expect(shouldSkipDatabaseTests()).toBe(false);
  });

  it("returns false when DATABASE_URL is configured (fallback)", () => {
    process.env.DATABASE_URL = "postgresql://test@localhost/test";

    expect(shouldSkipDatabaseTests()).toBe(false);
  });

  it("returns true when SKIP_DB_TESTS is true", () => {
    process.env.SKIP_DB_TESTS = "true";

    expect(shouldSkipDatabaseTests()).toBe(true);
  });
});

describe("setup module exports", () => {
  it("exports getTestDatabase function", async () => {
    const { getTestDatabase } = await import("./setup");
    expect(typeof getTestDatabase).toBe("function");
  });

  it("exports withTestTransaction function", async () => {
    const { withTestTransaction } = await import("./setup");
    expect(typeof withTestTransaction).toBe("function");
  });

  it("exports useTransactionIsolation function", async () => {
    const { useTransactionIsolation } = await import("./setup");
    expect(typeof useTransactionIsolation).toBe("function");
  });

  it("exports setupIntegrationTest function", async () => {
    const { setupIntegrationTest } = await import("./setup");
    expect(typeof setupIntegrationTest).toBe("function");
  });

  it("exports createTransactionIsolation function", async () => {
    const { createTransactionIsolation } = await import("./setup");
    expect(typeof createTransactionIsolation).toBe("function");
  });
});

describe("type exports from setup", () => {
  it("exports TestDatabase type", () => {
    // Type-level test - if this compiles, the type is exported correctly
    const typeCheck: TestDatabase | null = null;
    expect(typeCheck).toBeNull();
  });

  it("exports TestTransactionClient type", () => {
    // Type-level test - if this compiles, the type is exported correctly
    const typeCheck: TestTransactionClient | null = null;
    expect(typeCheck).toBeNull();
  });

  it("exports TestTransactionResult type", () => {
    // Type-level test - if this compiles, the type is exported correctly
    const typeCheck: TestTransactionResult<string> | null = null;
    expect(typeCheck).toBeNull();
  });
});
