# Seeding Guide

This guide covers the seed framework for generating test data, including factories, runners, and environment configuration.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Seed Configuration](#seed-configuration)
- [Data Factories](#data-factories)
- [Running Seeds](#running-seeds)
- [Seed Runner](#seed-runner)
- [Progress Tracking](#progress-tracking)
- [Reproducible Data](#reproducible-data)
- [Custom Seeds](#custom-seeds)
- [CLI Usage](#cli-usage)

## Overview

The seed framework provides:

- **Factory Functions**: Generate realistic test data with faker.js
- **Environment Configuration**: Different data volumes per environment
- **Progress Tracking**: Visual feedback during seeding
- **Reproducible Data**: Set faker seed for deterministic generation
- **Batch Generation**: Generate multiple records efficiently

## Quick Start

### Basic Seed Script

```typescript
import { runSeed, createUserData, createOrganizationData } from "@repo/database";
import { db } from "@repo/database";

const result = await runSeed({
  seeds: [
    {
      name: "organizations",
      seed: async (config) => {
        const orgs = createOrganizationData({ _count: config.counts.organizations });
        await db.insert(organizations).values(orgs);
        return { count: orgs.length };
      },
    },
    {
      name: "users",
      seed: async (config) => {
        const users = createUserData({ _count: config.counts.users });
        await db.insert(users).values(users);
        return { count: users.length };
      },
    },
  ],
  verbose: true,
});

console.log(`Seeded ${result.totalRecords} records`);
```

## Seed Configuration

### Environment-Based Configuration

The seed framework automatically detects the environment from `NODE_ENV`:

```typescript
import { getSeedConfig, getSeedEnvironment } from "@repo/database";

const env = getSeedEnvironment();
// Returns: 'development' | 'test' | 'staging'

const config = getSeedConfig(env);
// Returns environment-specific configuration
```

### Configuration Structure

```typescript
interface SeedConfig {
  environment: SeedEnvironment;
  verbose: boolean;
  counts: SeedCounts;
}

interface SeedCounts {
  users: number;
  organizations: number;
  // Additional counts for your entities
}
```

### Default Counts by Environment

| Entity        | Development | Test | Staging |
| ------------- | ----------- | ---- | ------- |
| users         | 20          | 3    | 50      |
| organizations | 5           | 1    | 10      |

### Custom Configuration

Override defaults by specifying environment:

```typescript
const config = getSeedConfig("development");

// Use config.counts in your seed functions
const users = createUserData({ _count: config.counts.users });
```

## Data Factories

### Built-in Factories

#### createUserData()

Generate user records:

```typescript
import { createUserData } from "@repo/database";

// Single user with default values
const user = createUserData();
// { email: 'john.doe@example.com', name: 'John Doe', createdAt: Date, updatedAt: Date }

// User with custom values
const admin = createUserData({
  email: "admin@example.com",
  name: "Admin User",
});

// Multiple users
const users = createUserData({ _count: 10 });
// Array of 10 users
```

#### createOrganizationData()

Generate organization records:

```typescript
import { createOrganizationData } from "@repo/database";

// Single organization
const org = createOrganizationData();
// { name: 'Acme Corp', slug: 'acme-corp-a1b2', createdAt: Date, updatedAt: Date }

// Organization with custom values
const custom = createOrganizationData({
  name: "My Company",
  slug: "my-company",
});

// Multiple organizations
const orgs = createOrganizationData({ _count: 5 });
```

### Creating Custom Factories

Use `createFactory()` to build your own factories:

```typescript
import { createFactory } from "@repo/database";
import { faker } from "@faker-js/faker";

// Define your data type
interface PostData {
  title: string;
  content: string;
  publishedAt: Date | null;
}

// Create the factory
const createPostData = createFactory<PostData>(() => ({
  title: faker.lorem.sentence(),
  content: faker.lorem.paragraphs(3),
  publishedAt: faker.datatype.boolean() ? faker.date.past() : null,
}));

// Use the factory
const post = createPostData();
const draftPost = createPostData({ publishedAt: null });
const posts = createPostData({ _count: 20 });
```

### Factory Options

All factories support these options:

```typescript
type FactoryOptions<T> = Partial<T> & {
  _count?: number; // Generate array if provided
};

// Single item with overrides
const user = createUserData({ email: "test@example.com" });

// Multiple items with overrides applied to all
const users = createUserData({
  _count: 5,
  name: "Test User", // All 5 users will have this name
});
```

## Running Seeds

### runSeed()

Execute seed functions with progress tracking:

```typescript
import { runSeed } from "@repo/database";

const result = await runSeed({
  seeds: [
    { name: "users", seed: seedUsers },
    { name: "posts", seed: seedPosts },
  ],
  verbose: true,
  environment: "development",
});

if (result.success) {
  console.log(`Seeded ${result.totalRecords} records in ${result.durationMs}ms`);
  console.log(`Tables: ${result.tablesSeeded.join(", ")}`);
} else {
  console.error(`Seed failed: ${result.error}`);
}
```

### Seed Options

```typescript
interface SeedOptions {
  seeds: SeedDefinition[];
  verbose?: boolean; // Enable detailed logging
  environment?: SeedEnvironment;
}

interface SeedDefinition {
  name: string; // Table/entity name
  seed: SeedFunction; // Function to execute
}

type SeedFunction = (config: SeedConfig) => Promise<SeedFunctionResult>;

interface SeedFunctionResult {
  count: number; // Records seeded
}
```

### Seed Result

```typescript
interface SeedResult {
  success: boolean;
  durationMs: number;
  tablesSeeded: string[];
  totalRecords: number;
  error?: string; // Present on failure
}
```

## Seed Runner

For reusable seed configurations, use `createSeedRunner()`:

```typescript
import { createSeedRunner, createUserData, createOrganizationData } from "@repo/database";
import { db } from "@repo/database";

// Create runner with defaults
const runner = createSeedRunner({
  environment: "development",
  verbose: true,
});

// Register seeds
runner.addSeed("organizations", async (config) => {
  const orgs = createOrganizationData({ _count: config.counts.organizations });
  await db.insert(organizations).values(orgs);
  return { count: orgs.length };
});

runner.addSeed("users", async (config) => {
  const users = createUserData({ _count: config.counts.users });
  await db.insert(users).values(users);
  return { count: users.length };
});

// Run all registered seeds
const result = await runner.run();

// Run with overrides
const testResult = await runner.run({
  environment: "test",
  verbose: false,
});

// Access configuration
const config = runner.getConfig();
console.log(`Seeding ${config.counts.users} users`);
```

### SeedRunner Interface

```typescript
interface SeedRunner {
  run(overrides?: Partial<SeedOptions>): Promise<SeedResult>;
  addSeed(name: string, seed: SeedFunction): void;
  getConfig(): SeedConfig;
}
```

## Progress Tracking

### Seed Logger

Create a logger for consistent output:

```typescript
import { createSeedLogger } from "@repo/database";

const logger = createSeedLogger({
  verbose: true,
  prefix: "[seed]",
});

logger.info("Starting seed operation");
logger.seeding("users", 20); // "Seeding users (20 records)..."
logger.seeded("users", 20, 150); // "Seeded users: 20 records in 150ms"
logger.success("All done!");
logger.error("Something went wrong");
```

### Progress Tracker

Track completion of multiple seeds:

```typescript
import { createProgressTracker } from "@repo/database";

const tracker = createProgressTracker(["users", "posts", "comments"]);

// Mark as complete
tracker.complete("users");

// Get progress
const progress = tracker.getProgress();
// { completed: ['users'], pending: ['posts', 'comments'], total: 3 }
```

## Reproducible Data

### Setting Faker Seed

Generate identical data sequences:

```typescript
import { setFakerSeed, createUserData } from "@repo/database";

// Set seed before generating data
setFakerSeed(12345);
const user1 = createUserData();

// Same seed produces same data
setFakerSeed(12345);
const user2 = createUserData();

// user1.email === user2.email
```

### Use Cases for Reproducible Data

1. **Snapshot Testing**: Consistent data for test assertions
2. **Debugging**: Reproduce exact conditions
3. **CI/CD**: Predictable test runs

### Example Test Setup

```typescript
import { beforeEach, describe, it } from "vitest";
import { setFakerSeed, createUserData } from "@repo/database";

describe("User Service", () => {
  beforeEach(() => {
    // Reset seed before each test
    setFakerSeed(42);
  });

  it("creates user with expected data", () => {
    const userData = createUserData();
    // Always generates the same user
    expect(userData.email).toBe("expected.email@example.com");
  });
});
```

## Custom Seeds

### Creating a Seed Module

```typescript
// seeds/users.ts
import { db, createUserData, type SeedFunction } from "@repo/database";

export const seedUsers: SeedFunction = async (config) => {
  const count = config.counts.users;

  if (count === 0) {
    return { count: 0 };
  }

  const usersData = createUserData({ _count: count });

  await db.insert(users).values(usersData);

  return { count };
};
```

### Seed with Dependencies

```typescript
// seeds/posts.ts
import { db, createFactory, type SeedFunction } from "@repo/database";
import { faker } from "@faker-js/faker";

const createPostData = createFactory(() => ({
  title: faker.lorem.sentence(),
  content: faker.lorem.paragraphs(),
}));

export const seedPosts: SeedFunction = async (config) => {
  // First, get existing users and organizations
  const existingUsers = await db.select().from(users);
  const existingOrgs = await db.select().from(organizations);

  if (existingUsers.length === 0 || existingOrgs.length === 0) {
    throw new Error("Users and organizations must be seeded first");
  }

  const postsData = createPostData({ _count: 50 }).map((post, i) => ({
    ...post,
    id: createId(),
    authorId: existingUsers[i % existingUsers.length].id,
    organizationId: existingOrgs[i % existingOrgs.length].id,
  }));

  await db.insert(posts).values(postsData);

  return { count: postsData.length };
};
```

### Organizing Seeds

```
packages/database/
├── src/
│   └── seed/
│       ├── index.ts      # Re-exports
│       ├── config.ts     # Environment config
│       ├── factories.ts  # Data factories
│       ├── utils.ts      # Logger, tracker
│       └── run.ts        # CLI entry point
└── seeds/                # Custom seeds (optional)
    ├── users.ts
    ├── organizations.ts
    └── posts.ts
```

## CLI Usage

### Running Seeds from Command Line

```bash
# Run default seeds
pnpm run db:seed

# Environment-specific
NODE_ENV=development pnpm run db:seed
NODE_ENV=test pnpm run db:seed
```

### main() Entry Point

Create a CLI script using the `main` function:

```typescript
// scripts/seed.ts
import { main as runSeeds } from "@repo/database";
import { seedUsers } from "../seeds/users";
import { seedOrganizations } from "../seeds/organizations";
import { seedPosts } from "../seeds/posts";

// Seeds run in order
runSeeds([
  { name: "organizations", seed: seedOrganizations },
  { name: "users", seed: seedUsers },
  { name: "posts", seed: seedPosts },
]);
```

### CLI Output

```
🌱 Database Seed - Environment: development

[seed] Starting seed for environment: development
[seed] Seeding organizations (5 records)...
[seed] Seeded organizations: 5 records in 120ms
[seed] Seeding users (20 records)...
[seed] Seeded users: 20 records in 350ms

✅ Seed complete!

   Tables: organizations, users
   Records: 25
   Duration: 470ms
```

## Error Handling

### SeedError

Handle seed-specific errors:

```typescript
import { SeedError, runSeed } from "@repo/database";

try {
  const result = await runSeed({ seeds });

  if (!result.success) {
    throw new SeedError(result.error ?? "Unknown error", "SEED_FAILED");
  }
} catch (error) {
  if (error instanceof SeedError) {
    console.error(`Seed error [${error.code}]: ${error.message}`);
  }
}
```

### Error Codes

| Code               | Description                   |
| ------------------ | ----------------------------- |
| `SEED_FAILED`      | General seed failure          |
| `CLEAR_FAILED`     | Failed to clear existing data |
| `INVALID_CONFIG`   | Configuration error           |
| `CONNECTION_ERROR` | Database connection failed    |

## Related Documentation

- [README](../README.md) - Package overview
- [Utilities Guide](./utilities.md) - Schema helpers
- [Troubleshooting](./troubleshooting.md) - Common issues
