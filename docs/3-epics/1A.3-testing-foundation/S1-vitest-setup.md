# Story 1A.3.S1: Install and Configure Vitest

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Testing Foundation](./EPIC.md)
- **Depends On**: None (first story in epic)
- **Blocks**: [S2: React Testing Library](./S2-react-testing-library.md), [S3: Mock Utilities](./S3-mock-utilities.md), [S5: @repo/testing Package](./S5-testing-package.md), [S6: Coverage Config](./S6-coverage-config.md)
- **Runs in Parallel With**: [S4: Playwright Setup](./S4-playwright-setup.md)

## User Story

**As a** developer
**I want** Vitest configured as the unit test runner across the monorepo
**So that** I can write and run fast, isolated unit tests with consistent configuration

## Acceptance Criteria

- [ ] Running `pnpm test` from root executes Vitest across all packages with tests
- [ ] Running `pnpm test` from any package runs tests for that package only
- [ ] Vitest workspace configuration enables shared settings across all packages
- [ ] Test files matching `*.test.ts` and `*.test.tsx` are automatically discovered
- [ ] TypeScript path aliases resolve correctly in test files
- [ ] Tests run in watch mode by default for local development (`pnpm test`)
- [ ] CI mode runs all tests once without watch (`pnpm test:ci`)
- [ ] Turborepo caches test results (second run with no changes shows cache hit)

## Technical Requirements

### Files to Create

| Path                               | Purpose                                        |
| ---------------------------------- | ---------------------------------------------- |
| `vitest.workspace.ts`              | Root workspace configuration defining projects |
| `packages/config/vitest/base.ts`   | Shared Vitest configuration for all packages   |
| `apps/web/vitest.config.ts`        | App-specific Vitest configuration              |
| `apps/web/src/lib/example.test.ts` | Sample unit test to verify setup               |

### Files to Modify

| Path                           | Changes                                 |
| ------------------------------ | --------------------------------------- |
| `package.json`                 | Add `test`, `test:ci` scripts           |
| `turbo.json`                   | Add `test` and `test:ci` pipeline tasks |
| `apps/web/package.json`        | Add test script and vitest dependency   |
| `packages/config/package.json` | Add vitest configuration export         |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# Root workspace dev dependencies
pnpm add -D -w vitest @vitest/ui

# Per-app dependencies (apps/web as example)
pnpm add -D vitest --filter @repo/web
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting            | Requirement                                     | TAD Reference                                                   |
| ------------------ | ----------------------------------------------- | --------------------------------------------------------------- |
| `test.include`     | `['**/*.test.ts', '**/*.test.tsx']`             | [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md) |
| `test.environment` | `happy-dom` (default), `node` for non-DOM tests | [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md) |
| `resolve.alias`    | Match tsconfig paths (`@/*` → `src/*`)          | [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md) |
| `test.globals`     | `true` for describe/it/expect without imports   | [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md) |

**Configuration Rationale**:

- Workspace configuration enables Turborepo to cache test results per-package
- Shared base configuration reduces duplication and ensures consistency
- Path alias resolution ensures imports work identically in tests and production

## Test Requirements

### Manual Verification

- [ ] **Test Discovery**: Create a `.test.ts` file, verify Vitest discovers and runs it
- [ ] **Watch Mode**: Modify a test file, verify Vitest re-runs affected tests automatically
- [ ] **Path Aliases**: Import using `@/` alias in test file, verify it resolves correctly
- [ ] **Cache Hit**: Run `pnpm test:ci` twice with no changes, verify second run shows "cache hit"

### Automated Tests

- [ ] Unit: `apps/web/src/lib/example.test.ts` - Verify basic Vitest functionality (describe, it, expect)
- [ ] Unit: `apps/web/src/lib/example.test.ts` - Verify async test support

### Integration Tests

N/A - Infrastructure setup story; runtime integration tested via manual verification.

### Verification Commands

```bash
# Run tests across workspace
pnpm test

# Run tests in CI mode (no watch)
pnpm test:ci

# Run tests for specific package
pnpm test --filter @repo/web

# Verify Turborepo caching (run twice)
pnpm test:ci && pnpm test:ci
```

## Implementation Notes

### Implementation Sequence

1. **Install Dependencies**
   - Add Vitest and @vitest/ui to root workspace
   - Add Vitest to apps/web package

2. **Create Shared Configuration**
   - Create `packages/config/vitest/base.ts` with shared settings
   - Export configuration from packages/config

3. **Create Workspace Configuration**
   - Create `vitest.workspace.ts` at root
   - Define projects for each app/package with tests

4. **Configure Per-App Settings**
   - Create `apps/web/vitest.config.ts` extending base config
   - Configure path aliases to match tsconfig

5. **Add Scripts and Pipeline Tasks**
   - Add test scripts to root and app package.json
   - Configure Turborepo pipeline for test caching

6. **Verify Setup**
   - Create sample test file
   - Run tests and verify watch mode, caching, path resolution

### Key Concepts

- **Vitest Workspace**: Single root config that orchestrates tests across multiple projects
- **Configuration Inheritance**: Per-package configs extend shared base for consistency
- **Turborepo Test Caching**: Tests are cached per-package, invalidated on source changes

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md)
- [TAD: Testing Strategy by Application](/docs/2-technical/2-tad-testing.md#testing-strategy-by-application)

Key pattern notes for this story:

- Use workspace mode for monorepo test coordination
- Configure globals to avoid explicit imports in every test file
- Set up path aliases to mirror production code resolution

### Troubleshooting

**Issue**: Tests fail to find modules with `@/` alias

- **Cause**: Vitest resolve.alias not configured to match tsconfig paths
- **Solution**: Ensure `resolve.alias` in vitest.config.ts matches tsconfig `paths`

**Issue**: Turborepo doesn't cache test results

- **Cause**: Test task not configured in turbo.json pipeline
- **Solution**: Add `test` task with proper `inputs` and `outputs` configuration

**Issue**: Watch mode doesn't detect file changes

- **Cause**: File system watcher limits on Linux/WSL
- **Solution**: Increase fs.inotify.max_user_watches or use polling mode

### Reference Materials

- [Vitest Documentation](https://vitest.dev/)
- [Vitest Workspace Guide](https://vitest.dev/guide/workspace)
- [Testing Next.js Apps](https://nextjs.org/docs/app/building-your-application/testing)

## Estimated Effort

**Size**: M (5h)

**Breakdown**:

- Install and configure dependencies: 1h
- Create shared and workspace configuration: 1.5h
- Configure per-app settings and path aliases: 1h
- Add Turborepo pipeline and scripts: 0.5h
- Testing and troubleshooting: 1h

## Architecture Decisions

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md) - Vitest as unit test runner, test file naming conventions
- [EPIC: Technical Constraints](/docs/3-epics/1A.3-testing-foundation/EPIC.md#technical-constraints) - Test colocation, naming patterns

### Story-Specific Decisions

#### AD-1A.3.S1.1: Vitest Workspace vs Per-Package Configuration

**Scope**: Story-specific (configuration approach for this setup)

**Decision**: Use Vitest workspace mode with per-package configs extending a shared base

**Rationale**:

- Single entry point for running all tests (`vitest.workspace.ts`)
- Per-package configs allow app-specific customisation (environment, aliases)
- Shared base reduces duplication and ensures consistency

**Consequences**:

- Slightly more complex initial setup
- Better scalability as monorepo grows
- Easier per-package customisation

**Alternatives Considered**:

- **Single root config**: Simpler but doesn't scale well; rejected for maintainability
- **Individual configs only**: No shared settings; rejected for consistency reasons

## Out of Scope

The following items are explicitly NOT part of this story:

- **Coverage configuration and thresholds** - Handled in [S6: Coverage Config](./S6-coverage-config.md)
- **React Testing Library setup** - Handled in [S2: React Testing Library](./S2-react-testing-library.md)
- **MSW and mock utilities** - Handled in [S3: Mock Utilities](./S3-mock-utilities.md)
- **E2E testing with Playwright** - Handled in [S4: Playwright Setup](./S4-playwright-setup.md)
- **CI/CD pipeline integration** - Deferred to Epic 1A.5; this story only creates test commands

## Dependencies on Other Stories

### Depends On (Must Complete First)

- None - This is the first story in the Testing Foundation epic

### Enables (Unblocks These Stories)

- **S2**: React Testing Library - Needs Vitest configured before adding RTL
- **S3**: Mock Utilities - Needs Vitest running to create mock factories
- **S5**: @repo/testing Package - Consolidates utilities built on Vitest foundation
- **S6**: Coverage Config - Adds coverage thresholds to existing Vitest setup

## References

### Epic & TAD References

- [EPIC.md: Testing Foundation](./EPIC.md)
- [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md)
- [TAD: Testing Philosophy](/docs/2-technical/2-tad-testing.md#overview)

### ADR References

- None yet - Testing-specific ADRs may be created during implementation

### External Documentation

- [Vitest Documentation](https://vitest.dev/)
- [Vitest Workspace Guide](https://vitest.dev/guide/workspace)
- [Vitest Configuration Reference](https://vitest.dev/config/)
- [Testing Next.js Apps](https://nextjs.org/docs/app/building-your-application/testing)

## Verification Checklist

### Pre-Verification

- [ ] All dependent stories completed (N/A - first story)
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] Required credentials/access available (N/A - local development only)

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors
- [ ] Types compile successfully
- [ ] Sample tests written and passing
- [ ] Turborepo caching verified

### Documentation

- [ ] Configuration files have inline comments explaining key decisions
- [ ] README updated with test commands (if applicable)

### Git Hygiene

- [ ] Conventional commit message used
- [ ] No unrelated changes included
- [ ] PR description complete

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
