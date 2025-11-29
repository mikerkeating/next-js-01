/**
 * Organization data factory for generating realistic test data.
 *
 * Uses @faker-js/faker to generate varied, realistic organization data.
 * Factories accept partial overrides for flexibility in tests.
 *
 * @example
 * ```typescript
 * import { createOrganization, createOrganizations } from '@repo/testing/factories/organization';
 *
 * // Create a single organization with defaults
 * const org = createOrganization();
 *
 * // Create an organization with custom name
 * const customOrg = createOrganization({ name: 'Acme Corp' });
 *
 * // Create multiple organizations
 * const orgs = createOrganizations(5);
 * ```
 */
import { faker } from "@faker-js/faker";

/**
 * Organization type representing an organization in the system.
 * This should match the Organization type from your database schema.
 */
export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Generate a URL-friendly slug from a string.
 *
 * @param text - The text to convert to a slug
 * @returns A lowercase, hyphenated slug
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Create a single organization with realistic mock data.
 *
 * @param overrides - Partial organization data to override defaults
 * @returns A complete Organization object
 *
 * @example
 * ```typescript
 * // Create organization with defaults
 * const org = createOrganization();
 *
 * // Create organization with specific name
 * const org = createOrganization({ name: 'Acme Corp' });
 *
 * // Create organization with multiple overrides
 * const org = createOrganization({
 *   name: 'Tech Startup',
 *   ownerId: 'user-123',
 * });
 * ```
 */
export function createOrganization(overrides: Partial<Organization> = {}): Organization {
  const companyName = faker.company.name();
  const now = new Date();

  return {
    id: faker.string.uuid(),
    name: companyName,
    slug: generateSlug(companyName),
    description: faker.company.catchPhrase(),
    logoUrl: faker.image.urlLoremFlickr({ category: "business" }),
    ownerId: faker.string.uuid(),
    createdAt: faker.date.past({ years: 1 }),
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Create multiple organizations with realistic mock data.
 *
 * @param count - Number of organizations to create (default: 3)
 * @param overrides - Partial organization data to apply to all organizations
 * @returns Array of Organization objects
 *
 * @example
 * ```typescript
 * // Create 5 organizations
 * const orgs = createOrganizations(5);
 *
 * // Create 3 organizations with same owner
 * const orgs = createOrganizations(3, { ownerId: 'user-123' });
 * ```
 */
export function createOrganizations(
  count: number = 3,
  overrides: Partial<Organization> = {}
): Organization[] {
  return Array.from({ length: count }, () => createOrganization(overrides));
}

/**
 * Create a minimal organization object with only required fields.
 * Useful for testing validation or edge cases.
 *
 * @param overrides - Partial organization data to override defaults
 * @returns An Organization object with minimal but valid data
 */
export function createMinimalOrganization(overrides: Partial<Organization> = {}): Organization {
  const name = faker.company.name();
  const now = new Date();

  return {
    id: faker.string.uuid(),
    name,
    slug: generateSlug(name),
    description: null,
    logoUrl: null,
    ownerId: faker.string.uuid(),
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Create an organization with a specific user as owner.
 * Convenience function for common test scenarios.
 *
 * @param ownerId - The ID of the user who owns this organization
 * @param overrides - Additional overrides
 * @returns An Organization object with the specified owner
 */
export function createOrganizationForOwner(
  ownerId: string,
  overrides: Partial<Organization> = {}
): Organization {
  return createOrganization({
    ownerId,
    ...overrides,
  });
}
