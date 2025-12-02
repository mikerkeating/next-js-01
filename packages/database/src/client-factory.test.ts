/**
 * @file Client Factory Unit Tests
 *
 * Tests for database client factory that selects the appropriate driver
 * based on DATABASE_URL format (Neon HTTP vs local postgres).
 *
 * Per AD-2A.2.S9.1: URL-based driver selection auto-detects database type
 * from connection string format rather than requiring separate config.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  isNeonUrl,
  isLocalPostgresUrl,
  getDatabaseType,
  type DatabaseType,
} from "./client-factory";

describe("isNeonUrl", () => {
  it("returns true for URLs containing neon.tech domain", () => {
    const url = "postgres://user:pass@ep-example-123.us-east-1.aws.neon.tech/neondb";
    expect(isNeonUrl(url)).toBe(true);
  });

  it("returns true for URLs containing neon.tech with pooler", () => {
    const url = "postgres://user:pass@ep-example-123-pooler.us-east-1.aws.neon.tech/neondb";
    expect(isNeonUrl(url)).toBe(true);
  });

  it("returns true for URLs with @neon prefix pattern", () => {
    const url = "postgres://user:pass@neon.host.example.com/db";
    // This is NOT a Neon URL - it just has neon in the hostname
    // We should only match actual neon.tech domains
    expect(isNeonUrl(url)).toBe(false);
  });

  it("returns true for Neon URLs with different regions", () => {
    const urls = [
      "postgres://user:pass@ep-example.eu-central-1.aws.neon.tech/db",
      "postgres://user:pass@ep-example.ap-southeast-1.aws.neon.tech/db",
      "postgres://user:pass@ep-example.us-west-2.aws.neon.tech/db",
    ];

    urls.forEach((url) => {
      expect(isNeonUrl(url)).toBe(true);
    });
  });

  it("returns false for localhost URLs", () => {
    const url = "postgres://postgres:postgres@localhost:5432/postgres";
    expect(isNeonUrl(url)).toBe(false);
  });

  it("returns false for 127.0.0.1 URLs", () => {
    const url = "postgres://postgres:postgres@127.0.0.1:5432/postgres";
    expect(isNeonUrl(url)).toBe(false);
  });

  it("returns false for Docker host URLs", () => {
    const url = "postgres://postgres:postgres@host.docker.internal:5432/postgres";
    expect(isNeonUrl(url)).toBe(false);
  });

  it("returns false for other cloud providers", () => {
    const urls = [
      "postgres://user:pass@db.supabase.co/postgres",
      "postgres://user:pass@db.render.com/mydb",
      "postgres://user:pass@some-rds.amazonaws.com/mydb",
    ];

    urls.forEach((url) => {
      expect(isNeonUrl(url)).toBe(false);
    });
  });
});

describe("isLocalPostgresUrl", () => {
  it("returns true for localhost URLs", () => {
    const url = "postgres://postgres:postgres@localhost:5432/postgres";
    expect(isLocalPostgresUrl(url)).toBe(true);
  });

  it("returns true for localhost URLs without port", () => {
    const url = "postgres://postgres:postgres@localhost/postgres";
    expect(isLocalPostgresUrl(url)).toBe(true);
  });

  it("returns true for 127.0.0.1 URLs", () => {
    const url = "postgres://user:pass@127.0.0.1:5432/mydb";
    expect(isLocalPostgresUrl(url)).toBe(true);
  });

  it("returns true for Docker internal host URLs", () => {
    const url = "postgres://postgres:postgres@host.docker.internal:5432/postgres";
    expect(isLocalPostgresUrl(url)).toBe(true);
  });

  it("returns true for IPv6 localhost URLs", () => {
    const url = "postgres://postgres:postgres@[::1]:5432/postgres";
    expect(isLocalPostgresUrl(url)).toBe(true);
  });

  it("returns false for Neon URLs", () => {
    const url = "postgres://user:pass@ep-example.us-east-1.aws.neon.tech/neondb";
    expect(isLocalPostgresUrl(url)).toBe(false);
  });

  it("returns false for other remote URLs", () => {
    const urls = [
      "postgres://user:pass@db.supabase.co/postgres",
      "postgres://user:pass@remote.example.com/mydb",
      "postgres://user:pass@production.internal/mydb",
    ];

    urls.forEach((url) => {
      expect(isLocalPostgresUrl(url)).toBe(false);
    });
  });
});

describe("getDatabaseType", () => {
  beforeEach(() => {
    vi.stubEnv("DATABASE_URL", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 'neon' for Neon URLs", () => {
    const url = "postgres://user:pass@ep-example.us-east-1.aws.neon.tech/neondb";
    expect(getDatabaseType(url)).toBe("neon");
  });

  it("returns 'local' for localhost URLs", () => {
    const url = "postgres://postgres:postgres@localhost:5432/postgres";
    expect(getDatabaseType(url)).toBe("local");
  });

  it("returns 'local' for 127.0.0.1 URLs", () => {
    const url = "postgres://postgres:postgres@127.0.0.1:5432/postgres";
    expect(getDatabaseType(url)).toBe("local");
  });

  it("returns 'local' for Docker host URLs", () => {
    const url = "postgres://postgres:postgres@host.docker.internal:5432/postgres";
    expect(getDatabaseType(url)).toBe("local");
  });

  it("returns 'unknown' for unrecognized URLs", () => {
    const url = "postgres://user:pass@some.random.host.com/mydb";
    expect(getDatabaseType(url)).toBe("unknown");
  });

  it("returns 'unknown' for empty URL", () => {
    expect(getDatabaseType("")).toBe("unknown");
  });

  it("handles URLs with special characters in password", () => {
    const url = "postgres://user:p%40ssword%23@localhost:5432/postgres";
    expect(getDatabaseType(url)).toBe("local");
  });

  it("prioritizes Neon detection over generic hostname matching", () => {
    // Neon URLs should be detected as Neon, not local
    const url = "postgres://user:pass@ep-example.us-east-1.aws.neon.tech/neondb";
    expect(getDatabaseType(url)).toBe("neon");
  });
});

describe("DatabaseType", () => {
  it("has correct type values", () => {
    // Type check - these should compile without errors
    const neon: DatabaseType = "neon";
    const local: DatabaseType = "local";
    const unknown: DatabaseType = "unknown";

    expect(neon).toBe("neon");
    expect(local).toBe("local");
    expect(unknown).toBe("unknown");
  });
});
