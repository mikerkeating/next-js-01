/**
 * Vitest configuration for the routing app.
 *
 * Extends the shared base configuration and adds app-specific settings
 * like path aliases that match the tsconfig.json paths.
 *
 * @see https://vitest.dev/config/
 */
import { defineConfig, mergeConfig } from "vitest/config";
import path from "path";

import { baseConfig } from "@repo/config/vitest/base";

export default mergeConfig(
  baseConfig,
  defineConfig({
    resolve: {
      // Path aliases matching tsconfig.json paths
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    test: {
      // App-specific test configuration
      name: "routing",

      // Root directory for tests
      root: __dirname,

      // Use happy-dom for React component tests (default from base)
      environment: "happy-dom",

      // Setup files run before each test file
      // Includes React Testing Library setup with jest-dom matchers
      setupFiles: ["@repo/config/vitest/setup-react"],
    },
  })
);
