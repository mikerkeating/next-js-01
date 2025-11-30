/**
 * User data factory for generating realistic test data.
 *
 * Uses @faker-js/faker to generate varied, realistic user data.
 * Factories accept partial overrides for flexibility in tests.
 *
 * @example
 * ```typescript
 * import { createUser, createUsers } from '@repo/testing/factories/user';
 *
 * // Create a single user with defaults
 * const user = createUser();
 *
 * // Create a user with custom email
 * const customUser = createUser({ email: 'custom@example.com' });
 *
 * // Create multiple users
 * const users = createUsers(5);
 * ```
 */
import { faker } from "@faker-js/faker";

/**
 * User type representing a user in the system.
 * This should match the User type from your database schema.
 *
 * TODO: Import User from @repo/database when EPIC 2A.2 is complete
 * See: docs/3-epics/2A.2-database-infra/EPIC.md
 */
export interface User {
  id: string;
  email: string;
  name: string;
  clerkId: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Default seed for reproducible test data.
 * Set to a fixed value for deterministic tests.
 * Change or remove for varied data.
 */
const DEFAULT_SEED = 12345;

/**
 * Set the faker seed for reproducible test data.
 * Call this at the start of your test file or in global setup
 * if you need deterministic data generation.
 *
 * @param seed - The seed value for the random number generator
 *
 * @example
 * ```typescript
 * import { setFakerSeed } from '@repo/testing/factories/user';
 *
 * // In your test setup
 * setFakerSeed(42);
 * ```
 */
export function setFakerSeed(seed: number = DEFAULT_SEED): void {
  faker.seed(seed);
}

/**
 * Create a single user with realistic mock data.
 *
 * @param overrides - Partial user data to override defaults
 * @returns A complete User object
 *
 * @example
 * ```typescript
 * // Create user with defaults
 * const user = createUser();
 *
 * // Create user with specific email
 * const user = createUser({ email: 'test@example.com' });
 *
 * // Create user with multiple overrides
 * const user = createUser({
 *   email: 'admin@example.com',
 *   name: 'Admin User',
 * });
 * ```
 */
export function createUser(overrides: Partial<User> = {}): User {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const now = new Date();

  const user = {
    id: faker.string.uuid(),
    email: faker.internet.email({ firstName, lastName }),
    name: `${firstName} ${lastName}`,
    clerkId: `clerk_${faker.string.alphanumeric(24)}`,
    avatarUrl: faker.number.float({ min: 0, max: 1 }) < 0.1 ? null : faker.image.avatar(),
    createdAt: faker.date.past({ years: 1 }),
    updatedAt: now,
    ...overrides,
  };

  // Ensure updatedAt is never before createdAt
  if (user.createdAt > user.updatedAt) {
    user.updatedAt = user.createdAt;
  }

  return user;
}

/**
 * Create multiple users with realistic mock data.
 *
 * @param count - Number of users to create (default: 3)
 * @param overrides - Partial user data or function returning per-user overrides
 * @returns Array of User objects
 *
 * @example
 * ```typescript
 * // Create 5 users
 * const users = createUsers(5);
 *
 * // Create 3 users with same avatar
 * const users = createUsers(3, { avatarUrl: null });
 *
 * // Create users with unique emails per index
 * const users = createUsers(3, (i) => ({ email: `user${i}@example.com` }));
 * ```
 */
export function createUsers(
  count: number = 3,
  overrides?: Partial<User> | ((index: number) => Partial<User>)
): User[] {
  if (
    typeof count !== "number" ||
    !Number.isFinite(count) ||
    !Number.isInteger(count) ||
    count < 0
  ) {
    throw new RangeError(`createUsers: count must be a non-negative integer, received ${count}`);
  }

  return Array.from({ length: count }, (_, i) =>
    createUser(typeof overrides === "function" ? overrides(i) : overrides)
  );
}
