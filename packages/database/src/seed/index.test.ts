/**
 * @file Seed Entry Point Tests
 *
 * Tests for the main seed orchestration and entry point.
 */
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import {
  runSeed,
  createSeedRunner,
  type SeedResult,
  type SeedOptions,
  type SeedRunner,
  type SeedFunction,
} from "./index";

// Mock the database client
vi.mock("../client", () => ({
  db: {
    execute: vi.fn(),
    transaction: vi.fn((callback: (tx: { execute: ReturnType<typeof vi.fn> }) => unknown) =>
      callback({ execute: vi.fn() })
    ),
  },
}));

describe("runSeed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns success result when all seeds complete", async () => {
    const mockSeedFn: SeedFunction = vi.fn().mockResolvedValue({ count: 10 });

    const result = await runSeed({
      seeds: [{ name: "users", seed: mockSeedFn }],
      verbose: false,
    });

    expect(result.success).toBe(true);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("returns failure result when seed throws", async () => {
    const mockSeedFn: SeedFunction = vi.fn().mockRejectedValue(new Error("Seed failed"));

    const result = await runSeed({
      seeds: [{ name: "users", seed: mockSeedFn }],
      verbose: false,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Seed failed");
  });

  it("runs seeds in order", async () => {
    const callOrder: string[] = [];

    const seed1: SeedFunction = vi.fn().mockImplementation(() => {
      callOrder.push("users");
      return Promise.resolve({ count: 5 });
    });
    const seed2: SeedFunction = vi.fn().mockImplementation(() => {
      callOrder.push("organizations");
      return Promise.resolve({ count: 3 });
    });

    await runSeed({
      seeds: [
        { name: "users", seed: seed1 },
        { name: "organizations", seed: seed2 },
      ],
      verbose: false,
    });

    expect(callOrder).toEqual(["users", "organizations"]);
  });

  it("logs progress when verbose is true", async () => {
    const mockSeedFn: SeedFunction = vi.fn().mockResolvedValue({ count: 10 });

    await runSeed({
      seeds: [{ name: "users", seed: mockSeedFn }],
      verbose: true,
    });

    expect(console.log).toHaveBeenCalled();
  });

  it("tracks seeded table counts in result", async () => {
    const mockSeedFn: SeedFunction = vi.fn().mockResolvedValue({ count: 15 });

    const result = await runSeed({
      seeds: [{ name: "users", seed: mockSeedFn }],
      verbose: false,
    });

    expect(result.tablesSeeded).toContain("users");
    expect(result.totalRecords).toBe(15);
  });

  it("accumulates total records across multiple seeds", async () => {
    const result = await runSeed({
      seeds: [
        { name: "users", seed: vi.fn().mockResolvedValue({ count: 10 }) },
        { name: "orgs", seed: vi.fn().mockResolvedValue({ count: 5 }) },
      ],
      verbose: false,
    });

    expect(result.totalRecords).toBe(15);
    expect(result.tablesSeeded).toEqual(["users", "orgs"]);
  });
});

describe("createSeedRunner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a reusable seed runner", () => {
    const runner = createSeedRunner({
      verbose: false,
    });

    expect(typeof runner.run).toBe("function");
    expect(typeof runner.addSeed).toBe("function");
  });

  it("allows adding seeds before running", async () => {
    const runner = createSeedRunner({ verbose: false });
    const mockSeed: SeedFunction = vi.fn().mockResolvedValue({ count: 5 });

    runner.addSeed("users", mockSeed);
    const result = await runner.run();

    expect(mockSeed).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it("respects environment-based configuration", () => {
    const runner = createSeedRunner({
      environment: "test",
      verbose: false,
    });

    expect(runner.getConfig().environment).toBe("test");
  });

  it("allows overriding config at runtime", async () => {
    const runner = createSeedRunner({ verbose: false });
    const mockSeed: SeedFunction = vi.fn().mockResolvedValue({ count: 5 });

    runner.addSeed("users", mockSeed);
    await runner.run({ verbose: true });

    // The seed should still run successfully with overridden config
    expect(mockSeed).toHaveBeenCalled();
  });
});

describe("SeedResult type", () => {
  it("has correct shape for success result", () => {
    const result: SeedResult = {
      success: true,
      durationMs: 150,
      tablesSeeded: ["users", "organizations"],
      totalRecords: 100,
    };

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("has correct shape for failure result", () => {
    const result: SeedResult = {
      success: false,
      durationMs: 50,
      tablesSeeded: ["users"],
      totalRecords: 10,
      error: "Failed to seed organizations",
    };

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe("SeedOptions type", () => {
  it("accepts required and optional properties", () => {
    const options: SeedOptions = {
      seeds: [{ name: "users", seed: vi.fn() }],
      verbose: true,
      environment: "development",
    };

    expect(options.seeds).toHaveLength(1);
    expect(options.verbose).toBe(true);
  });
});

describe("SeedRunner type", () => {
  it("has correct interface shape", () => {
    const runner: SeedRunner = {
      run: vi
        .fn()
        .mockResolvedValue({ success: true, durationMs: 0, tablesSeeded: [], totalRecords: 0 }),
      addSeed: vi.fn(),
      getConfig: vi.fn().mockReturnValue({ environment: "test", counts: {}, verbose: false }),
    };

    expect(typeof runner.run).toBe("function");
    expect(typeof runner.addSeed).toBe("function");
    expect(typeof runner.getConfig).toBe("function");
  });
});
