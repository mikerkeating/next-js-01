/**
 * @repo/testing - Shared testing utilities for the monorepo
 *
 * This package provides reusable testing utilities including:
 * - MSW (Mock Service Worker) for API mocking
 * - Data factories using @faker-js/faker
 *
 * @example
 * ```typescript
 * // Import everything from the main entry
 * import { server, createUser, createOrganization } from '@repo/testing';
 *
 * // Or import from specific subpaths for better tree-shaking
 * import { server, setupMswServer } from '@repo/testing/mocks';
 * import { createUser, createOrganization } from '@repo/testing/factories';
 * ```
 *
 * @packageDocumentation
 */

// Re-export all mocks
export * from "./mocks";

// Re-export all factories
export * from "./factories";
