/**
 * Seed Factory Utilities
 *
 * Provides factory functions for generating test data using @faker-js/faker.
 * Factories support optional overrides and batch generation for flexible seeding.
 *
 * @example
 * ```typescript
 * import { createUserData, createOrganizationData, setFakerSeed } from '@repo/database';
 *
 * // Set seed for reproducible data
 * setFakerSeed(12345);
 *
 * // Generate single user
 * const user = createUserData({ email: 'admin@example.com' });
 *
 * // Generate multiple organizations
 * const orgs = createOrganizationData({ _count: 5 });
 * ```
 *
 * @packageDocumentation
 */
import { faker } from "@faker-js/faker";

/**
 * Options for factory functions.
 * Includes optional _count for batch generation and partial type overrides.
 */
export type FactoryOptions<T> = Partial<T> & {
  /** Number of items to generate. If provided, returns an array. */
  _count?: number;
};

/**
 * Return type for factory functions.
 * Returns a single item or array based on _count option.
 */
type FactoryResult<T, O extends FactoryOptions<T>> = O extends { _count: number } ? T[] : T;

/**
 * Sets the faker seed for reproducible test data generation.
 *
 * When the same seed is used, faker generates identical sequences of data.
 * This is useful for creating deterministic tests.
 *
 * @param seed - The seed value for the random number generator
 *
 * @example
 * ```typescript
 * setFakerSeed(12345);
 * const user1 = createUserData();
 *
 * setFakerSeed(12345);
 * const user2 = createUserData();
 *
 * // user1.email === user2.email (same seed produces same data)
 * ```
 */
export function setFakerSeed(seed: number): void {
  faker.seed(seed);
}

/**
 * Creates a factory function for generating test data.
 *
 * The factory supports:
 * - Generating single items with optional overrides
 * - Generating multiple items with the _count option
 * - Applying overrides to all items in batch generation
 *
 * @typeParam T - The type of data the factory generates
 * @param generator - Function that generates a single data item
 * @returns A factory function that can generate one or many items
 *
 * @example
 * ```typescript
 * const createPost = createFactory(() => ({
 *   title: faker.lorem.sentence(),
 *   body: faker.lorem.paragraphs(),
 * }));
 *
 * // Single post
 * const post = createPost({ title: 'Custom Title' });
 *
 * // Multiple posts
 * const posts = createPost({ _count: 10 });
 * ```
 */
export function createFactory<T extends object>(
  generator: () => T
): <O extends FactoryOptions<T>>(options?: O) => FactoryResult<T, O> {
  return <O extends FactoryOptions<T>>(options?: O): FactoryResult<T, O> => {
    const { _count, ...overrides } = (options ?? {}) as FactoryOptions<T>;

    if (_count !== undefined && _count > 0) {
      const items: T[] = [];
      for (let i = 0; i < _count; i++) {
        const base = generator();
        items.push({ ...base, ...overrides } as T);
      }
      return items as FactoryResult<T, O>;
    }

    const base = generator();
    return { ...base, ...overrides } as FactoryResult<T, O>;
  };
}

/**
 * Generic user data structure for seeding.
 * Product-specific packages can extend this with additional fields.
 */
export interface UserData {
  /** User email address */
  email: string;
  /** User display name */
  name: string;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Creates user data with realistic fake values.
 *
 * Generates email, name, and timestamps. All fields can be overridden.
 * Use _count option to generate multiple users.
 *
 * @param options - Optional overrides and batch generation options
 * @returns Single user data or array of user data
 *
 * @example
 * ```typescript
 * // Single user with default values
 * const user = createUserData();
 *
 * // User with custom email
 * const admin = createUserData({ email: 'admin@example.com' });
 *
 * // Multiple users
 * const users = createUserData({ _count: 10 });
 * ```
 */
export const createUserData = createFactory<UserData>(() => {
  const now = new Date();
  return {
    email: faker.internet.email().toLowerCase(),
    name: faker.person.fullName(),
    createdAt: faker.date.past({ years: 1, refDate: now }),
    updatedAt: now,
  };
});

/**
 * Generic organization data structure for seeding.
 * Product-specific packages can extend this with additional fields.
 */
export interface OrganizationData {
  /** Organization name */
  name: string;
  /** URL-friendly slug */
  slug: string;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Generates a URL-friendly slug from a company name.
 *
 * @param name - The company name to slugify
 * @returns Lowercase kebab-case slug
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Creates organization data with realistic fake values.
 *
 * Generates company name, slug, and timestamps. All fields can be overridden.
 * Use _count option to generate multiple organizations.
 *
 * @param options - Optional overrides and batch generation options
 * @returns Single organization data or array of organization data
 *
 * @example
 * ```typescript
 * // Single organization
 * const org = createOrganizationData();
 *
 * // Organization with custom values
 * const acme = createOrganizationData({ name: 'Acme Corp', slug: 'acme' });
 *
 * // Multiple organizations
 * const orgs = createOrganizationData({ _count: 5 });
 * ```
 */
export const createOrganizationData = createFactory<OrganizationData>(() => {
  const now = new Date();
  const name = faker.company.name();
  // Add random suffix to ensure uniqueness in batch generation
  const uniqueSuffix = faker.string.alphanumeric(4).toLowerCase();
  return {
    name,
    slug: `${generateSlug(name)}-${uniqueSuffix}`,
    createdAt: faker.date.past({ years: 1, refDate: now }),
    updatedAt: now,
  };
});
