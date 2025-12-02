/**
 * @file Seed Factory Tests
 *
 * Tests for factory functions that generate test data using faker.
 */
import { describe, expect, it, beforeEach } from "vitest";

import {
  createFactory,
  createUserData,
  createOrganizationData,
  setFakerSeed,
  type FactoryOptions,
} from "./factories";

describe("setFakerSeed", () => {
  it("produces deterministic output when seed is set", () => {
    setFakerSeed(12345);
    const user1 = createUserData();

    setFakerSeed(12345);
    const user2 = createUserData();

    expect(user1.email).toBe(user2.email);
    expect(user1.name).toBe(user2.name);
  });

  it("produces different output with different seeds", () => {
    setFakerSeed(12345);
    const user1 = createUserData();

    setFakerSeed(67890);
    const user2 = createUserData();

    expect(user1.email).not.toBe(user2.email);
  });
});

describe("createFactory", () => {
  it("creates a factory function that generates data", () => {
    const generateNumber = createFactory(() => ({ value: 42 }));
    const result = generateNumber();

    expect(result.value).toBe(42);
  });

  it("allows overriding generated values", () => {
    const generateData = createFactory(() => ({
      name: "default",
      value: 1,
    }));

    const result = generateData({ name: "custom" });

    expect(result.name).toBe("custom");
    expect(result.value).toBe(1);
  });

  it("creates multiple items with many option", () => {
    const generateData = createFactory(() => ({
      id: Math.random(),
    }));

    const results = generateData({ _count: 5 });

    expect(Array.isArray(results)).toBe(true);
    expect(results).toHaveLength(5);
    results.forEach((item) => {
      expect(item).toHaveProperty("id");
    });
  });

  it("applies overrides to all items when generating many", () => {
    const generateData = createFactory(() => ({
      type: "original",
      value: Math.random(),
    }));

    const results = generateData({ type: "override", _count: 3 });

    results.forEach((item) => {
      expect(item.type).toBe("override");
    });
  });
});

describe("createUserData", () => {
  beforeEach(() => {
    setFakerSeed(12345);
  });

  it("generates user data with required fields", () => {
    const user = createUserData();

    expect(user).toHaveProperty("email");
    expect(user).toHaveProperty("name");
    expect(user).toHaveProperty("createdAt");
    expect(user).toHaveProperty("updatedAt");
  });

  it("generates valid email format", () => {
    const user = createUserData();
    expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it("allows overriding specific fields", () => {
    const user = createUserData({ email: "custom@example.com" });
    expect(user.email).toBe("custom@example.com");
    expect(user.name).toBeDefined();
  });

  it("generates multiple users with _count option", () => {
    const users = createUserData({ _count: 3 });

    expect(Array.isArray(users)).toBe(true);
    expect(users).toHaveLength(3);
    users.forEach((user) => {
      expect(user.email).toBeDefined();
    });
  });

  it("generates unique emails for multiple users", () => {
    const users = createUserData({ _count: 10 });
    const emails = users.map((u) => u.email);
    const uniqueEmails = new Set(emails);

    expect(uniqueEmails.size).toBe(10);
  });
});

describe("createOrganizationData", () => {
  beforeEach(() => {
    setFakerSeed(12345);
  });

  it("generates organization data with required fields", () => {
    const org = createOrganizationData();

    expect(org).toHaveProperty("name");
    expect(org).toHaveProperty("slug");
    expect(org).toHaveProperty("createdAt");
    expect(org).toHaveProperty("updatedAt");
  });

  it("generates slug in lowercase kebab-case format", () => {
    const org = createOrganizationData();
    expect(org.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("allows overriding specific fields", () => {
    const org = createOrganizationData({ name: "Custom Org", slug: "custom-org" });
    expect(org.name).toBe("Custom Org");
    expect(org.slug).toBe("custom-org");
  });

  it("generates multiple organizations with _count option", () => {
    const orgs = createOrganizationData({ _count: 5 });

    expect(Array.isArray(orgs)).toBe(true);
    expect(orgs).toHaveLength(5);
  });

  it("generates unique slugs for multiple organizations", () => {
    const orgs = createOrganizationData({ _count: 10 });
    const slugs = orgs.map((o) => o.slug);
    const uniqueSlugs = new Set(slugs);

    expect(uniqueSlugs.size).toBe(10);
  });
});

describe("FactoryOptions type", () => {
  it("accepts _count for batch generation", () => {
    const options: FactoryOptions<{ name: string }> = {
      name: "test",
      _count: 5,
    };

    expect(options._count).toBe(5);
  });
});
