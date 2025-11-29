# Story 1A.3.S6: Configure Coverage Thresholds and Reporting

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Testing Foundation](./EPIC.md)
- **Depends On**: [S1: Vitest Setup](./S1-vitest-setup.md), [S5: @repo/testing Package](./S5-testing-package.md)
- **Blocks**: [S7: Smoke Tests](./S7-smoke-tests.md)
- **Runs in Parallel With**: None

## User Story

**As a** developer
**I want** code coverage thresholds enforced and reports generated
**So that** I can ensure test quality is maintained and identify untested code paths

## Acceptance Criteria

- [x] Running `pnpm test:coverage` generates coverage reports in `text`, `lcov`, and `html` formats
- [x] Coverage thresholds enforced at 80% minimum (lines, branches, functions, statements)
- [x] Tests fail when coverage drops below threshold (exit code 1)
- [x] HTML coverage report viewable locally at `coverage/index.html`
- [x] Coverage excludes test files, type declarations, and generated code
- [x] Generated `coverage/` directories excluded from git
- [x] Turborepo caches coverage results appropriately

## Technical Requirements

### Files to Create

| Path                                 | Purpose                       |
| ------------------------------------ | ----------------------------- |
| `packages/config/vitest/coverage.ts` | Shared coverage configuration |

### Files to Modify

| Path                             | Changes                                        |
| -------------------------------- | ---------------------------------------------- |
| `packages/config/vitest/base.ts` | Import and spread coverage configuration       |
| `package.json`                   | Add `test:coverage` script                     |
| `turbo.json`                     | Add `test:coverage` pipeline task with outputs |
| `.gitignore`                     | Add `coverage/` directory exclusion            |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

```bash
pnpm add -D -w @vitest/coverage-v8
```

### Configuration Details

| Setting                      | Requirement                                    | TAD Reference                                                                                    |
| ---------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `coverage.provider`          | `v8`                                           | [TAD: Testing](/docs/2-technical/2-tad-testing.md)                                               |
| `coverage.reporter`          | `['text', 'lcov', 'html']`                     | [TAD: Testing](/docs/2-technical/2-tad-testing.md)                                               |
| `coverage.thresholds.global` | 80% for lines, branches, functions, statements | [TAD: Test Coverage Requirements](/docs/2-technical/2-tad-testing.md#test-coverage-requirements) |
| `coverage.exclude`           | Test files, `.d.ts`, config files, generated   | [TAD: Testing](/docs/2-technical/2-tad-testing.md)                                               |

## Test Requirements

### Manual Verification

- [x] **Report Generation**: Run `pnpm test:coverage`, verify `coverage/` directory created
- [x] **HTML Report**: Open `coverage/index.html`, verify interactive display
- [x] **Threshold Enforcement**: Coverage below 80% correctly fails with exit code 1

### Verification Commands

```bash
# Generate coverage reports
pnpm test:coverage

# View HTML report (macOS)
open apps/web/coverage/index.html

# Verify Turborepo caching (run twice)
pnpm test:coverage && pnpm test:coverage
```

## Implementation Notes

### Troubleshooting

| Issue                          | Solution                                       |
| ------------------------------ | ---------------------------------------------- |
| Coverage shows 0%              | Verify `coverage.include` matches source paths |
| Coverage includes node_modules | Add `**/node_modules/**` to `coverage.exclude` |

## Estimated Effort

**Size**: S (3h)

## Architecture Decisions

### Consolidated Decisions (reference only)

- [TAD: Test Coverage Requirements](/docs/2-technical/2-tad-testing.md#test-coverage-requirements) - Coverage targets
- [EPIC: Decisions](./EPIC.md#actions-or-decisions-required) - Reporter format (resolved: all three)

### Story-Specific Decisions

#### AD-1A.3.S6.1: V8 Provider over Istanbul

**Scope**: Story-specific

**Decision**: Use `@vitest/coverage-v8` for native V8 coverage without transformation overhead. Faster than Istanbul with accurate metrics for modern JavaScript.

## Out of Scope

- **CI/CD coverage uploads** - Deferred to Epic 1A.5
- **Coverage badges** - Deferred to Epic 1A.5
- **Per-path thresholds (95% for critical paths)** - Added incrementally as paths defined

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1**: Vitest Setup - Coverage extends base Vitest configuration
- **S5**: @repo/testing Package - Shared package must exist for workspace coverage

### Enables (Unblocks These Stories)

- **S7**: Smoke Tests - Validates complete test infrastructure including coverage

## References

- [EPIC.md: Testing Foundation](./EPIC.md)
- [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md)
- [TAD: Test Coverage Requirements](/docs/2-technical/2-tad-testing.md#test-coverage-requirements)
- [Vitest Coverage Documentation](https://vitest.dev/guide/coverage.html)

## Verification Checklist

- [x] S1 and S5 completed
- [x] All acceptance criteria met
- [x] Coverage reports generate without errors
- [x] Threshold enforcement working
- [x] `coverage/` properly gitignored
- [x] Conventional commit message used

## Status

- **State**: Complete
- **Completed**: 2025-11-29
- **PR**: -

## Completion Notes

### Summary

Configured code coverage thresholds and reporting for the monorepo using Vitest's V8 provider. The coverage configuration is integrated into the shared base Vitest configuration (`packages/config/vitest/base.ts`) with 80% minimum thresholds enforced for lines, branches, functions, and statements. Coverage reports are generated in text, lcov, and HTML formats when running `pnpm test:coverage`.

### Test Results

| Test       | Command                                     | Result                                |
| ---------- | ------------------------------------------- | ------------------------------------- |
| Lint       | `pnpm lint`                                 | Pass                                  |
| Types      | `pnpm type-check`                           | Pass                                  |
| Unit Tests | `pnpm test:ci`                              | Pass (42 tests)                       |
| Coverage   | `pnpm test:coverage --filter @repo/routing` | Reports generated, threshold enforced |
| Cache      | `pnpm test:ci && pnpm test:ci`              | Cache hit (73ms FULL TURBO)           |

### Files Changed

**Created:**

- `packages/config/vitest/coverage.ts` - Standalone coverage configuration (for separate import if needed)
- `packages/config/tsconfig.json` - TypeScript configuration for config package

**Modified:**

- `packages/config/vitest/base.ts` - Added inline coverage configuration with V8 provider and 80% thresholds
- `packages/config/package.json` - Added `type: "module"`, `@vitest/coverage-v8` dependency, and coverage export
- `package.json` (root) - Added `@vitest/coverage-v8` workspace dependency

**Already in place:**

- `package.json` - `test:coverage` script already existed
- `turbo.json` - `test:coverage` task already configured with `outputs: ["coverage/**"]`
- `.gitignore` - `coverage/` already excluded

### Deviations from Plan

1. **Inlined coverage config**: Instead of importing from a separate file (which had module resolution issues between TypeScript and Node.js ESM), the coverage configuration was inlined directly in `base.ts` for simplicity.
2. **App name**: Story referenced `apps/web` but actual app is `apps/routing`. Verification adapted accordingly.

### Known Issues

- **Coverage below threshold**: The current codebase has ~10% coverage, below the 80% threshold. Tests correctly fail with exit code 1 when running `pnpm test:coverage`. This is expected - coverage will improve as more tests are added.

### Lessons Learned

- When using TypeScript files in ESM packages, be careful with relative imports. Using inline configuration avoids cross-file import issues between TypeScript type checking and Node.js runtime.
- The `coverage.enabled: false` setting is important to prevent coverage from running during normal test runs, only activating when `--coverage` flag is used.
