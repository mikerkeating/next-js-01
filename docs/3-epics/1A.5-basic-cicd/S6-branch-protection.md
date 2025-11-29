# Story 1A.5.S6: Configure Branch Protection Rules

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Basic CI/CD Pipeline](./EPIC.md)
- **Depends On**: [S1](./S1-pr-workflow.md), [S5](./S5-main-workflow.md)
- **Blocks**: [S7](./S7-dependabot-security.md)
- **Runs in Parallel With**: None

## User Story

**As a** repository maintainer
**I want** branch protection rules configured for development and main branches
**So that** code quality is enforced through required reviews and passing checks before any merge

## Acceptance Criteria

- [ ] `development` branch requires at least 1 approval before merging
- [ ] `development` branch requires all status checks to pass (lint, type-check, test, build)
- [ ] `development` branch requires branches to be up to date before merging
- [ ] `development` branch dismisses stale approvals when new commits are pushed
- [ ] `main` branch has equivalent protection rules
- [ ] Administrators are NOT exempt from protection rules
- [ ] Direct pushes, force pushes, and branch deletion are blocked on protected branches

## Technical Requirements

### Files to Create

| Path                           | Purpose                                          |
| ------------------------------ | ------------------------------------------------ |
| `.github/branch-protection.md` | Documentation of branch protection configuration |

### Files to Modify

N/A - Branch protection is configured via GitHub repository settings.

### Dependencies

No npm dependencies required. Configuration via GitHub UI or `gh` CLI.

### Configuration Details

| Setting                 | Value                                 | TAD Reference                                                                                        |
| ----------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Required approvals      | 1                                     | [TAD: Branch Protection](/docs/2-technical/2-tad-steel-thread-deployment.md#branch-protection-rules) |
| Required status checks  | `lint`, `type-check`, `test`, `build` | [TAD: PR Workflow](/docs/2-technical/2-tad.md#pull-request-workflow)                                 |
| Dismiss stale approvals | Enabled                               | Ensures re-review after changes                                                                      |
| Require up to date      | Enabled                               | Prevents merge conflicts                                                                             |
| Include administrators  | Enabled                               | No bypassing rules                                                                                   |

For complete settings, see: [TAD: Branch Protection Rules](/docs/2-technical/2-tad-steel-thread-deployment.md#branch-protection-rules)

## Test Requirements

### Manual Verification

- [ ] **Block Direct Push**: Verify `git push origin development` is rejected
- [ ] **Require Approval**: PR without approval has merge blocked
- [ ] **Require Checks**: PR with failing check has merge blocked
- [ ] **Stale Approval**: New commit after approval dismisses the approval

### Verification Commands

```bash
# Verify branch protection via GitHub CLI
gh api repos/{owner}/{repo}/branches/development/protection

# Verify required status checks
gh api repos/{owner}/{repo}/branches/development/protection/required_status_checks

# Attempt blocked operations (should fail)
git push --force origin development
```

## Implementation Notes

### Implementation Sequence

1. **Configure Development Branch Protection**
   - Settings → Branches → Add rule for `development`
   - Enable required approvals, status checks, dismiss stale approvals, up-to-date requirement

2. **Configure Main Branch Protection**
   - Add rule for `main` with equivalent settings

3. **Select Required Status Checks**
   - Wait for workflow to run once; select `lint`, `type-check`, `test`, `build`

4. **Document Configuration**
   - Create `.github/branch-protection.md` documenting settings

### Troubleshooting

| Issue                | Cause               | Solution                           |
| -------------------- | ------------------- | ---------------------------------- |
| Checks not appearing | Workflow never ran  | Run a PR workflow first            |
| Check name mismatch  | Job name differs    | Verify job `name` in workflow YAML |
| Admin can bypass     | Setting not enabled | Re-enable "Include administrators" |

## Estimated Effort

**Size**: S (3h)

## Architecture Decisions

### Consolidated Decisions (reference only)

- [TAD: Branch Protection Rules](/docs/2-technical/2-tad-steel-thread-deployment.md#branch-protection-rules) - Settings specification

### Story-Specific Decisions

#### AD-1A.5.S6.1: Include Administrators in Protection

**Scope**: Story-specific

**Decision**: Enable "Include administrators" for all branch protection rules.

**Rationale**: Prevents accidental bypasses; maintains audit trail for all changes.

**Alternatives Considered**: Exclude administrators - Rejected to prevent bypass path.

## Out of Scope

- **CODEOWNERS file** - Optional enhancement for later
- **Signed commits requirement** - Adds friction; deferred
- **Deployment protection rules** - Handled by Vercel

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1**: PR Workflow - Status checks must exist
- **S5**: Main Workflow - Status checks for main branch

### Enables (Unblocks These Stories)

- **S7**: Dependabot Security - Needs branch protection for auto-merge

## References

- [EPIC.md](./EPIC.md) | [TAD: Branch Protection](/docs/2-technical/2-tad-steel-thread-deployment.md#branch-protection-rules)
- [GitHub Branch Protection Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule)

## Verification Checklist

- [ ] **Pre-req**: S1 and S5 completed; workflows have run; GitHub admin access available
- [ ] **Quality**: All acceptance criteria met; protection verified via failed push attempts
- [ ] **Docs**: `.github/branch-protection.md` created
- [ ] **Git**: Conventional commit, PR description complete

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
