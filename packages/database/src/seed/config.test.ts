/**
 * @file Seed Configuration Tests
 *
 * Tests for environment-based seed configuration.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getSeedConfig, getSeedEnvironment, type SeedConfig, type SeedEnvironment } from "./config";

describe("getSeedEnvironment", () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it("returns 'development' when NODE_ENV is development", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(getSeedEnvironment()).toBe("development");
  });

  it("returns 'test' when NODE_ENV is test", () => {
    vi.stubEnv("NODE_ENV", "test");
    expect(getSeedEnvironment()).toBe("test");
  });

  it("returns 'staging' when NODE_ENV is staging", () => {
    vi.stubEnv("NODE_ENV", "staging");
    expect(getSeedEnvironment()).toBe("staging");
  });

  it("returns 'development' as default when NODE_ENV is not set", () => {
    vi.stubEnv("NODE_ENV", "");
    expect(getSeedEnvironment()).toBe("development");
  });

  it("returns 'development' as default for unknown NODE_ENV", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(getSeedEnvironment()).toBe("development");
  });
});

describe("getSeedConfig", () => {
  it("returns configuration for development environment", () => {
    const config = getSeedConfig("development");

    expect(config.environment).toBe("development");
    expect(config.counts.users).toBeGreaterThan(0);
    expect(config.counts.organizations).toBeGreaterThan(0);
    expect(config.verbose).toBe(true);
  });

  it("returns configuration for test environment with minimal data", () => {
    const config = getSeedConfig("test");

    expect(config.environment).toBe("test");
    expect(config.counts.users).toBeLessThan(getSeedConfig("development").counts.users);
    expect(config.counts.organizations).toBeLessThan(
      getSeedConfig("development").counts.organizations
    );
    expect(config.verbose).toBe(false);
  });

  it("returns configuration for staging environment", () => {
    const config = getSeedConfig("staging");

    expect(config.environment).toBe("staging");
    expect(config.counts.users).toBeGreaterThan(getSeedConfig("development").counts.users);
    expect(config.verbose).toBe(true);
  });

  it("returns config with all required properties", () => {
    const config = getSeedConfig("development");

    expect(config).toHaveProperty("environment");
    expect(config).toHaveProperty("counts");
    expect(config).toHaveProperty("verbose");
    expect(config.counts).toHaveProperty("users");
    expect(config.counts).toHaveProperty("organizations");
  });
});

describe("SeedConfig type", () => {
  it("has correct shape for config object", () => {
    const config: SeedConfig = {
      environment: "development",
      counts: {
        users: 10,
        organizations: 5,
      },
      verbose: true,
    };

    expect(config.environment).toBe("development");
    expect(config.counts.users).toBe(10);
  });
});

describe("SeedEnvironment type", () => {
  it("accepts valid environment values", () => {
    const envs: SeedEnvironment[] = ["development", "test", "staging"];
    expect(envs).toHaveLength(3);
  });
});
