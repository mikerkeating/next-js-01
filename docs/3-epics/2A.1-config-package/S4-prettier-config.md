# Story 2A.1.S4: Configure Prettier Formatting Standards

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Configuration Package](./EPIC.md)
- **Depends On**: [S1](./S1-package-structure.md) - Package structure must exist
- **Blocks**: [S5](./S5-tailwind-config.md), [S6](./S6-integration.md)
- **Runs in Parallel With**: [S2](./S2-typescript-config.md), [S3](./S3-eslint-config.md)

## User Story

**As a** developer working in the monorepo
**I want** a shared Prettier configuration for consistent code formatting
**So that** all packages and apps have uniform code style without formatting conflicts or configuration drift

## Acceptance Criteria

- [x] Prettier configuration exists at `packages/config/src/prettier/index.js`
- [x] Configuration enforces consistent formatting rules (semicolons, single quotes, trailing commas)
- [x] Tailwind CSS class sorting plugin is configured for automatic class ordering
- [x] Package exports are updated to expose Prettier config via `@repo/config/prettier`
- [x] A consuming package can use the config via `prettier` field in package.json
- [x] Running `pnpm format` in the config package applies formatting without errors

## Technical Requirements

### Files to Create

| Path                                    | Purpose                                      |
| --------------------------------------- | -------------------------------------------- |
| `packages/config/src/prettier/index.js` | Prettier configuration with formatting rules |

### Files to Modify

| Path                           | Changes                                        |
| ------------------------------ | ---------------------------------------------- |
| `packages/config/package.json` | Add Prettier config exports to `exports` field |
| `packages/config/package.json` | Add Prettier peer dependencies                 |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

Peer dependencies: `prettier`, `prettier-plugin-tailwindcss`

### Configuration Details

| Setting         | Requirement                                | Reference                                                            |
| --------------- | ------------------------------------------ | -------------------------------------------------------------------- |
| `semi`          | `true` - Always use semicolons             | [Coding Standards](/docs/2-technical/references/coding-standards.md) |
| `singleQuote`   | `true` - Use single quotes                 | [Coding Standards](/docs/2-technical/references/coding-standards.md) |
| `trailingComma` | `"es5"` - Trailing commas where ES5 allows | [Coding Standards](/docs/2-technical/references/coding-standards.md) |
| `tabWidth`      | `2` - Two-space indentation                | [Coding Standards](/docs/2-technical/references/coding-standards.md) |
| `printWidth`    | `100` - Line width limit                   | [Coding Standards](/docs/2-technical/references/coding-standards.md) |
| `plugins`       | Include `prettier-plugin-tailwindcss`      | [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling)          |

## Test Requirements

### Manual Verification

- [x] **Config Extension**: Reference config from another package, verify formatting applies
- [x] **Tailwind Sorting**: Write unordered Tailwind classes, verify sorted on format

### Automated Tests

- [x] Unit: `packages/config/tests/prettier.test.ts` - Verify config exports valid Prettier config

### Verification Commands

```bash
# Verify config file is valid JavaScript
pnpm --filter @repo/config exec node -e "console.log(require('./src/prettier/index.js'))"

# Run Prettier on config package
pnpm --filter @repo/config format

# Validate exports resolve correctly
pnpm --filter @repo/config exec node -e "console.log(require.resolve('@repo/config/prettier'))"
```

## Implementation Notes

### Key Concepts

- **Shareable Config**: Prettier configs shared via npm packages, referenced by path
- **Plugin System**: Plugins extend formatting (e.g., Tailwind class sorting)

### Troubleshooting

| Issue              | Cause                      | Solution                                     |
| ------------------ | -------------------------- | -------------------------------------------- |
| Plugin not found   | Missing peer dependency    | Add to peerDependencies, install in consumer |
| Config not applied | Wrong path in package.json | Use exact path: `@repo/config/prettier`      |
| Classes not sorted | Plugin not loaded          | Verify plugin array includes tailwindcss     |

## Estimated Effort

**Size**: S (3h)

## Architecture Decisions

### Consolidated Decisions (reference only)

- [TAD: Package Architecture](/docs/2-technical/2-tad-package-architecture.md) - Package exports patterns
- [TAD: Development Tools](/docs/2-technical/2-tad.md#development-tools) - Prettier 3.x selection
- [Coding Standards](/docs/2-technical/references/coding-standards.md) - Formatting conventions

## Out of Scope

- **Editor configurations** - VS Code settings handled in Epic 1A.4
- **Pre-commit hook setup** - Handled in Epic 1A.2 (lint-staged)
- **CI formatting workflow** - Handled in Epic 1A.5 (GitHub Actions)

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1**: Package structure - The `packages/config` directory and base package.json must exist

### Enables (Unblocks These Stories)

- **S5**: Tailwind config - Benefits from Tailwind class sorting integration
- **S6**: Integration - Applies Prettier config across all monorepo packages

## References

- [EPIC.md: Configuration Package](./EPIC.md)
- [TAD: @repo/config](/docs/2-technical/2-tad-package-architecture.md#repoconfig)
- [Coding Standards](/docs/2-technical/references/coding-standards.md)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)
- [prettier-plugin-tailwindcss](https://github.com/tailwindlabs/prettier-plugin-tailwindcss)

## Verification Checklist

- [x] S1 (Package Structure) completed
- [x] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [x] All acceptance criteria met
- [x] No lint errors, types compile successfully
- [x] Tests written and passing
- [x] Conventional commit message used

## Status

- **State**: Complete
- **Completed**: 2025-12-01
- **PR**: -

## Completion Notes

### Summary

Implemented shared Prettier configuration for the monorepo with consistent formatting rules and Tailwind CSS class sorting support. The configuration exports `semi: true`, `singleQuote: true`, `trailingComma: 'es5'`, `tabWidth: 2`, `printWidth: 100`, and includes the `prettier-plugin-tailwindcss` plugin for automatic class ordering.

### Test Results

| Test       | Command                                 | Result          |
| ---------- | --------------------------------------- | --------------- |
| Types      | `pnpm --filter @repo/config type-check` | Pass            |
| Unit Tests | `pnpm --filter @repo/config test`       | Pass (12 tests) |

### Files Changed

Beyond planned files:

- `packages/config/src/prettier/index.d.ts` - TypeScript declaration file for the JS config
- `packages/config/tests/prettier.test.ts` - Unit tests for Prettier configuration

### Known Issues

None.

### Lessons Learned

- JavaScript config files exported from packages need corresponding `.d.ts` declaration files for TypeScript type-checking to work correctly when importing via package exports.
