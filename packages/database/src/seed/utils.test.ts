/**
 * @file Seed Utilities Tests
 *
 * Tests for seed helper functions including logging and progress tracking.
 */
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import {
  createSeedLogger,
  createProgressTracker,
  SeedError,
  type SeedLogger,
  type ProgressTracker,
  type SeedErrorCode,
} from "./utils";

describe("createSeedLogger", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs info messages when verbose is true", () => {
    const logger = createSeedLogger({ verbose: true });
    logger.info("Test message");

    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("Test message"));
  });

  it("does not log info messages when verbose is false", () => {
    const logger = createSeedLogger({ verbose: false });
    logger.info("Test message");

    expect(console.warn).not.toHaveBeenCalled();
  });

  it("always logs error messages regardless of verbose setting", () => {
    const logger = createSeedLogger({ verbose: false });
    logger.error("Error message");

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Error message"));
  });

  it("logs success messages when verbose is true", () => {
    const logger = createSeedLogger({ verbose: true });
    logger.success("Success message");

    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("Success message"));
  });

  it("includes prefix in log messages", () => {
    const logger = createSeedLogger({ verbose: true, prefix: "[SEED]" });
    logger.info("Test");

    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("[SEED]"));
  });

  it("logs table name in seeding message", () => {
    const logger = createSeedLogger({ verbose: true });
    logger.seeding("users", 10);

    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("users"));
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("10"));
  });

  it("logs table name in seeded message", () => {
    const logger = createSeedLogger({ verbose: true });
    logger.seeded("users", 10, 150);

    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("users"));
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("10"));
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("150"));
  });
});

describe("createProgressTracker", () => {
  it("tracks progress of multiple tables", () => {
    const tracker = createProgressTracker(["users", "organizations"]);

    expect(tracker.getProgress()).toEqual({
      total: 2,
      completed: 0,
      percentage: 0,
    });
  });

  it("updates progress when table is marked complete", () => {
    const tracker = createProgressTracker(["users", "organizations", "posts"]);

    tracker.complete("users");

    expect(tracker.getProgress()).toEqual({
      total: 3,
      completed: 1,
      percentage: 33,
    });
  });

  it("tracks all tables as complete", () => {
    const tracker = createProgressTracker(["users", "organizations"]);

    tracker.complete("users");
    tracker.complete("organizations");

    expect(tracker.getProgress()).toEqual({
      total: 2,
      completed: 2,
      percentage: 100,
    });
  });

  it("returns list of pending tables", () => {
    const tracker = createProgressTracker(["users", "organizations", "posts"]);

    tracker.complete("users");

    expect(tracker.getPending()).toEqual(["organizations", "posts"]);
  });

  it("returns list of completed tables", () => {
    const tracker = createProgressTracker(["users", "organizations", "posts"]);

    tracker.complete("users");
    tracker.complete("posts");

    expect(tracker.getCompleted()).toEqual(["users", "posts"]);
  });

  it("does not count duplicate completions", () => {
    const tracker = createProgressTracker(["users"]);

    tracker.complete("users");
    tracker.complete("users");

    expect(tracker.getProgress().completed).toBe(1);
  });

  it("ignores unknown table completions", () => {
    const tracker = createProgressTracker(["users"]);

    tracker.complete("unknown");

    expect(tracker.getProgress().completed).toBe(0);
  });
});

describe("SeedError", () => {
  it("creates error with code and message", () => {
    const error = new SeedError("Seeding failed", "SEED_FAILED");

    expect(error.message).toBe("Seeding failed");
    expect(error.code).toBe("SEED_FAILED");
    expect(error.name).toBe("SeedError");
  });

  it("creates error with cause", () => {
    const cause = new Error("Original error");
    const error = new SeedError("Seeding failed", "SEED_FAILED", cause);

    expect(error.cause).toBe(cause);
  });

  it("is instance of Error", () => {
    const error = new SeedError("Test", "SEED_FAILED");

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(SeedError);
  });
});

describe("SeedLogger type", () => {
  it("has correct interface shape", () => {
    const logger: SeedLogger = {
      info: vi.fn(),
      error: vi.fn(),
      success: vi.fn(),
      seeding: vi.fn(),
      seeded: vi.fn(),
    };

    expect(typeof logger.info).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.success).toBe("function");
    expect(typeof logger.seeding).toBe("function");
    expect(typeof logger.seeded).toBe("function");
  });
});

describe("ProgressTracker type", () => {
  it("has correct interface shape", () => {
    const tracker: ProgressTracker = {
      complete: vi.fn(),
      getProgress: vi.fn().mockReturnValue({ total: 0, completed: 0, percentage: 0 }),
      getPending: vi.fn().mockReturnValue([]),
      getCompleted: vi.fn().mockReturnValue([]),
    };

    expect(typeof tracker.complete).toBe("function");
    expect(typeof tracker.getProgress).toBe("function");
  });
});

describe("SeedErrorCode type", () => {
  it("accepts valid error codes", () => {
    const codes: SeedErrorCode[] = [
      "SEED_FAILED",
      "CLEAR_FAILED",
      "INVALID_CONFIG",
      "CONNECTION_ERROR",
    ];

    expect(codes).toHaveLength(4);
  });
});
