/**
 * Vitest setup file for the @repo/testing package.
 *
 * This setup file is self-contained to avoid cyclic dependencies with @repo/config.
 * It imports jest-dom matchers for DOM assertions and sets up cleanup between tests.
 */
import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

/**
 * Cleanup after each test to ensure DOM is reset between tests.
 */
afterEach(cleanup);
