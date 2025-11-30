/**
 * @repo/testing - Shared testing utilities for the monorepo
 *
 * This package provides reusable testing utilities including:
 * - renderWithProviders for rendering components with test providers
 * - MSW (Mock Service Worker) for API mocking
 * - Data factories using @faker-js/faker
 * - Re-exports of React Testing Library utilities for version consistency
 *
 * @example
 * ```typescript
 * // Import everything from the main entry
 * import {
 *   renderWithProviders,
 *   screen,
 *   userEvent,
 *   createUser,
 *   createOrganization
 * } from '@repo/testing';
 *
 * test('renders component', async () => {
 *   const user = userEvent.setup();
 *   renderWithProviders(<MyComponent />);
 *
 *   await user.click(screen.getByRole('button'));
 *   expect(screen.getByText('Clicked')).toBeInTheDocument();
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Or import from specific subpaths for better tree-shaking
 * import { renderWithProviders } from '@repo/testing/render';
 * import { server, setupMswServer } from '@repo/testing/mocks';
 * import { createUser, createOrganization } from '@repo/testing/factories';
 * ```
 *
 * @packageDocumentation
 */

// Render utilities
export { renderWithProviders } from "./render";
export { TestProviders, createTestWrapper } from "./providers";

// Types
export type {
  ProviderOptions,
  RenderWithProvidersOptions,
  RenderWithProvidersResult,
  TestProvidersProps,
} from "./types";

// Re-export React Testing Library utilities for version consistency
/**
 * Screen queries for finding elements in rendered output.
 * @see https://testing-library.com/docs/queries/about
 */
export { screen } from "@testing-library/react";

/**
 * Queries scoped to a specific container element.
 * @see https://testing-library.com/docs/dom-testing-library/api-within
 */
export { within } from "@testing-library/react";

/**
 * Wait for async operations to complete in tests.
 * @see https://testing-library.com/docs/dom-testing-library/api-async#waitfor
 */
export { waitFor } from "@testing-library/react";

/**
 * Wrap state updates in act() for proper React batching.
 * @see https://testing-library.com/docs/react-testing-library/api#act
 */
export { act } from "@testing-library/react";

/**
 * Clean up rendered components between tests.
 * @see https://testing-library.com/docs/react-testing-library/api#cleanup
 */
export { cleanup } from "@testing-library/react";

/**
 * User interaction simulation for testing.
 * @see https://testing-library.com/docs/user-event/intro
 */
export { default as userEvent } from "@testing-library/user-event";

// Mock utilities - MSW server and handlers
export { server, setupMswServer, handlers, http, HttpResponse } from "./mocks";
export type { MockUser, MockOrganization, ApiResponse } from "./mocks";

// Data factories - @faker-js/faker based test data generation
export {
  createUser,
  createUsers,
  createOrganization,
  createOrganizations,
  createMinimalOrganization,
  createOrganizationForOwner,
  setFakerSeed,
  faker,
} from "./factories";
export type { User, Organization } from "./factories";
