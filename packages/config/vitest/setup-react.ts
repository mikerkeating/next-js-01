/**
 * React Testing Library setup file for Vitest.
 *
 * This file is loaded before each test file that uses React Testing Library.
 * It imports jest-dom matchers to extend Vitest's expect function with
 * DOM-specific assertions like toBeInTheDocument, toHaveClass, etc.
 *
 * To use this setup file, add it to your vitest.config.ts:
 *   test: {
 *     setupFiles: ['@repo/config/vitest/setup-react']
 *   }
 *
 * @see https://testing-library.com/docs/react-testing-library/setup
 * @see https://github.com/testing-library/jest-dom
 */
import "@testing-library/jest-dom/vitest";

/**
 * Cleanup after each test to ensure DOM is reset between tests.
 * This prevents tests from affecting each other through leftover DOM state.
 */
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
