/**
 * Factory exports barrel file.
 *
 * Re-exports all factory functions and types from individual factory modules.
 *
 * @example
 * ```typescript
 * import { createUser, createOrganization, setFakerSeed } from '@repo/testing/factories';
 *
 * // For deterministic tests, seed faker before creating data
 * setFakerSeed(42);
 *
 * const user = createUser({ email: 'test@example.com' });
 * const org = createOrganization({ name: 'Test Org' });
 * ```
 */

// User factory exports
// Note: setFakerSeed affects all factories as they share the same faker instance
export { createUser, createUsers, setFakerSeed, type User } from "./user";

// Organization factory exports
export {
  createOrganization,
  createOrganizations,
  createMinimalOrganization,
  createOrganizationForOwner,
  type Organization,
} from "./organization";

/**
 * Faker instance for generating realistic test data.
 * @see https://fakerjs.dev/api/
 */
export { faker } from "@faker-js/faker";
