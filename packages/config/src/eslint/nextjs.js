/**
 * Next.js ESLint flat configuration.
 *
 * This configuration extends the base config and adds:
 * - Next.js specific rules (@next/eslint-plugin-next)
 * - React plugin with appropriate rules
 * - React hooks plugin
 * - Browser globals for client-side code
 *
 * @example
 * // eslint.config.js in a Next.js app
 * import nextjs from "@repo/config/eslint/nextjs";
 *
 * export default [
 *   ...nextjs,
 *   {
 *     // App-specific overrides
 *   },
 * ];
 *
 * @type {import('eslint').Linter.Config[]}
 */
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";

import { createBaseConfig } from "./base.js";

/**
 * Creates a Next.js ESLint configuration.
 *
 * @param {Object} options - Configuration options
 * @param {string} [options.tsconfigRootDir] - Root directory for tsconfig resolution
 * @returns {import('eslint').Linter.Config[]} ESLint flat config array
 */
export function createNextjsConfig(options = {}) {
  const baseConfig = createBaseConfig(options);

  return [
    // Include base configuration
    ...baseConfig,

    // Next.js specific ignores
    {
      ignores: [".next/**", "out/**"],
    },

    // React and Next.js configuration for TSX/JSX files
    {
      files: ["**/*.tsx", "**/*.jsx"],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
        globals: {
          ...globals.browser,
          React: "readonly",
        },
      },
      plugins: {
        react: reactPlugin,
        "react-hooks": hooksPlugin,
        "@next/next": nextPlugin,
      },
      rules: {
        // React rules
        ...reactPlugin.configs.recommended.rules,
        "react/react-in-jsx-scope": "off", // Not needed in Next.js
        "react/prop-types": "off", // Using TypeScript
        "react/jsx-uses-react": "off",
        "react/jsx-uses-vars": "error",
        "react/jsx-no-target-blank": "error",
        "react/no-unescaped-entities": "warn",
        "react/display-name": "off",
        "react/no-unknown-property": ["error", { ignore: ["jsx", "global"] }],

        // React Hooks rules
        ...hooksPlugin.configs.recommended.rules,
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",

        // Next.js rules
        ...nextPlugin.configs.recommended.rules,
        ...nextPlugin.configs["core-web-vitals"].rules,
        "@next/next/no-html-link-for-pages": "error",
        "@next/next/no-img-element": "warn",
      },
      settings: {
        react: {
          version: "detect",
        },
      },
    },

    // Next.js configuration for all TypeScript/JavaScript files
    {
      files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
      plugins: {
        "@next/next": nextPlugin,
      },
      rules: {
        "@next/next/no-assign-module-variable": "error",
        "@next/next/no-document-import-in-page": "error",
        "@next/next/no-head-import-in-document": "error",
        "@next/next/no-duplicate-head": "error",
      },
    },
  ];
}

/**
 * Default Next.js configuration.
 *
 * @example
 * import nextjs from "@repo/config/eslint/nextjs";
 * export default [...nextjs];
 */
export default createNextjsConfig();
