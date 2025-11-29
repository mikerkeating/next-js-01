# Story 1A.3.S2: Configure React Testing Library

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Testing Foundation](./EPIC.md)
- **Depends On**: [S1: Install and Configure Vitest](./S1-vitest-setup.md)
- **Blocks**: [S5: Create @repo/testing Package](./S5-testing-package.md)
- **Runs in Parallel With**: [S3: Set Up Mock Utilities and Factories](./S3-mock-utilities.md)

## User Story

**As a** developer
**I want** React Testing Library configured with Vitest for component testing
**So that** I can write tests that interact with components the way users do

## Acceptance Criteria

- [x] React Testing Library renders components correctly in Vitest test environment
- [x] `screen` queries (`getByRole`, `getByText`, etc.) work as expected
- [x] `userEvent` simulates user interactions (click, type, tab)
- [x] Custom jest-dom matchers available (`toBeInTheDocument`, `toHaveClass`, etc.) without explicit imports
- [x] Happy-dom environment configured as default for component tests
- [x] Sample component test demonstrates rendering, querying, and user interaction

## Technical Requirements

### Files to Create

| Path                                      | Purpose                                            |
| ----------------------------------------- | -------------------------------------------------- |
| `packages/config/vitest/setup-react.ts`   | Test setup file for React Testing Library matchers |
| `apps/web/src/components/Button.test.tsx` | Sample component test demonstrating RTL patterns   |

### Files to Modify

| Path                             | Changes                                        |
| -------------------------------- | ---------------------------------------------- |
| `packages/config/vitest/base.ts` | Add setupFiles reference for React tests       |
| `apps/web/vitest.config.ts`      | Configure happy-dom environment and setup file |
| `apps/web/package.json`          | Add React Testing Library dependencies         |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

```bash
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event happy-dom --filter @repo/web
```

### Configuration Details

| Setting            | Requirement                                       | TAD Reference                                      |
| ------------------ | ------------------------------------------------- | -------------------------------------------------- |
| `test.environment` | `happy-dom` for component tests                   | [TAD: Testing](/docs/2-technical/2-tad-testing.md) |
| `test.setupFiles`  | Include setup file that imports jest-dom matchers | [TAD: Testing](/docs/2-technical/2-tad-testing.md) |

## Test Requirements

### Manual Verification

- [x] **Component Rendering**: Render a React component in test, verify it appears
- [x] **User Interaction**: Simulate button click with userEvent, verify callback fires
- [x] **DOM Matchers**: Use `toBeInTheDocument()` without explicit import

### Automated Tests

- [x] Unit: `Button.test.tsx` - Verify button renders with correct text
- [x] Unit: `Button.test.tsx` - Verify click handler fires on user click
- [x] Unit: `Button.test.tsx` - Verify disabled state prevents interaction

### Verification Commands

```bash
pnpm test --filter @repo/web
pnpm test --filter @repo/web -- Button.test.tsx
```

## Implementation Notes

### Key Concepts

- **Testing Library Philosophy**: Test components as users interact with them, not implementation details
- **Queries**: Prefer `getByRole` > `getByLabelText` > `getByText` for accessibility
- **userEvent vs fireEvent**: Use userEvent for realistic user simulation

### Common Patterns

Reference the TAD for implementation patterns:

- [TAD: Unit Tests](/docs/2-technical/2-tad-testing.md#unit-tests)
- [TAD: Component Testing](/docs/2-technical/2-tad-testing.md#testing-strategy-by-application)

### Troubleshooting

**Issue**: `toBeInTheDocument is not a function`

- **Solution**: Ensure setup file imports `@testing-library/jest-dom` and is in vitest config setupFiles

**Issue**: `document is not defined`

- **Solution**: Set `environment: 'happy-dom'` in vitest.config.ts

## Estimated Effort

**Size**: S (3h)

## Architecture Decisions

### Consolidated Decisions

- [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md) - React Testing Library as component testing library

### Story-Specific Decisions

#### AD-1A.3.S2.1: Setup File Location

**Scope**: Story-specific

**Decision**: Place setup file in `packages/config/vitest/setup-react.ts` rather than per-app

**Rationale**: Centralises matcher imports; aligns with shared configuration pattern from S1

## Out of Scope

- **renderWithProviders utility** - [S5: @repo/testing Package](./S5-testing-package.md)
- **MSW integration** - [S3: Mock Utilities](./S3-mock-utilities.md)
- **Coverage thresholds** - [S6: Coverage Config](./S6-coverage-config.md)
- **Accessibility testing with jest-axe** - Deferred to Epic 4A.3

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1**: Install and Configure Vitest - RTL requires Vitest to be configured

### Enables (Unblocks These Stories)

- **S5**: @repo/testing Package - Uses RTL for `renderWithProviders` utility

## References

### Epic & TAD References

- [EPIC.md: Testing Foundation](./EPIC.md)
- [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md)

### External Documentation

- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [jest-dom Matchers](https://github.com/testing-library/jest-dom)
- [userEvent](https://testing-library.com/docs/user-event/intro)

## Verification Checklist

### Pre-Verification

- [x] S1 (Vitest Setup) completed
- [x] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)

### Implementation Quality

- [x] All acceptance criteria met
- [x] No lint errors; types compile
- [x] Sample component test passing
- [x] Matchers work without per-file imports

### Git Hygiene

- [ ] Conventional commit message used
- [ ] No unrelated changes included

## Status

- **State**: Complete
- **Completed**: 2025-11-29
- **PR**: -

## Completion Notes

### Summary

Configured React Testing Library with Vitest for component testing across the monorepo. Created a shared setup file in `packages/config/vitest/setup-react.ts` that imports jest-dom matchers and handles cleanup between tests. Added a sample Button component with comprehensive tests demonstrating RTL patterns including rendering, user interactions, disabled state handling, and keyboard accessibility.

### Test Results

| Test       | Command                                  | Result                            |
| ---------- | ---------------------------------------- | --------------------------------- |
| Lint       | `pnpm lint --filter @repo/routing`       | Pass                              |
| Types      | `pnpm type-check --filter @repo/routing` | Pass                              |
| Unit Tests | `pnpm test:ci --filter @repo/routing`    | Pass (23 tests - 8 new RTL tests) |
| Build      | `pnpm build --filter @repo/routing`      | Pass                              |

### Files Changed

**Created (adapted from story spec):**

- `packages/config/vitest/setup-react.ts` - Shared RTL setup with jest-dom matchers and cleanup
- `apps/routing/src/components/Button.tsx` - Sample button component (story specified `apps/web`)
- `apps/routing/src/components/Button.test.tsx` - RTL tests demonstrating patterns (story specified `apps/web`)

**Modified:**

- `packages/config/package.json` - Added export for `setup-react` and RTL dependencies
- `apps/routing/vitest.config.ts` - Added setupFiles reference to shared setup
- `apps/routing/vitest.d.ts` - Added jest-dom type reference for TypeScript support
- `apps/routing/package.json` - Added RTL dependencies (@testing-library/react, jest-dom, user-event, dom)

### Deviations from Plan

1. **App name**: Story specified `apps/web` but actual app is `apps/routing`. All implementations adapted accordingly (consistent with S1).
2. **Additional dependency**: Added `@testing-library/dom` as peer dependency required by `@testing-library/react` and `@testing-library/user-event`.
3. **TypeScript types**: Added jest-dom type reference to `vitest.d.ts` for proper TypeScript support of DOM matchers.

### Lessons Learned

- The `@testing-library/jest-dom` package provides Vitest-specific matchers via `@testing-library/jest-dom/vitest` import
- TypeScript requires explicit type reference (`/// <reference types="@testing-library/jest-dom" />`) to recognize jest-dom matchers on Vitest's expect
- The setup file should include `cleanup()` from RTL in afterEach to prevent test isolation issues
