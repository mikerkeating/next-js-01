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

  return {
    id: faker.string.uuid(),
    email: faker.internet.email({ firstName, lastName }),
    name: `${firstName} ${lastName}`,
    clerkId: `clerk_${faker.string.alphanumeric(24)}`,
    avatarUrl: faker.image.avatar(),
    createdAt: faker.date.past({ years: 1 }),
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Create multiple users with realistic mock data.
 *
 * @param count - Number of users to create (default: 3)
 * @param overrides - Partial user data to apply to all users
 * @returns Array of User objects
 *
 * @example
 * ```typescript
 * // Create 5 users
 * const users = createUsers(5);
 *
 * // Create 3 users with same organization
 * const users = createUsers(3, { organizationId: 'org-123' });
 * ```
 */
export function createUsers(count: number = 3, overrides: Partial<User> = {}): User[] {
  return Array.from({ length: count }, () => createUser(overrides));
}

/**
 * Create a minimal user object with only required fields.
 * Useful for testing validation or edge cases.
 *
 * @param overrides - Partial user data to override defaults
 * @returns A User object with minimal but valid data
 */
export function createMinimalUser(overrides: Partial<User> = {}): User {
  const now = new Date();

  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    clerkId: `clerk_${faker.string.alphanumeric(24)}`,
    avatarUrl: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
