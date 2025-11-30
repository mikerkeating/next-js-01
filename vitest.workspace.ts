/**
 * Vitest Workspace Configuration
 *
 * This file defines all projects in the monorepo that should be included
 * in the Vitest test run. Each project points to its own vitest.config.ts
 * file which extends the shared base configuration.
 *
 * Running `pnpm test` at the root will execute tests across all projects.
 * Running `pnpm test --filter <package>` runs tests for a specific package.
 * Alternatively, use Vitest's native --project flag to target a workspace project
 * by name: `pnpm test -- --project <projectName>` (e.g., `pnpm test -- --project routing`).
 *
 * @see https://vitest.dev/guide/workspace
 */
import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  // Apps with tests
  "apps/routing/vitest.config.ts",

  // Packages with tests
  "packages/testing/vitest.config.ts",
]);
