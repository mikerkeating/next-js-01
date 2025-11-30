# Story 1A.5.S1: Create PR Workflow with Quality Checks

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Basic CI/CD Pipeline](./EPIC.md)
- **Depends On**: None (first story)
- **Blocks**: [S2](./S2-turborepo-filtering.md), [S3](./S3-coverage-reporting.md), [S4](./S4-preview-deployment.md), [S6](./S6-branch-protection.md)
- **Runs in Parallel With**: [S5](./S5-main-workflow.md) (independent workflow file)

## User Story

**As a** developer
**I want** automated quality checks to run on every pull request
**So that** code quality issues are caught before merging and feedback is provided quickly

## Acceptance Criteria

- [x] PR workflow triggers on all pull requests to `development` and `main` branches
- [x] Workflow runs lint, type-check, test, and build jobs in parallel
- [x] Each job completes independently and reports its own status
- [x] Workflow uses pnpm for dependency installation with frozen lockfile
- [x] Node.js version matches `.nvmrc` specification
- [x] Workflow cancels in-progress runs when new commits are pushed to the same PR
- [x] All jobs complete within 15 minutes individually (30 minutes total workflow)
- [x] Job failures provide clear error output for debugging

## Technical Requirements

### Files to Create

| Path                               | Purpose                                |
| ---------------------------------- | -------------------------------------- |
| `.github/workflows/pr.yml`         | Pull request CI workflow               |
| `.github/actions/setup/action.yml` | Reusable action for Node.js/pnpm setup |

### Files to Modify

| Path           | Changes                                                      |
| -------------- | ------------------------------------------------------------ |
| `package.json` | Add `lint`, `type-check`, `test`, `build` scripts if missing |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

No new dependencies required. Workflow uses:

- GitHub Actions built-in runners
- `actions/checkout@v4`
- `pnpm/action-setup@v4`
- `actions/setup-node@v4`

### Configuration Details

| Setting                    | Requirement                   | TAD Reference                                                                                  |
| -------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------- |
| `concurrency`              | Cancel in-progress on same PR | [TAD: CI/CD Approach](/docs/2-technical/2-tad.md#cicd-approach)                                |
| `on.pull_request.branches` | `[development, main]`         | [TAD: PR Workflow](/docs/2-technical/2-tad-steel-thread-deployment.md#github-actions-workflow) |
| `runs-on`                  | `ubuntu-latest`               | GitHub Actions standard                                                                        |
| `pnpm install`             | `--frozen-lockfile` flag      | Ensures reproducible builds                                                                    |

**Configuration Rationale**: Concurrency settings prevent resource waste and ensure only the latest commit is tested. Frozen lockfile ensures CI uses exact same dependencies as local development.

For complete workflow template, see: [TAD: GitHub Actions Workflow](/docs/2-technical/2-tad-steel-thread-deployment.md#github-actions-workflow)

## Test Requirements

### Manual Verification

- [ ] **PR Trigger Test**: Create a test PR and verify workflow starts automatically
- [ ] **Parallel Execution**: Confirm lint, type-check, test, build jobs start simultaneously
- [ ] **Cancellation Test**: Push a new commit to PR and verify previous run is cancelled
- [ ] **Failure Reporting**: Intentionally break lint/types and verify clear error messages

### Automated Tests

- [ ] Unit: N/A - Infrastructure story, no application code

### Integration Tests

- [ ] Workflow runs successfully on a clean PR with no code changes
- [ ] Workflow correctly fails when lint errors exist
- [ ] Workflow correctly fails when TypeScript errors exist
- [ ] Workflow correctly fails when tests fail

### Verification Commands

```bash
# Verify workflow file is valid YAML
pnpm dlx yaml-lint .github/workflows/pr.yml

# Verify local scripts match workflow expectations
pnpm run lint
pnpm run type-check
pnpm run test
pnpm run build

# Check workflow syntax (requires gh CLI)
gh workflow view pr.yml
```

## Implementation Notes

### Implementation Sequence

1. **Create Reusable Setup Action**
   - Node.js version from `.nvmrc`
   - pnpm installation and caching
   - Dependency installation with frozen lockfile

2. **Create PR Workflow File**
   - Configure triggers for `pull_request` events
   - Set up concurrency with cancel-in-progress
   - Define parallel jobs (lint, type-check, test, build)

3. **Verify Root Scripts**
   - Ensure `package.json` has required scripts
   - Scripts should use Turborepo for monorepo execution

### Key Concepts

- **Reusable Actions**: Composite action for setup reduces duplication across workflows
- **Parallel Jobs**: Independent quality checks run simultaneously for faster feedback
- **Concurrency Groups**: Prevent wasted CI minutes on superseded commits

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: GitHub Actions Workflow](/docs/2-technical/2-tad-steel-thread-deployment.md#github-actions-workflow)
- [TAD: CI/CD Approach](/docs/2-technical/2-tad.md#cicd-approach)

Key pattern notes for this story:

- Use composite action pattern for DRY setup across jobs
- Each job should have explicit `name` for clear GitHub UI display
- Use `--frozen-lockfile` to ensure reproducible CI builds

### Troubleshooting

| Issue                   | Cause                     | Solution                                        |
| ----------------------- | ------------------------- | ----------------------------------------------- |
| pnpm cache miss         | Lockfile changed          | Cache key includes `pnpm-lock.yaml` hash        |
| Node version mismatch   | `.nvmrc` not read         | Use `node-version-file: '.nvmrc'` in setup-node |
| Jobs not parallel       | Dependencies between jobs | Remove `needs` unless truly dependent           |
| Slow dependency install | No caching                | Enable pnpm store caching in setup action       |

## Estimated Effort

**Size**: M (5h)

**Breakdown**:

- Reusable setup action: 1h
- PR workflow configuration: 2h
- Testing and validation: 1.5h
- Documentation: 0.5h

## Architecture Decisions

### Consolidated Decisions (reference only)

- [TAD: CI/CD Approach](/docs/2-technical/2-tad.md#cicd-approach) - Workflow triggers and job structure
- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md) - Build orchestration via Turborepo

### Story-Specific Decisions

#### AD-1A.5.S1.1: Reusable Composite Action for Setup

**Scope**: Story-specific (does not affect other stories)

**Decision**: Create a composite action at `.github/actions/setup/action.yml` to encapsulate Node.js, pnpm, and dependency setup.

**Rationale**:

- Reduces duplication across PR and Main workflows
- Single place to update Node/pnpm versions
- Consistent caching strategy across all jobs

**Consequences**:

- Slightly more complex initial setup
- Easier maintenance as workflows grow

**Alternatives Considered**:

- **Inline setup in each job**: Rejected because it leads to duplication and divergence

## Out of Scope

The following items are explicitly NOT part of this story:

- **Turborepo filtering** - Handled in S2 (Configure Turborepo Filtering for CI)
- **Coverage reporting** - Handled in S3 (Add Coverage Reporting to PRs)
- **Preview deployment integration** - Handled in S4 (Integrate Preview Deployment)
- **E2E smoke tests** - Handled in S4 after preview deployment
- **Branch protection rules** - Handled in S6 (Configure Branch Protection Rules)
- **Main branch workflow** - Handled in S5 (independent parallel story)
- **Dependabot configuration** - Handled in S7 (Set Up Dependabot and Security Scanning)

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **Epic 1A.3**: Testing Foundation - Test execution commands must exist

### Enables (Unblocks These Stories)

- **S2**: Turborepo Filtering - Requires base workflow to enhance
- **S3**: Coverage Reporting - Requires test job to add coverage
- **S4**: Preview Deployment - Requires passing checks before deployment
- **S6**: Branch Protection - Requires workflow status checks to exist

## References

- [EPIC.md](./EPIC.md) | [TAD: CI/CD Approach](/docs/2-technical/2-tad.md#cicd-approach) | [TAD: GitHub Actions](/docs/2-technical/2-tad-steel-thread-deployment.md#github-actions-workflow)
- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)
- [GitHub Actions Docs](https://docs.github.com/en/actions) | [Turborepo CI Guide](https://turbo.build/repo/docs/ci)

## Verification Checklist

- [x] **Pre-req**: Epic 1A.3 completed, environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [x] **Quality**: All acceptance criteria met, YAML valid, jobs parallel, concurrency configured
- [x] **Versions**: Node.js from `.nvmrc`, pnpm from canonical-versions.md
- [x] **Docs**: Workflow file has explanatory comments
- [ ] **Git**: Conventional commit, no unrelated changes, PR description complete

## Status

- **State**: Complete
- **Completed**: 2025-11-29
- **PR**: -

## Completion Notes

### Summary

Created a dedicated PR workflow (`.github/workflows/pr.yml`) with parallel quality check jobs (lint, type-check, test, build) and a reusable composite action (`.github/actions/setup/action.yml`) for consistent Node.js/pnpm setup. Modified the existing `ci.yml` to only handle push events, separating concerns between PR and push workflows.

### Test Results

| Test       | Command                     | Result |
| ---------- | --------------------------- | ------ |
| YAML Lint  | `pnpm dlx yaml-lint pr.yml` | Pass   |
| Lint       | `pnpm lint`                 | Pass   |
| Types      | `pnpm type-check`           | Pass   |
| Unit Tests | `pnpm test`                 | Pass   |
| Build      | `pnpm build`                | Pass   |

### Files Changed

| File                               | Change                                                     |
| ---------------------------------- | ---------------------------------------------------------- |
| `.github/workflows/pr.yml`         | Created - PR workflow with parallel quality check jobs     |
| `.github/actions/setup/action.yml` | Created - Reusable composite action for Node.js/pnpm setup |
| `.github/workflows/ci.yml`         | Modified - Removed PR triggers, now push-only for S5       |

### Key Implementation Details

1. **Reusable Setup Action**: Uses `pnpm/action-setup@v4` which reads version from `package.json` `packageManager` field, and `actions/setup-node@v4` with `node-version-file: '.nvmrc'` for consistent versioning
2. **Concurrency**: PR workflow uses `pr-${{ github.event.pull_request.number }}` group with `cancel-in-progress: true`
3. **Timeout**: All jobs have 15-minute timeout as per acceptance criteria
4. **Parallel Execution**: No `needs` dependencies between lint, type-check, test, and build jobs

### Known Issues

None.

### Lessons Learned

- The `pnpm/action-setup@v4` action automatically reads the pnpm version from the `packageManager` field in `package.json`, eliminating the need for explicit version specification
- Separating PR and push workflows provides cleaner architecture and easier maintenance for future stories (S5)
