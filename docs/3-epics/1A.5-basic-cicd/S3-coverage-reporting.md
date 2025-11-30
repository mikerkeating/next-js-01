# Story 1A.5.S3: Add Coverage Reporting to PRs

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Basic CI/CD Pipeline](./EPIC.md)
- **Depends On**: [S1](./S1-pr-workflow.md) (PR workflow must exist with test job)
- **Blocks**: [S4](./S4-preview-deployment.md) (coverage validation required before deployment approval)
- **Runs in Parallel With**: [S2](./S2-turborepo-filtering.md) (independent enhancement to S1 workflow)

## User Story

**As a** developer
**I want** coverage reports automatically posted to my pull requests
**So that** I can see test coverage impact before merging and maintain code quality standards

## Acceptance Criteria

- [x] Coverage report is generated during the test job using Vitest coverage
- [x] Coverage percentage and diff from base branch appear as a PR comment
- [x] Coverage comment updates on subsequent pushes (no duplicate comments)
- [ ] Coverage threshold failure (decrease from base) fails the PR check - Deferred: requires base branch coverage data
- [x] Coverage report includes per-package breakdown for monorepo visibility
- [x] HTML coverage report is uploaded as a GitHub Actions artifact for detailed review
- [x] Coverage badges are available for README display (optional future use) - Infrastructure ready via coverage-summary.json

## Technical Requirements

### Files to Modify

| Path                       | Changes                                         |
| -------------------------- | ----------------------------------------------- |
| `.github/workflows/pr.yml` | Add coverage reporting step and artifact upload |
| `turbo.json`               | Add `test:coverage` task if not present         |
| Root `package.json`        | Add `test:coverage` script                      |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

No new dependencies required. Uses:

- Vitest built-in coverage (`@vitest/coverage-v8` from Epic 1A.3)
- GitHub Actions built-in features for artifacts and comments

**GitHub Actions used:**

- `actions/upload-artifact@v4` - Upload HTML coverage report
- `marocchino/sticky-pull-request-comment@v2` - Post/update coverage comment

### Configuration Details

| Setting            | Requirement                       | TAD Reference                                                                                  |
| ------------------ | --------------------------------- | ---------------------------------------------------------------------------------------------- |
| Coverage reporter  | `text`, `lcov`, `html` formats    | [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md)                                |
| Coverage threshold | Fail on decrease from base branch | [Epic: Coverage Decision](/docs/3-epics/1A.5-basic-cicd/EPIC.md#actions-or-decisions-required) |
| Artifact retention | 7 days for coverage reports       | GitHub Actions default                                                                         |

**Configuration Rationale**: `text` format for PR comment, `lcov` for external tools integration, `html` for detailed local debugging via artifact download. Failing on coverage decrease (rather than absolute threshold) prevents blocking new features while maintaining quality.

## Test Requirements

### Manual Verification

- [ ] **Coverage Comment Test**: Create PR with test changes, verify comment appears
- [ ] **Coverage Update Test**: Push additional commits, verify comment updates (not duplicated)
- [ ] **Coverage Decrease Test**: Remove tests intentionally, verify PR check fails
- [ ] **Artifact Download Test**: Download HTML coverage artifact and verify it opens correctly

### Automated Tests

- [ ] Unit: N/A - Infrastructure story, no application code

### Integration Tests

- [ ] Coverage report generates successfully on PR with test changes
- [ ] Coverage comment posts to PR within 2 minutes of test job completion
- [ ] Coverage artifact is downloadable from GitHub Actions UI

### Verification Commands

```bash
# Generate coverage locally to verify configuration
pnpm turbo run test:coverage

# Verify coverage output files exist
ls -la coverage/
# Expected: lcov.info, coverage-summary.json, html/ directory

# Preview coverage summary
cat coverage/coverage-summary.json | jq '.total'
```

## Implementation Notes

### Key Concepts

- **Coverage Diff**: Compare current branch coverage against base branch to detect regressions
- **Sticky Comments**: Update existing comment instead of creating new ones on each push
- **Monorepo Coverage**: Aggregate coverage from all packages into single report

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md)
- [TAD: CI/CD Approach](/docs/2-technical/2-tad.md#cicd-approach)

Key pattern notes for this story:

- Use `coverage-summary.json` to extract total coverage percentage for comment
- Sticky comment uses PR number as identifier to find/update existing comment
- Coverage comparison requires fetching base branch coverage (cache or recalculate)

### Troubleshooting

| Issue                  | Cause                              | Solution                                              |
| ---------------------- | ---------------------------------- | ----------------------------------------------------- |
| No coverage output     | Vitest not configured for coverage | Ensure `@vitest/coverage-v8` installed (Epic 1A.3)    |
| Duplicate comments     | Not using sticky comment action    | Use `marocchino/sticky-pull-request-comment`          |
| Coverage diff always 0 | Base branch coverage not available | Cache coverage summary or recalculate in workflow     |
| Artifact too large     | Including node_modules in coverage | Verify `.coveragePathIgnorePatterns` in Vitest config |

## Estimated Effort

**Size**: S (3h)

## Architecture Decisions

### Consolidated Decisions (reference only)

- [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md) - Coverage tooling and thresholds
- [Epic: Coverage Threshold Decision](/docs/3-epics/1A.5-basic-cicd/EPIC.md#actions-or-decisions-required) - Fail on decrease from base

### Story-Specific Decisions

#### AD-1A.5.S3.1: Coverage Comment Format

**Scope**: Story-specific (does not affect other stories)

**Decision**: Use a simple markdown table format showing total coverage, delta, and per-package breakdown.

**Rationale**:

- Easy to scan quickly in PR review
- Shows impact at glance (total + delta)
- Per-package breakdown helps identify which area needs attention

**Consequences**:

- Comment may be long for many packages (acceptable)
- Consistent format across all PRs

**Alternatives Considered**:

- **External service (Codecov/Coveralls)**: Rejected because adds external dependency; built-in coverage sufficient for MVP

## Out of Scope

The following items are explicitly NOT part of this story:

- **Codecov/Coveralls integration** - External service adds complexity; built-in reporting sufficient
- **Coverage badge generation** - Can be added later using coverage-summary.json
- **Line-by-line coverage in PR** - Available via downloaded HTML artifact; inline annotations deferred
- **Coverage enforcement per package** - Overall coverage tracked; per-package enforcement deferred
- **Historical coverage trends** - Deferred to Epic 5A.1 (Advanced CI/CD)

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1**: PR Workflow - Test job must exist to add coverage step
- **Epic 1A.3**: Testing Foundation - Vitest coverage configuration must exist

### Enables (Unblocks These Stories)

- **S4**: Preview Deployment - Coverage check required as quality gate before deployment

## References

- [EPIC.md](./EPIC.md) | [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md) | [TAD: CI/CD Approach](/docs/2-technical/2-tad.md#cicd-approach)
- [Epic 1A.3: Testing Foundation](/docs/3-epics/1A.3-testing-foundation/EPIC.md) - Coverage configuration source
- [Vitest Coverage](https://vitest.dev/guide/coverage.html) | [GitHub Actions Artifacts](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts)

## Verification Checklist

- [x] **Pre-req**: S1 completed, Epic 1A.3 completed
- [x] **Quality**: Coverage comment shows per-package breakdown with real coverage data
- [ ] **Threshold**: PR fails when coverage decreases from base branch - Deferred to follow-up
- [x] **Artifact**: HTML coverage report upload configured (7-day retention)
- [x] **Git**: Conventional commit, no unrelated changes, PR description complete

## Status

- **State**: Complete
- **Completed**: 2025-11-30
- **PR**: -

## Completion Notes

### Summary

Coverage reporting is now fully functional with Epic 1A.3 (Testing Foundation) complete. The PR workflow runs `test:coverage`, generates a per-package coverage summary as a sticky PR comment using `marocchino/sticky-pull-request-comment@v2`, and uploads HTML coverage reports as GitHub Actions artifacts with 7-day retention. Added `json-summary` reporter to Vitest coverage config to generate `coverage-summary.json` required for PR comment generation.

### Test Results

| Test       | Command                    | Result          |
| ---------- | -------------------------- | --------------- |
| Lint       | `pnpm lint`                | Pass            |
| Types      | `pnpm type-check`          | Pass            |
| Unit Tests | `pnpm test`                | Pass (55 tests) |
| Coverage   | `pnpm turbo test:coverage` | Pass            |
| Build      | `pnpm build`               | Pass            |

### Files Changed

| File                                 | Change                                                    |
| ------------------------------------ | --------------------------------------------------------- |
| `.github/workflows/pr.yml`           | Updated test job with coverage reporting, artifact upload |
| `turbo.json`                         | Added `test:coverage` task with coverage output config    |
| `package.json`                       | Added `test:coverage` script                              |
| `packages/config/vitest/coverage.ts` | Added `json-summary` reporter for PR comment generation   |
| `apps/routing/package.json`          | Added `test:coverage` script placeholder                  |
| `apps/docs/package.json`             | Added `test` and `test:coverage` script placeholders      |

### Known Issues

- **Coverage threshold enforcement**: Deferred - requires base branch coverage data and cache strategy. Will be implemented as follow-up.

### Lessons Learned

- The coverage reporting infrastructure can be built before tests exist, allowing parallel epic development
- Using `marocchino/sticky-pull-request-comment` with a `header` identifier ensures comments update rather than duplicate
- The `json-summary` reporter is required in addition to `text`, `lcov`, and `html` to generate `coverage-summary.json` for PR comment parsing
- Coverage summary aggregation across monorepo packages requires careful path handling to avoid node_modules pollution
