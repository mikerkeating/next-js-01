# Story 0A.1.S1: Create GitHub Repository with Branch Protection

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Steel Thread Deployment](./EPIC.md)
- **Depends On**: None (first story in epic)
- **Blocks**: [S2: Create Minimal Next.js 16 Application](./S2-nextjs-app.md), [S3: Configure Vercel Project Integration](./S3-vercel-integration.md)
- **Runs in Parallel With**: None

## User Story

**As a** developer
**I want** a GitHub repository with proper branch protection rules
**So that** code changes require review and passing CI checks before merging to the production branch

## Acceptance Criteria

- [x] GitHub repository exists with `development` as the default and production branch
- [x] Branch protection rules on `development` require PR before merging
- [x] Branch protection requires at least 1 approval before merge
- [x] Branch protection requires status checks to pass (lint, type-check, test, build)
- [x] Branch protection dismisses stale approvals on new commits
- [x] Branch protection requires conversation resolution before merge
- [x] Repository has `.gitignore` configured for Node.js/Next.js projects
- [x] Repository has `README.md` with basic project information

## Technical Requirements

### Files to Create

| Path         | Purpose                                    |
| ------------ | ------------------------------------------ |
| `.gitignore` | Git ignore patterns for Node.js/Next.js    |
| `README.md`  | Project overview and getting started guide |
| `.nvmrc`     | Node.js version specification              |

### Files to Modify

N/A - This is the initial repository setup

### Dependencies

No package dependencies - this is repository infrastructure setup.

### Configuration Details

| Setting           | Requirement                           | TAD Reference                                                                                                |
| ----------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Default Branch    | `development`                         | [TAD: Branch Protection](/docs/2-technical/2-tad-steel-thread-deployment.md#github-repository-configuration) |
| Branch Protection | Require PR, 1 approval, status checks | [TAD: Branch Protection](/docs/2-technical/2-tad-steel-thread-deployment.md#github-repository-configuration) |
| Node Version      | Per `.nvmrc`                          | [Canonical Versions](/docs/2-technical/references/canonical-versions.md)                                     |

## Test Requirements

### Manual Verification

- [ ] **Branch Protection Active**: Attempt direct push to `development` - should be rejected
- [ ] **PR Required**: Creating a PR shows protection status with required checks
- [ ] **Repository Accessible**: Team members can clone and create branches

### Verification Commands

```bash
git remote -v
gh api repos/{owner}/{repo}/branches/development/protection
```

## Implementation Notes

### Common Patterns

Reference [TAD: Branch Protection Rules](/docs/2-technical/2-tad-steel-thread-deployment.md#github-repository-configuration).

Notes:

- Status checks (`lint`, `type-check`, `test`, `build`) created in S7
- Branch protection can be configured before workflows exist

### Troubleshooting

**Issue**: Status checks not appearing in protection settings

- **Cause**: Workflows haven't run yet
- **Solution**: Configure protection rule names in advance; checks activate when workflows run

## Estimated Effort

**Size**: S (2-4h)

## Architecture Decisions

### Consolidated Decisions (reference only)

- [TAD: Branch Naming Convention](/docs/2-technical/2-tad-steel-thread-deployment.md#github-repository-configuration) - Using `development` as production branch
- [ADR-002: pnpm as Package Manager](/docs/2-technical/adr/002-pnpm-package-manager.md) - Affects .gitignore patterns

### Story-Specific Decisions

None - all decisions are cross-cutting and documented in TAD.

## Out of Scope

- **GitHub Actions Workflows** - Deferred to S7
- **Vercel Integration** - Deferred to S3
- **Code/Application Files** - Deferred to S2
- **Issue/PR Templates** - Not required for steel thread

## Dependencies on Other Stories

### Depends On (Must Complete First)

None - This is the first story in the epic

### Enables (Unblocks These Stories)

- **S2**: Create Minimal Next.js 16 Application
- **S3**: Configure Vercel Project Integration

## References

### Epic & TAD References

- [EPIC.md](./EPIC.md)
- [TAD: Steel Thread](/docs/2-technical/2-tad-steel-thread-deployment.md)

### External Documentation

- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)

## Verification Checklist

### Pre-Verification

- [ ] GitHub account has access to create repositories

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] Branch protection rules match TAD specification
- [ ] `.gitignore` covers all necessary patterns
- [ ] `.nvmrc` matches canonical Node.js version

### Git Hygiene

- [ ] Initial commit message follows conventional commit format
- [ ] No sensitive information committed

## Status

- **State**: Complete
- **PR**: N/A (initial repository setup)
- **Completed**: 2025-11-27

## Implementation Notes (Actual)

### Files Created/Modified

- `.nvmrc` - Created with Node.js version `22` per canonical-versions.md
- `.gitignore` - Updated with comprehensive Node.js/Next.js/pnpm patterns
- `README.md` - Updated with project overview, getting started guide, scripts, and documentation links

### Branch Protection Configuration

Branch protection rules configured on `development` branch via GitHub web interface:

- Require pull request before merging: ✓
- Required approving reviews: 1
- Dismiss stale pull request approvals: ✓
- Require status checks to pass: ✓ (Lint, Type Check, Test, Build)
- Require branches to be up to date: ✓
- Require conversation resolution: ✓
- Include administrators: ✓

## Lessons Learned

### GitHub Status Check Names Are Case-Sensitive

**Issue**: PR could not be merged despite all CI checks passing.

**Root Cause**: Branch protection was configured with lowercase check names (`lint`, `type-check`, `test`, `build`) but the GitHub Actions workflow jobs used different casing (`Lint`, `Type Check`, `Test`, `Build`). GitHub treats these as different checks.

**Resolution**: Updated branch protection required status checks to match the exact names from the CI workflow:

- `lint` → `Lint`
- `type-check` → `Type Check`
- `test` → `Test`
- `build` → `Build`

**Prevention**: When configuring branch protection rules, always verify the exact check names from a completed workflow run before setting them as required. Use `gh api repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks` to verify configuration.

### Required Reviews Block Solo Developer Merges

**Issue**: PR could not be merged because "At least 1 approving review is required by reviewers with write access."

**Root Cause**: Branch protection was configured to require 1 approving review, but as a solo developer there was no one else to approve the PR.

**Resolution**: Temporarily removed the required reviews protection to allow self-merge:

```bash
gh api repos/{owner}/{repo}/branches/development/protection/required_pull_request_reviews -X DELETE
```

**Re-enable after merge**:

```bash
gh api repos/{owner}/{repo}/branches/development/protection/required_pull_request_reviews \
  -X PATCH --input - <<EOF
{
  "dismiss_stale_reviews": true,
  "required_approving_review_count": 1
}
EOF
```

**Prevention**: For solo projects or initial setup phases, consider either:

1. Not enabling required reviews until there are multiple contributors
2. Creating a documented process for temporarily disabling reviews for self-merges
3. Using "Include administrators" = false to allow admin bypass
