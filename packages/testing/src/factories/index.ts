/**
 * Factory exports barrel file.
 *
 * Re-exports all factory functions and types from individual factory modules.
 *
 * @example
 * ```typescript
 * import { createUser, createOrganization } from '@repo/testing/factories';
 *
 * const user = createUser({ email: 'test@example.com' });
 * const org = createOrganization({ name: 'Test Org' });
 * ```
 */

// User factory exports
export { createUser, createUsers, createMinimalUser, setFakerSeed, type User } from "./user";

// Organization factory exports
export {
  createOrganization,
  createOrganizations,
  createMinimalOrganization,
  createOrganizationForOwner,
  type Organization,
} from "./Organization";

// Re-export faker for advanced usage
export { faker } from "@faker-js/faker";
