# @repo/config

Centralized configuration files for the monorepo. This package provides shared configurations for TypeScript, ESLint, Prettier, Tailwind CSS, and Vitest.

## Installation

This package is internal to the monorepo. Add it as a workspace dependency:

```bash
pnpm add @repo/config@workspace:*
```

## Quick Start

### TypeScript

Extend the appropriate configuration in your `tsconfig.json`:

```json
{
  "extends": "@repo/config/typescript/nextjs"
}
```

### ESLint

Import and spread the configuration in your `eslint.config.js`:

```javascript
import nextjsConfig from "@repo/config/eslint/nextjs";

export default [...nextjsConfig];
```

### Prettier

Export the configuration in your `prettier.config.js`:

```javascript
export { default } from "@repo/config/prettier";
```

### Tailwind CSS

Import the base CSS in your global stylesheet:

```css
@import "tailwindcss";
@import "@repo/config/tailwind/base.css";
```

## Export Structure

```
@repo/config
├── ./typescript/base          # Base TypeScript configuration
├── ./typescript/nextjs        # Next.js TypeScript configuration
├── ./typescript/react-library # React library TypeScript configuration
├── ./eslint/base              # Base ESLint rules
├── ./eslint/nextjs            # Next.js ESLint rules
├── ./eslint/react-library     # React library ESLint rules
├── ./prettier                 # Prettier configuration
├── ./tailwind                 # Tailwind CSS theme utilities (TypeScript)
├── ./tailwind/base.css        # Tailwind CSS theme tokens (CSS)
├── ./tailwind/theme           # Tailwind theme token exports
├── ./vitest/base              # Base Vitest configuration
├── ./vitest/coverage          # Coverage configuration
├── ./vitest/setup-react       # React testing setup
└── ./vitest/setup-msw         # MSW setup for API mocking
```

## Configuration Details

### TypeScript Configurations

#### Base (`@repo/config/typescript/base`)

Core TypeScript settings with strict mode enabled:

- `strict: true` - All strict mode flags
- `noUncheckedIndexedAccess: true` - Safer array/object access
- `exactOptionalPropertyTypes: true` - Distinguish undefined from optional
- `moduleResolution: "bundler"` - Modern bundler-compatible resolution
- `composite: true` - Enables project references

```json
{
  "extends": "@repo/config/typescript/base",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

#### Next.js (`@repo/config/typescript/nextjs`)

Extends base with Next.js-specific settings:

- `jsx: "preserve"` - Let Next.js handle JSX transformation
- `plugins: [{ "name": "next" }]` - Next.js TypeScript plugin
- `allowJs: true` - Support JavaScript files
- `incremental: true` - Faster rebuilds

```json
{
  "extends": "@repo/config/typescript/nextjs",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "next-env.d.ts", ".next/types/**/*.ts"]
}
```

#### React Library (`@repo/config/typescript/react-library`)

Optimized for reusable React component libraries:

- `jsx: "react-jsx"` - Modern JSX runtime
- `declaration: true` - Generate .d.ts files
- `declarationMap: true` - Source maps for declarations

```json
{
  "extends": "@repo/config/typescript/react-library",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"],
  "exclude": ["src/**/*.test.tsx"]
}
```

### ESLint Configurations

All ESLint configs use the ESLint v9 flat config format.

#### Base (`@repo/config/eslint/base`)

Core linting rules:

- TypeScript support via `typescript-eslint`
- Import ordering and organization
- No unused variables/imports

```javascript
import baseConfig from "@repo/config/eslint/base";

export default [
  ...baseConfig,
  {
    // Add app-specific overrides
    rules: {
      // Custom rules
    },
  },
];
```

#### Next.js (`@repo/config/eslint/nextjs`)

Extends base with React and Next.js rules:

- React hooks rules
- JSX accessibility rules
- Next.js specific rules

```javascript
import nextjsConfig from "@repo/config/eslint/nextjs";

export default [
  ...nextjsConfig,
  {
    ignores: [".next/**"],
  },
];
```

#### React Library (`@repo/config/eslint/react-library`)

For shared React component packages:

- React and hooks rules
- Accessibility (jsx-a11y) rules
- No Next.js-specific rules

```javascript
import reactLibraryConfig from "@repo/config/eslint/react-library";

export default [
  ...reactLibraryConfig,
  {
    ignores: ["dist/**"],
  },
];
```

### Prettier Configuration

Consistent code formatting:

- `semi: true` - Semicolons required
- `singleQuote: true` - Single quotes for strings
- `trailingComma: "es5"` - Trailing commas where valid in ES5
- `tabWidth: 2` - 2-space indentation
- `printWidth: 100` - 100 character line width
- Includes `prettier-plugin-tailwindcss` for class sorting

```javascript
// prettier.config.js
export { default } from "@repo/config/prettier";
```

To extend:

```javascript
// prettier.config.js
import baseConfig from "@repo/config/prettier";

export default {
  ...baseConfig,
  printWidth: 120, // Override specific settings
};
```

### Tailwind CSS Configuration

#### CSS Import (`@repo/config/tailwind/base.css`)

Theme tokens defined using Tailwind v4's CSS-first approach:

```css
/* In your app's globals.css */
@import "tailwindcss";
@import "@repo/config/tailwind/base.css";

/* Add app-specific styles below */
```

**Important**: Import `tailwindcss` first, then the base.css theme tokens.

#### Theme Utilities (`@repo/config/tailwind`)

TypeScript utilities for programmatic access to theme tokens:

```typescript
import {
  colorPalettes,
  spacingScale,
  getCssColorVar,
  spacingToPx,
  isColorPalette,
} from "@repo/config/tailwind";

// Get CSS variable reference
const primaryColor = getCssColorVar("primary", "500");
// Result: "var(--color-primary-500)"

// Convert spacing to pixels
const padding = spacingToPx("4");
// Result: 16

// Type guard for color palettes
if (isColorPalette(userInput)) {
  // TypeScript knows userInput is a valid palette name
}
```

### Vitest Configuration

#### Base (`@repo/config/vitest/base`)

Common test settings:

```typescript
import { defineConfig, mergeConfig } from "vitest/config";
import { baseConfig } from "@repo/config/vitest/base";

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      // Package-specific settings
      setupFiles: ["./test/setup.ts"],
    },
  })
);
```

#### Coverage (`@repo/config/vitest/coverage`)

Coverage thresholds and reporters:

```typescript
import { coverageConfig } from "@repo/config/vitest/coverage";

// Use directly or customize
const customCoverage = {
  ...coverageConfig,
  thresholds: {
    lines: 80,
    branches: 75,
    functions: 80,
    statements: 80,
  },
};
```

## Peer Dependencies

This package declares the following as optional peer dependencies:

| Dependency                    | Version | Required For |
| ----------------------------- | ------- | ------------ |
| `typescript`                  | ^5.7.0  | TypeScript   |
| `eslint`                      | ^9.39.0 | ESLint       |
| `prettier`                    | ^3.2.0  | Prettier     |
| `prettier-plugin-tailwindcss` | ^0.6.0  | Prettier     |
| `tailwindcss`                 | ^4.0.0  | Tailwind CSS |

Consuming packages should install the tools they need.

## Troubleshooting

### "Cannot find module '@repo/config/...'"

**Cause**: Missing workspace dependency.

**Solution**: Add the dependency to your package.json:

```bash
pnpm add @repo/config@workspace:*
```

### ESLint "Configuration not found" or legacy config conflicts

**Cause**: Old `.eslintrc.*` file conflicts with flat config.

**Solution**:

1. Delete any `.eslintrc`, `.eslintrc.js`, `.eslintrc.json` files
2. Create `eslint.config.js` using flat config format

### Tailwind classes not applying

**Cause**: CSS import order or missing import.

**Solution**: Ensure correct import order in your global stylesheet:

```css
/* CORRECT ORDER */
@import "tailwindcss";
@import "@repo/config/tailwind/base.css";
```

### TypeScript errors after extending config

**Cause**: Path configuration mismatch or missing compiler options.

**Solution**:

1. Check that `baseUrl` or `paths` are set in your local tsconfig
2. Verify `include` patterns match your source structure
3. Run `pnpm exec tsc --showConfig` to debug resolved config

### Coverage below threshold

**Cause**: Untested code paths or excluded files.

**Solution**:

1. Check coverage report for uncovered files
2. Verify test file patterns match (`**/*.test.ts`)
3. Ensure source files are in the `include` pattern

### ESLint performance issues

**Cause**: Linting generated files or node_modules.

**Solution**: Add ignores to your ESLint config:

```javascript
export default [
  ...baseConfig,
  {
    ignores: ["node_modules/**", "dist/**", ".next/**", "coverage/**"],
  },
];
```

## Development

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Type check
pnpm type-check
```

## Related Documentation

- [TAD: Package Architecture](/docs/2-technical/2-tad-package-architecture.md#repoconfig)
- [Canonical Versions](/docs/2-technical/references/canonical-versions.md)
- [API Reference](./API.md)
