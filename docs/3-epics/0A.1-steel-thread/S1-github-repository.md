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
- [ ] GitHub repository exists with `development` as the default and production branch
- [ ] Branch protection rules on `development` require PR before merging
- [ ] Branch protection requires at least 1 approval before merge
- [ ] Branch protection requires status checks to pass (lint, type-check, test, build)
- [ ] Branch protection dismisses stale approvals on new commits
- [ ] Branch protection requires conversation resolution before merge
- [ ] Repository has `.gitignore` configured for Node.js/Next.js projects
- [ ] Repository has `README.md` with basic project information

## Technical Requirements

### Files to Create
| Path | Purpose |
|------|---------|
| `.gitignore` | Git ignore patterns for Node.js/Next.js |
| `README.md` | Project overview and getting started guide |
| `.nvmrc` | Node.js version specification |

### Files to Modify
N/A - This is the initial repository setup

### Dependencies
No package dependencies - this is repository infrastructure setup.

### Configuration Details

| Setting | Requirement | TAD Reference |
|---------|-------------|---------------|
| Default Branch | `development` | [TAD: Branch Protection](/docs/2-technical/2-tad-steel-thread-deployment.md#github-repository-configuration) |
| Branch Protection | Require PR, 1 approval, status checks | [TAD: Branch Protection](/docs/2-technical/2-tad-steel-thread-deployment.md#github-repository-configuration) |
| Node Version | Per `.nvmrc` | [Canonical Versions](/docs/2-technical/references/canonical-versions.md) |

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
- **State**: Not Started
- **PR**: -
- **Completed**: -
