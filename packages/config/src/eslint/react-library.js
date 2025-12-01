/**
 * React library ESLint flat configuration.
 *
 * This configuration is for React component libraries that are NOT Next.js apps.
 * It extends the base config and adds:
 * - React plugin with library-appropriate rules
 * - React hooks plugin
 * - jsx-a11y accessibility rules (WCAG 2.1 Level AA)
 * - No Next.js specific rules
 *
 * @example
 * // eslint.config.js in a React library package
 * import reactLibrary from "@repo/config/eslint/react-library";
 *
 * export default [
 *   ...reactLibrary,
 *   {
 *     // Package-specific overrides
 *   },
 * ];
 *
 * @type {import('eslint').Linter.Config[]}
 */
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import globals from "globals";

import { createBaseConfig } from "./base.js";

/**
 * Creates a React library ESLint configuration.
 *
 * @param {Object} options - Configuration options
 * @param {string} [options.tsconfigRootDir] - Root directory for tsconfig resolution
 * @returns {import('eslint').Linter.Config[]} ESLint flat config array
 */
export function createReactLibraryConfig(options = {}) {
  const baseConfig = createBaseConfig(options);

  return [
    // Include base configuration
    ...baseConfig,

    // Library-specific ignores
    {
      ignores: ["dist/**", "build/**", "lib/**"],
    },

    // React and accessibility configuration for TSX/JSX files
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
        "jsx-a11y": jsxA11yPlugin,
      },
      rules: {
        // React rules for libraries
        ...reactPlugin.configs.recommended.rules,
        "react/react-in-jsx-scope": "off", // Using React 17+ JSX transform
        "react/prop-types": "off", // Using TypeScript
        "react/jsx-uses-react": "off",
        "react/jsx-uses-vars": "error",
        "react/jsx-no-target-blank": "error",
        "react/no-unescaped-entities": "warn",
        "react/display-name": "warn", // Libraries should have display names for debugging
        "react/jsx-key": "error", // Essential for lists
        "react/no-children-prop": "error",
        "react/no-danger-with-children": "error",
        "react/no-deprecated": "warn",
        "react/no-direct-mutation-state": "error",
        "react/no-find-dom-node": "error",
        "react/no-is-mounted": "error",
        "react/no-render-return-value": "error",
        "react/no-string-refs": "error",
        "react/require-render-return": "error",

        // React Hooks rules
        ...hooksPlugin.configs.recommended.rules,
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",

        // Accessibility rules (WCAG 2.1 Level AA compliance)
        ...jsxA11yPlugin.configs.recommended.rules,
        "jsx-a11y/alt-text": "error",
        "jsx-a11y/anchor-has-content": "error",
        "jsx-a11y/anchor-is-valid": "error",
        "jsx-a11y/aria-activedescendant-has-tabindex": "error",
        "jsx-a11y/aria-props": "error",
        "jsx-a11y/aria-proptypes": "error",
        "jsx-a11y/aria-role": "error",
        "jsx-a11y/aria-unsupported-elements": "error",
        "jsx-a11y/click-events-have-key-events": "error",
        "jsx-a11y/heading-has-content": "error",
        "jsx-a11y/html-has-lang": "error",
        "jsx-a11y/iframe-has-title": "error",
        "jsx-a11y/img-redundant-alt": "error",
        "jsx-a11y/interactive-supports-focus": "error",
        "jsx-a11y/label-has-associated-control": "error",
        "jsx-a11y/lang": "error",
        "jsx-a11y/media-has-caption": "error",
        "jsx-a11y/mouse-events-have-key-events": "error",
        "jsx-a11y/no-access-key": "error",
        "jsx-a11y/no-autofocus": "warn",
        "jsx-a11y/no-distracting-elements": "error",
        "jsx-a11y/no-interactive-element-to-noninteractive-role": "error",
        "jsx-a11y/no-noninteractive-element-interactions": "warn",
        "jsx-a11y/no-noninteractive-element-to-interactive-role": "error",
        "jsx-a11y/no-noninteractive-tabindex": "warn",
        "jsx-a11y/no-redundant-roles": "error",
        "jsx-a11y/no-static-element-interactions": "warn",
        "jsx-a11y/role-has-required-aria-props": "error",
        "jsx-a11y/role-supports-aria-props": "error",
        "jsx-a11y/scope": "error",
        "jsx-a11y/tabindex-no-positive": "error",
      },
      settings: {
        react: {
          version: "detect",
        },
      },
    },
  ];
}

/**
 * Default React library configuration.
 *
 * @example
 * import reactLibrary from "@repo/config/eslint/react-library";
 * export default [...reactLibrary];
 */
export default createReactLibraryConfig();
