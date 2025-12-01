# Package Version Migration Plan

> Generated from analysis of `pnpm dlx npm-check-updates --workspaces` output.
> See [S0-canonical-versions.md](S0-canonical-versions.md) for raw version data.

## Overview

This document outlines a phased approach to updating package dependencies across the monorepo. Updates are grouped by risk level and dependency relationships.

---

## Phase 1: Safe Updates (Single PR) - DONE

**Risk Level:** Low
**Estimated PR Size:** Small-Medium
**Testing Required:** Run full test suite, build all apps

### Updates Included

| Package              | Current | Target   | Scope                                           |
| -------------------- | ------- | -------- | ----------------------------------------------- |
| `pnpm`               | 10.22.0 | 10.24.0  | root                                            |
| `prettier`           | ^3.2.0  | ^3.7.3   | root                                            |
| `tsx`                | ^4.19.0 | ^4.21.0  | root                                            |
| `next`               | ^16.0.0 | ^16.0.6  | apps/docs, apps/routing, packages/middleware    |
| `react`              | ^19.0.0 | ^19.2.0  | apps/\*, packages/testing                       |
| `react-dom`          | ^19.0.0 | ^19.2.0  | apps/\*, packages/testing                       |
| `typescript`         | ^5.7.0  | ^5.9.3   | apps/\*, packages/\*                            |
| `@types/react`       | ^19.0.0 | ^19.2.7  | all                                             |
| `@types/react-dom`   | ^19.0.0 | ^19.2.3  | all                                             |
| `postcss`            | ^8.4.0  | ^8.5.6   | apps/routing                                    |
| `autoprefixer`       | ^10.4.0 | ^10.4.22 | apps/routing                                    |
| `tailwindcss`        | ^4.0.0  | ^4.1.17  | apps/routing                                    |
| `@playwright/test`   | ^1.40.0 | ^1.57.0  | root, apps/routing                              |
| `@testing-library/*` | various | latest   | packages/config, packages/testing, apps/routing |
| `@t3-oss/env-nextjs` | ^0.10.0 | ^0.13.8  | apps/routing                                    |

### Migration Steps

```bash
# 1. Update packageManager field in root package.json
# Change: "pnpm@10.22.0" → "pnpm@10.24.0"

# 2. Run workspace-wide update for safe packages
pnpm up -r prettier tsx typescript postcss autoprefixer tailwindcss
pnpm up -r next react react-dom
pnpm up -r @types/react @types/react-dom
pnpm up -r @playwright/test
pnpm up -r @testing-library/dom @testing-library/jest-dom @testing-library/react @testing-library/user-event
pnpm up -r @t3-oss/env-nextjs

# 3. Verify
pnpm install
pnpm build
pnpm test
pnpm test:e2e:smoke
```

### Verification Checklist

- [ ] `pnpm build` passes for all apps
- [ ] `pnpm test` passes
- [ ] `pnpm test:e2e:smoke` passes
- [ ] `pnpm type-check` passes
- [ ] `pnpm lint` passes

---

## Phase 2A: Commitlint Upgrade (18 → 20) - DONE

**Risk Level:** Low-Medium
**Estimated PR Size:** Small
**Breaking Changes:** Config format may change

### Updates Included

| Package                           | Current | Target  |
| --------------------------------- | ------- | ------- |
| `@commitlint/cli`                 | ^18.6.1 | ^20.1.0 |
| `@commitlint/config-conventional` | ^18.6.3 | ^20.0.0 |

### Migration Steps

```bash
# 1. Update packages together
pnpm up @commitlint/cli @commitlint/config-conventional

# 2. Check if config format changed
# Current config (commitlint.config.js):
# module.exports = { extends: ["@commitlint/config-conventional"] };
```

### Config Migration (if needed)

The current config at `commitlint.config.js` uses CommonJS. Commitlint 20 supports both formats, but you may want to migrate to ESM:

```javascript
// commitlint.config.js (ESM format - optional)
export default {
  extends: ["@commitlint/config-conventional"],
};
```

### Verification Checklist

- [ ] Test commit hook: `echo "feat: test" | pnpm commitlint`
- [ ] Test invalid commit: `echo "invalid" | pnpm commitlint` (should fail)
- [ ] Make a real commit to verify hook works

---

## Phase 2B: @types/node Alignment - DONE

**Risk Level:** Low-Medium
**Estimated PR Size:** Small
**Breaking Changes:** May surface type errors

### Current State

| Location            | Current Version |
| ------------------- | --------------- |
| apps/docs           | ^24.0.0         |
| apps/routing        | ^24.0.0         |
| packages/middleware | ^22.0.0 ⚠️      |
| packages/testing    | ^22.0.0 ⚠️      |

### Migration Steps

```bash
# 1. Align all packages to v24
pnpm up -r @types/node@^24.10.1

# 2. Run type check across workspace
pnpm type-check
```

### Potential Issues

- Node.js 24 types may include breaking changes from v22
- Check for any `NodeJS.` namespace usages that may have changed
- Review any `Buffer`, `process`, or stream-related code

### Verification Checklist

- [ ] `pnpm type-check` passes in all packages
- [ ] No new TypeScript errors

---

## Phase 2C: lint-staged Upgrade (15 → 16) - DONE

**Risk Level:** Low-Medium
**Estimated PR Size:** Small
**Breaking Changes:** Possible config changes

### Migration Steps

```bash
# 1. Update package
pnpm up lint-staged

# 2. Review changelog for breaking changes
# https://github.com/lint-staged/lint-staged/releases/tag/v16.0.0
```

### Current Config

The current config is embedded in `package.json`:

```json
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{js,jsx}": ["eslint --fix", "prettier --write"],
  "*.md": ["markdownlint-cli2 --fix --config .markdownlint-cli2.jsonc", "prettier --write"],
  "*.{json,yml,yaml}": ["prettier --write"]
}
```

This config format is compatible with v16. No changes expected.

### Verification Checklist

- [ ] Stage a `.ts` file and run `pnpm lint-staged`
- [ ] Stage a `.md` file and run `pnpm lint-staged`
- [ ] Full pre-commit hook test: make a commit

---

## Phase 3A: @faker-js/faker Upgrade (8 → 10) - DONE

**Risk Level:** Medium
**Estimated PR Size:** Medium
**Breaking Changes:** API changes between major versions

### Affected Files

- `packages/testing/src/factories/user.ts`
- `packages/testing/src/factories/organization.ts`

### Current Faker API Usage

| Method                         | File            | Line     |
| ------------------------------ | --------------- | -------- |
| `faker.seed()`                 | user.ts         | 63       |
| `faker.person.firstName()`     | user.ts         | 88       |
| `faker.person.lastName()`      | user.ts         | 89       |
| `faker.string.uuid()`          | user.ts, org.ts | multiple |
| `faker.string.alphanumeric()`  | user.ts         | 96       |
| `faker.internet.email()`       | user.ts         | 94       |
| `faker.number.float()`         | user.ts         | 97       |
| `faker.image.avatar()`         | user.ts         | 97       |
| `faker.image.urlLoremFlickr()` | org.ts          | 80       |
| `faker.date.past()`            | user.ts, org.ts | multiple |
| `faker.company.name()`         | org.ts          | 77       |
| `faker.company.catchPhrase()`  | org.ts          | 79       |

### Migration Steps

```bash
# 1. Update faker
cd packages/testing
pnpm up @faker-js/faker

# 2. Check for API changes and update factories
```

### Known Breaking Changes (v8 → v9 → v10)

1. **`faker.image.urlLoremFlickr()`** - May be deprecated/changed
   - Check replacement API in v10
   - Likely replaced with `faker.image.url()` or similar

2. **Seeding API** - `faker.seed()` should still work but verify

3. **Date methods** - `faker.date.past()` API may have changed options format

### Code Changes Required

Review and update `organization.ts:80`:

```typescript
// Current:
logoUrl: faker.image.urlLoremFlickr({ category: "business" }),

// May need to change to (verify against v10 docs):
logoUrl: faker.image.url(),
```

### Verification Checklist

- [ ] `pnpm test` in packages/testing passes
- [ ] All factories generate valid data
- [ ] Seeding produces deterministic output

---

## Phase 3B: Zod Upgrade (3 → 4) - DONE

**Risk Level:** Medium-High
**Estimated PR Size:** Medium
**Breaking Changes:** Schema API changes, inference changes

### Affected Files

- `apps/routing/src/env.ts` - Environment validation

### Current Zod API Usage

```typescript
z.enum(["development", "test", "production"]);
z.string().url();
z.string().min(1);
z.string().length(44);
z.string().url().optional();
z.string().optional();
```

### Compatibility Check

Before upgrading, verify `@t3-oss/env-nextjs` supports Zod v4:

```bash
# Check peer dependencies
npm info @t3-oss/env-nextjs@0.13.8 peerDependencies
```

### Known Breaking Changes (Zod 3 → 4)

1. **Type inference** - `z.infer<>` behavior may change
2. **Error formatting** - Error messages structured differently
3. **`.optional()` behavior** - May handle `undefined` differently
4. **New methods** - Some methods renamed or moved

### Migration Steps

```bash
# 1. First ensure @t3-oss/env-nextjs supports Zod 4
# If not compatible, this upgrade must wait

# 2. Update Zod
cd apps/routing
pnpm up zod

# 3. Test env validation
pnpm build
```

### Code Review Required

Check `env.ts` for any deprecated patterns:

- `.describe()` - Verify still supported
- Optional chaining with `.url().optional()` - Verify order still valid

### Verification Checklist

- [ ] `@t3-oss/env-nextjs` confirms Zod 4 support
- [ ] Environment validation works in dev: `pnpm dev`
- [ ] Build succeeds: `pnpm build`
- [ ] Runtime env parsing works correctly
- [ ] Type inference still correct (check for TypeScript errors)

---

## Phase 3C: ESLint 9 Migration (Most Complex)

**Risk Level:** High
**Estimated PR Size:** Large
**Breaking Changes:** Complete config format change

### Current State

- No `.eslintrc*` files exist (good!)
- Apps use `eslint-config-next` which handles configuration
- ESLint is installed at root and in apps

### Required Updates

| Package              | Current | Target  | Location                |
| -------------------- | ------- | ------- | ----------------------- |
| `eslint`             | ^8.57.1 | ^9.39.1 | root                    |
| `eslint`             | ^8.56.0 | ^9.39.1 | apps/docs, apps/routing |
| `eslint-config-next` | ^15.0.0 | ^16.0.6 | apps/docs, apps/routing |

### Prerequisites

- `eslint-config-next@16` must support ESLint 9 flat config
- Next.js 16 includes ESLint 9 support

### Migration Strategy

ESLint 9 uses **flat config** (`eslint.config.js`) instead of `.eslintrc.*`. Since no legacy configs exist, you need to:

1. Create `eslint.config.js` at root and in each app
2. Update all packages

### Migration Steps

#### Step 1: Create Root ESLint Config

Create `eslint.config.js` at root:

```javascript
import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      // Add your rules here
    },
  },
  {
    ignores: ["node_modules/", ".next/", "dist/", ".turbo/"],
  },
];
```

#### Step 2: Create App-Level ESLint Configs

For Next.js apps, create `apps/routing/eslint.config.js`:

```javascript
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      "react-hooks": hooksPlugin,
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  {
    ignores: [".next/"],
  },
];
```

#### Step 3: Install New Dependencies

```bash
# Root
pnpm add -D @eslint/js @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Apps
pnpm --filter @repo/routing add -D @next/eslint-plugin-next eslint-plugin-react eslint-plugin-react-hooks
pnpm --filter docs add -D @next/eslint-plugin-next eslint-plugin-react eslint-plugin-react-hooks
```

#### Step 4: Update ESLint Packages

```bash
pnpm up -r eslint eslint-config-next
```

#### Step 5: Update package.json Scripts

The lint scripts should work as-is since they just call `eslint .`

### Verification Checklist

- [ ] `pnpm lint` passes at root
- [ ] `pnpm lint` passes in apps/routing
- [ ] `pnpm lint` passes in apps/docs
- [ ] `pnpm lint:fix` works correctly
- [ ] lint-staged still works with ESLint
- [ ] CI lint job passes

---

## Summary: Recommended Execution Order

| Order | Phase                 | Risk   | Depends On               |
| ----- | --------------------- | ------ | ------------------------ |
| 1     | Phase 1: Safe Updates | Low    | None                     |
| 2     | Phase 2A: Commitlint  | Low    | None                     |
| 3     | Phase 2B: @types/node | Low    | Phase 1                  |
| 4     | Phase 2C: lint-staged | Low    | None                     |
| 5     | Phase 3A: Faker       | Medium | None                     |
| 6     | Phase 3B: Zod         | Medium | Phase 1 (@t3-oss/env)    |
| 7     | Phase 3C: ESLint 9    | High   | Phase 1 (Next.js 16.0.6) |

Each phase should be a separate PR with its own testing cycle.
