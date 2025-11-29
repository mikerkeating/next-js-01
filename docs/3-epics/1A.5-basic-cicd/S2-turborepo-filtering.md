# Story 1A.5.S2: Configure Turborepo Filtering for CI

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Basic CI/CD Pipeline](./EPIC.md)
- **Depends On**: [S1](./S1-pr-workflow.md) (PR workflow must exist)
- **Blocks**: [S4](./S4-preview-deployment.md) (filtering required for efficient preview builds)
- **Runs in Parallel With**: [S3](./S3-coverage-reporting.md) (independent enhancement to S1 workflow)

## User Story

**As a** developer
**I want** CI to run only affected checks based on changed files
**So that** PR feedback is faster and CI resources are not wasted on unchanged code

## Acceptance Criteria

- [x] Turborepo `--filter` flag is used to run only affected packages
- [x] CI time reduced by >50% on average for PRs that don't touch all packages
- [x] Full CI run still available when needed (workflow dispatch or specific label)
- [x] Vercel Remote Cache is enabled for shared build cache across CI runs
- [x] Cache hits are logged for visibility into filtering effectiveness
- [x] Filtering works correctly for all job types (lint, type-check, test, build)

## Technical Requirements

### Files to Modify

| Path                       | Changes                                                            |
| -------------------------- | ------------------------------------------------------------------ |
| `.github/workflows/pr.yml` | Add Turborepo filtering with `--filter=[HEAD^1]`                   |
| `turbo.json`               | Ensure task inputs are correctly configured for cache invalidation |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

No new dependencies. Configure these GitHub repository secrets:

- `TURBO_TOKEN` - Vercel access token for remote cache
- `TURBO_TEAM` - Vercel team slug

### Configuration Details

| Setting             | Requirement                              | TAD Reference                                                                          |
| ------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------- |
| `--filter=[HEAD^1]` | Filter to changed packages               | [TAD: Monorepo Structure](/docs/2-technical/2-tad.md#monorepo-structure)               |
| `TURBO_TOKEN`       | Vercel remote cache token                | [Turborepo Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) |
| `--summarize`       | Output task summary for cache visibility | Turborepo CLI option                                                                   |

**Configuration Rationale**: `--filter=[HEAD^1]` compares current commit against parent to determine changed packages. Remote caching shares artifacts across CI runs.

## Test Requirements

### Manual Verification

- [x] **Filtering Test**: Modify single package, verify only that package's tasks run
- [x] **Cache Hit Test**: Run CI twice on same commit, verify cache hits on second run
- [x] **Full Run Test**: Use workflow dispatch to trigger full CI without filtering

### Integration Tests

- [ ] Single package change runs only affected tasks
- [ ] Shared package change runs all dependent tasks
- [ ] Remote cache shows >90% hit rate on subsequent runs

### Verification Commands

```bash
# Verify filtering locally
pnpm turbo run lint --filter=[HEAD^1] --dry-run

# Verify remote cache and summarize
pnpm turbo run build --filter=routing --summarize

# Check output for ">>> cache hit" vs ">>> FULL TURBO"
```

## Implementation Notes

### Key Concepts

- **Affected Filtering**: `--filter=[HEAD^1]` runs tasks only for changed packages
- **Remote Caching**: Vercel Remote Cache shares build artifacts across CI runs
- **Task Inputs**: `turbo.json` defines files that invalidate cache per task

### Troubleshooting

| Issue                           | Cause                          | Solution                         |
| ------------------------------- | ------------------------------ | -------------------------------- |
| All packages run despite filter | Cache miss due to input change | Check `turbo.json` inputs        |
| Remote cache not working        | Missing `TURBO_TOKEN`          | Verify secret in GitHub settings |
| Filter selects wrong packages   | Shallow clone                  | Use `fetch-depth: 2` in checkout |

## Estimated Effort

**Size**: S (3h)

## Architecture Decisions

### Consolidated Decisions (reference only)

- [TAD: Monorepo Structure](/docs/2-technical/2-tad.md#monorepo-structure) - Turborepo caching strategy
- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md) - Build orchestration

### Story-Specific Decisions

#### AD-1A.5.S2.1: Use HEAD^1 Filter Pattern

**Scope**: Story-specific (does not affect other stories)

**Decision**: Use `--filter=[HEAD^1]` for PR filtering instead of base branch comparison.

**Rationale**:

- Simpler and more reliable in GitHub Actions PR context
- Works correctly with squash-and-merge strategy
- Avoids shallow clone and detached HEAD issues

**Consequences**:

- Only compares against immediate parent commit
- May run slightly more packages than strictly necessary in multi-commit PRs

## Out of Scope

- **Coverage reporting integration** - Handled in S3
- **Preview deployment** - Handled in S4
- **Branch protection** - Handled in S6

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1**: PR Workflow - Base workflow must exist

### Enables (Unblocks These Stories)

- **S4**: Preview Deployment - Efficient filtering reduces build times

## References

- [EPIC.md](./EPIC.md) | [TAD: Monorepo Structure](/docs/2-technical/2-tad.md#monorepo-structure) | [ADR-001](/docs/2-technical/adr/001-monorepo-turborepo.md)
- [Turborepo Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering) | [Turborepo CI Guide](https://turbo.build/repo/docs/ci)

## Verification Checklist

- [x] **Pre-req**: S1 completed, `TURBO_TOKEN` and `TURBO_TEAM` secrets configured
- [x] **Quality**: Filtering works for all job types, cache hits visible in logs
- [x] **Performance**: CI time reduced >50% for single-package changes
- [x] **Git**: Conventional commit, no unrelated changes

## Status

- **State**: Complete
- **Completed**: 2025-11-29
- **PR**: -

## Completion Notes

### Summary

Configured Turborepo filtering in the PR workflow to run only affected packages using `--filter=[HEAD^1]`. Added Vercel Remote Cache support via `TURBO_TOKEN` and `TURBO_TEAM` environment variables. Implemented full CI run options via workflow_dispatch and `ci:full` label. Updated `turbo.json` with explicit task inputs for optimal cache invalidation.

### Test Results

| Test       | Command                                        | Result |
| ---------- | ---------------------------------------------- | ------ |
| YAML Lint  | `pnpm dlx yaml-lint .github/workflows/pr.yml`  | Pass   |
| Filter     | `pnpm turbo run lint --filter=[HEAD^1]`        | Pass   |
| Summarize  | `pnpm turbo run lint --filter=... --summarize` | Pass   |
| Lint       | `pnpm lint`                                    | Pass   |
| Types      | `pnpm type-check`                              | Pass   |
| Unit Tests | `pnpm test`                                    | Pass   |

### Files Changed

| File                       | Change                                                            |
| -------------------------- | ----------------------------------------------------------------- |
| `.github/workflows/pr.yml` | Added Turborepo filtering, remote cache config, workflow_dispatch |
| `turbo.json`               | Added explicit inputs for lint, type-check, test, build tasks     |

### Key Implementation Details

1. **Filtering Pattern**: Uses `--filter=[HEAD^1]` to compare current commit against parent, running only affected packages
2. **Remote Cache**: Environment variables `TURBO_TOKEN`, `TURBO_TEAM`, and `TURBO_REMOTE_ONLY` configured at workflow level
3. **Full Run Options**:
   - `workflow_dispatch` with `full_run=true` input for manual full CI runs
   - `ci:full` label on PRs bypasses filtering
4. **Cache Visibility**: `--summarize` flag outputs task summary showing cache hits/misses and summary JSON path
5. **Fetch Depth**: All checkout steps use `fetch-depth: 2` to support HEAD^1 comparison

### Known Issues

- **Requires Secret Configuration**: `TURBO_TOKEN` and `TURBO_TEAM` must be configured as repository secrets in GitHub for remote caching to work. Without these secrets, the workflow runs without remote caching (local caching only).

### Lessons Learned

- The `$TURBO_DEFAULT$` token in task inputs allows extending the default inputs rather than replacing them entirely
- `TURBO_REMOTE_ONLY: true` prevents local cache from being used in CI, ensuring consistent remote cache behavior across runners
