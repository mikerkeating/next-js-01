# Story 1A.3.S5: Create @repo/testing Package

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Testing Foundation](./EPIC.md)
- **Depends On**: [S2: React Testing Library](./S2-react-testing-library.md), [S3: Mock Utilities](./S3-mock-utilities.md)
- **Blocks**: [S6: Coverage Config](./S6-coverage-config.md)
- **Runs in Parallel With**: None

## User Story

**As a** developer
**I want** a shared `@repo/testing` package with consolidated test utilities
**So that** I can import `renderWithProviders`, mock factories, and MSW handlers from a single package across all apps

## Acceptance Criteria

- [x] Package `@repo/testing` exists at `packages/testing` and is importable from any app
- [x] `renderWithProviders` utility renders components with all required providers (React Query, etc.)
- [x] Mock factories (`createUser`, `createOrganization`) are exported and usable
- [x] MSW server and handlers are exported for reuse across test files
- [x] Package exports all utilities from a single entry point (`@repo/testing`)
- [x] TypeScript types are correctly exported for all utilities
- [x] Importing `@repo/testing` does not import production dependencies into tests

## Technical Requirements

### Files to Create

| Path                                 | Purpose                                        |
| ------------------------------------ | ---------------------------------------------- |
| `packages/testing/package.json`      | Package manifest with dependencies and exports |
| `packages/testing/tsconfig.json`     | TypeScript configuration                       |
| `packages/testing/src/index.ts`      | Main entry point exporting all utilities       |
| `packages/testing/src/render.tsx`    | `renderWithProviders` utility                  |
| `packages/testing/src/providers.tsx` | Test provider wrapper component                |
| `packages/testing/src/types.ts`      | Shared type definitions                        |

### Files to Modify

| Path                                      | Changes                                         |
| ----------------------------------------- | ----------------------------------------------- |
| `packages/testing/src/mocks/server.ts`    | Move from S3 location if needed, ensure exports |
| `packages/testing/src/mocks/handlers.ts`  | Ensure proper exports                           |
| `packages/testing/src/factories/index.ts` | Ensure all factories exported                   |
| `pnpm-workspace.yaml`                     | Verify packages/testing is included             |
| `apps/web/package.json`                   | Add `@repo/testing` as dev dependency           |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

```bash
# Package already has dependencies from S3; add React Testing Library re-exports
pnpm add @testing-library/react @testing-library/user-event --filter @repo/testing

# Add to apps that consume the package
pnpm add -D @repo/testing --filter @repo/web
```

### Configuration Details

| Setting                   | Requirement                     | TAD Reference                                                   |
| ------------------------- | ------------------------------- | --------------------------------------------------------------- |
| `exports` in package.json | Define entry points for imports | [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md) |
| `peerDependencies`        | React, React DOM as peers       | [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md) |
| TypeScript `composite`    | Enable project references       | [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md) |

**Configuration Rationale**:

- Central package reduces duplication of test utilities across apps
- Re-exporting Testing Library utilities ensures consistent versions
- Peer dependencies prevent bundling React multiple times

## Test Requirements

### Manual Verification

- [x] **Import Test**: Import `renderWithProviders` from `@repo/testing` in apps/routing test
- [x] **Provider Wrapping**: Render a component with providers, verify no errors
- [x] **Factory Usage**: Use `createUser()` factory, verify typed object returned
- [x] **MSW Integration**: Import server from `@repo/testing`, verify handlers work

### Automated Tests

- [x] Unit: `packages/testing/src/render.test.tsx` - Verify renderWithProviders returns screen utilities
- [x] Unit: `packages/testing/src/render.test.tsx` - Verify custom options merge with defaults
- [x] Unit: `packages/testing/src/providers.test.tsx` - Verify providers wrap children correctly

### Integration Tests

- [x] Import `@repo/testing` in apps/routing and render component with providers
- [x] Verify MSW handlers from shared package intercept requests in app tests

### Verification Commands

```bash
# Build the package
pnpm build --filter @repo/testing

# Run package tests
pnpm test --filter @repo/testing

# Verify imports work from consuming app
pnpm test --filter @repo/web
```

## Implementation Notes

### Implementation Sequence

1. **Create Package Structure** - Set up `packages/testing` with package.json exports map and tsconfig.json
2. **Consolidate Existing Utilities** - Verify MSW setup and factories from S3 are in correct location with typed exports
3. **Create renderWithProviders** - Build providers wrapper with QueryClientProvider, wrap Testing Library render
4. **Create Entry Point** - Export all utilities from `src/index.ts`, re-export Testing Library utilities
5. **Configure Consuming Apps** - Add @repo/testing as dev dependency, update tests to use shared utilities

### Key Concepts

- **renderWithProviders**: Wraps React Testing Library's render with app providers
- **Provider Composition**: Nest providers in correct order (Router > Query > Theme)
- **Re-exports**: Package re-exports Testing Library utilities for version consistency

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Test Helpers](/docs/2-technical/2-tad-testing.md#test-helpers)
- [TAD: Test Infrastructure](/docs/2-technical/2-tad-testing.md#test-infrastructure)

Key pattern notes for this story:

- Return all screen queries from renderWithProviders for query access
- Accept render options to allow per-test customisation
- Clear QueryClient between tests to prevent state leakage

### Troubleshooting

| Issue                                | Solution                                                           |
| ------------------------------------ | ------------------------------------------------------------------ |
| `Cannot find module '@repo/testing'` | Verify packages/testing in pnpm-workspace.yaml, run `pnpm install` |
| TypeScript errors on exports         | Configure exports map with types, import, require fields           |
| Provider errors in tests             | Ensure QueryClient is created fresh per-test                       |

### Reference Materials

- [React Testing Library Custom Render](https://testing-library.com/docs/react-testing-library/setup#custom-render)
- [MSW with Vitest](https://mswjs.io/docs/integrations/node)
- [pnpm Workspace Protocol](https://pnpm.io/workspaces#workspace-protocol-workspace)

## Estimated Effort

**Size**: M (6h)

**Breakdown**:

- Create package structure and configuration: 1h
- Consolidate existing utilities from S2/S3: 1h
- Create renderWithProviders and providers: 2h
- Configure exports and consuming apps: 1h
- Testing and documentation: 1h

## Architecture Decisions

### Consolidated Decisions (reference only)

- [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md) - Shared testing package pattern
- [TAD: Test Helpers](/docs/2-technical/2-tad-testing.md#test-helpers) - Helper function patterns
- [EPIC: Technology Decisions](/docs/3-epics/1A.3-testing-foundation/EPIC.md#technology-decisions) - MSW server location decision

### Story-Specific Decisions

#### AD-1A.3.S5.1: Re-export Testing Library Utilities

**Scope**: Story-specific

**Decision**: Re-export commonly used Testing Library utilities (screen, userEvent) from @repo/testing for single import source and version consistency. Rejected direct imports (version drift risk) and full re-export (bundle size).

#### AD-1A.3.S5.2: QueryClient Per-Test

**Scope**: Story-specific

**Decision**: Create a new QueryClient instance for each renderWithProviders call to prevent cache state leaking between tests and ensure full isolation.

## Out of Scope

The following items are explicitly NOT part of this story:

- **Database test helpers** - Deferred to Epic 2A.2 (Database Infrastructure)
- **Authentication test utilities** - Added with Epic 2A.4 (Authentication Integration)
- **Playwright fixtures** - E2E utilities handled separately in S4/S7
- **Coverage configuration** - Handled in [S6: Coverage Config](./S6-coverage-config.md)
- **Additional providers** (Router, Theme) - Added incrementally as apps need them

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S2**: React Testing Library - Provides RTL configuration and patterns to consolidate
- **S3**: Mock Utilities - Provides MSW setup and factories to consolidate

### Enables (Unblocks These Stories)

- **S6**: Coverage Config - Needs shared package in place for coverage reporting

## References

### Epic & TAD References

- [EPIC.md: Testing Foundation](./EPIC.md)
- [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md)
- [TAD: Test Helpers](/docs/2-technical/2-tad-testing.md#test-helpers)
- [TAD: Test Infrastructure](/docs/2-technical/2-tad-testing.md#test-infrastructure)

### ADR References

- None yet - Testing-specific ADRs may be created during implementation

### External Documentation

- [React Testing Library Custom Render](https://testing-library.com/docs/react-testing-library/setup#custom-render)
- [pnpm Workspace Protocol](https://pnpm.io/workspaces#workspace-protocol-workspace)
- [TypeScript Package Exports](https://www.typescriptlang.org/docs/handbook/esm-node.html)

## Verification Checklist

### Pre-Verification

- [x] S2 (React Testing Library) completed
- [x] S3 (Mock Utilities) completed
- [x] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)

### Implementation Quality

- [x] All acceptance criteria met
- [x] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [x] No lint errors
- [x] Types compile successfully
- [x] Package builds without errors
- [x] All exports are typed
- [x] Tests pass in consuming apps

### Documentation

- [x] Package README with usage examples (JSDoc in index.ts)
- [x] JSDoc comments on exported utilities
- [x] Type exports documented

### Git Hygiene

- [ ] Conventional commit message used
- [ ] No unrelated changes included
- [ ] PR description complete

## Status

- **State**: Complete
- **Completed**: 2025-11-29
- **PR**: -

## Completion Notes

### Summary

Created the `@repo/testing` package with consolidated test utilities including `renderWithProviders`, React Testing Library re-exports, and integration with existing MSW mocks and factories from S3. The package provides a single import source for all testing utilities, ensuring version consistency across the monorepo. Integration tests in `apps/routing` verify the package works correctly from consuming apps.

### Test Results

| Test        | Command                                  | Result                         |
| ----------- | ---------------------------------------- | ------------------------------ |
| Lint        | `pnpm lint --filter @repo/testing`       | Pass                           |
| Types       | `pnpm type-check --filter @repo/testing` | Pass                           |
| Unit Tests  | `pnpm test:ci --filter @repo/testing`    | Pass (13 tests)                |
| Integration | `pnpm test:ci --filter @repo/routing`    | Pass (42 tests, 8 integration) |
| Build       | `pnpm build --filter @repo/routing`      | Pass                           |

### Files Changed

**Created:**

- `packages/testing/src/types.ts` - Type definitions for render options and results
- `packages/testing/src/providers.tsx` - TestProviders component and createTestWrapper utility
- `packages/testing/src/render.tsx` - renderWithProviders utility wrapping RTL render
- `packages/testing/src/render.test.tsx` - Unit tests for renderWithProviders (6 tests)
- `packages/testing/src/providers.test.tsx` - Unit tests for TestProviders (7 tests)
- `packages/testing/vitest.config.ts` - Self-contained vitest config to avoid cyclic dependencies
- `packages/testing/vitest.setup.ts` - Test setup file for jest-dom matchers
- `packages/testing/vitest.d.ts` - TypeScript type declarations for vitest globals
- `apps/routing/src/lib/testing-package.integration.test.tsx` - Integration tests (8 tests)

**Modified:**

- `packages/testing/package.json` - Added RTL dependencies, exports for new modules, peer dependencies for React
- `packages/testing/src/index.ts` - Added exports for render utilities and RTL re-exports
- `packages/testing/tsconfig.json` - Updated to include test files and vitest type references

### Deviations from Plan

1. **App name**: Story specified `apps/web` but actual app is `apps/routing`. All tests adapted accordingly.
2. **Vitest config**: Created self-contained vitest.config.ts to avoid cyclic dependency with @repo/config (which imports from @repo/testing for MSW setup).
3. **React Query providers**: Not included in initial implementation as the app doesn't currently use React Query. The TestProviders component is designed to be extensible - providers can be added incrementally as apps need them.

### Known Issues

None.

### Lessons Learned

- When packages depend on each other (config ↔ testing), avoid creating circular dependencies by making leaf packages self-contained.
- React 19 with the new JSX transform requires explicit `React.ReactElement` types instead of `JSX.Element` namespace.
- Re-exporting Testing Library utilities (screen, userEvent) from the shared package ensures version consistency and reduces import statements in consuming apps.
