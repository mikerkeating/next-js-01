# @repo/config

Centralized configuration files for the monorepo. This package provides shared configurations for TypeScript, ESLint, Prettier, Tailwind CSS, and Vitest.

## Installation

This package is internal to the monorepo. Add it as a workspace dependency:

```bash
pnpm add @repo/config@workspace:*
```

## Export Structure

The package uses subpath exports to provide access to individual configurations:

```
@repo/config
├── ./typescript/base          # Base TypeScript configuration
├── ./typescript/nextjs        # Next.js TypeScript configuration
├── ./typescript/react-library # React library TypeScript configuration
├── ./eslint/base              # Base ESLint rules
├── ./eslint/nextjs       # Next.js ESLint rules
├── ./prettier            # Prettier configuration
├── ./tailwind            # Tailwind CSS configuration
├── ./vitest/base         # Base Vitest configuration
├── ./vitest/coverage     # Coverage configuration
├── ./vitest/setup-react  # React testing setup
└── ./vitest/setup-msw    # MSW setup for API mocking
```

## Usage

### TypeScript

Extend the base or Next.js configuration in your `tsconfig.json`:

```json
{
  "extends": "@repo/config/typescript/base"
}
```

For Next.js applications:

```json
{
  "extends": "@repo/config/typescript/nextjs"
}
```

For React library packages:

```json
{
  "extends": "@repo/config/typescript/react-library"
}
```

### ESLint

Import the configuration in your `eslint.config.js`:

```javascript
import baseConfig from "@repo/config/eslint/base";

export default [...baseConfig];
```

For Next.js applications:

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

Import and extend the configuration in your `tailwind.config.ts`:

```typescript
import baseConfig from "@repo/config/tailwind";

export default {
  ...baseConfig,
  content: ["./src/**/*.{ts,tsx}"],
};
```

### Vitest

Extend the base configuration in your `vitest.config.ts`:

```typescript
import { defineConfig, mergeConfig } from "vitest/config";
import { baseConfig } from "@repo/config/vitest/base";

export default mergeConfig(
  baseConfig,
  defineConfig({
    // Your package-specific settings
  })
);
```

## Peer Dependencies

This package declares the following peer dependencies (all optional):

- `typescript` - ^5.7.0
- `eslint` - ^9.39.0
- `prettier` - ^3.2.0
- `tailwindcss` - ^4.0.0

Consuming packages should install the tools they need.

## Development

```bash
# Run tests
pnpm test

# Type check
pnpm type-check
```

## Related Documentation

- [TAD: Package Architecture](/docs/2-technical/2-tad-package-architecture.md#repoconfig)
- [Canonical Versions](/docs/2-technical/references/canonical-versions.md)
