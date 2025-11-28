# Story 1A.5.S7: Set Up Dependabot and Security Scanning

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Basic CI/CD Pipeline](./EPIC.md)
- **Depends On**: [S4](./S4-preview-deployment.md), [S5](./S5-main-workflow.md), [S6](./S6-branch-protection.md)
- **Blocks**: None (final story in epic)
- **Runs in Parallel With**: None

## User Story

**As a** developer
**I want** automated dependency updates via Dependabot and security scanning via pnpm audit
**So that** dependencies stay current, vulnerabilities are identified early, and auto-merged patches won't break the build

## Acceptance Criteria

- [ ] Dependabot creates PRs weekly (Monday 09:00 UTC) with security updates prioritised immediately
- [ ] Related dependencies are grouped (testing, types, linting) to reduce PR volume
- [ ] Auto-merge is enabled for patch-level updates only (after CI passes)
- [ ] `pnpm audit` runs on every PR and fails on high/critical vulnerabilities
- [ ] Stale Dependabot PRs auto-close after 7 days; commit messages follow conventional format

## Technical Requirements

### Files to Create

| Path                                          | Purpose                                        |
| --------------------------------------------- | ---------------------------------------------- |
| `.github/dependabot.yml`                      | Dependabot configuration for automated updates |
| `.github/workflows/dependabot-auto-merge.yml` | Auto-merge workflow for patch updates          |

### Files to Modify

| Path                       | Changes                               |
| -------------------------- | ------------------------------------- |
| `.github/workflows/pr.yml` | Add pnpm audit step to quality checks |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**GitHub Actions:** `dependabot/fetch-metadata@v2`, `gh pr merge` (GitHub CLI). No npm dependencies.

### Configuration Details

| Setting          | Requirement               | Reference                                                     |
| ---------------- | ------------------------- | ------------------------------------------------------------- |
| Update schedule  | Weekly (Monday 09:00 UTC) | Predictable cadence                                           |
| Security updates | Immediate                 | Prioritise security                                           |
| Open PR limit    | 10 maximum                | Prevent overload                                              |
| Auto-merge scope | Patch only                | [EPIC.md: Decisions](./EPIC.md#actions-or-decisions-required) |
| Audit threshold  | high/critical fail        | [TAD: CI/CD](/docs/2-technical/2-tad.md#cicd-approach)        |

## Test Requirements

### Manual Verification

- [ ] **Dependabot PR**: Verify PR created for outdated dependency
- [ ] **Auto-Merge**: Patch update auto-merges after CI passes
- [ ] **Audit Fail**: Add vulnerable dependency, verify PR fails

### Verification Commands

```bash
# Validate YAML syntax
pnpm dlx yaml-lint .github/dependabot.yml

# Run audit locally (same as CI)
pnpm audit --audit-level=high
```

## Implementation Notes

### Key Concepts

- **Dependency Groups**: testing (`vitest`, `playwright`), types (`@types/*`), linting (`eslint*`, `prettier`)
- **Semantic Versioning**: Patch (x.x.N) auto-merged; Minor/Major require review
- **Security vs Version**: Security updates bypass weekly schedule

### Troubleshooting

| Issue              | Cause                        | Solution                             |
| ------------------ | ---------------------------- | ------------------------------------ |
| PRs not appearing  | Config not in default branch | Merge dependabot.yml first           |
| Auto-merge blocked | Branch protection            | Verify Dependabot bypass permissions |

## Estimated Effort

**Size**: S (3h)

## Architecture Decisions

### Consolidated Decisions (reference only)

- [EPIC.md: Auto-merge scope](./EPIC.md#actions-or-decisions-required) - Patch-only resolved
- [TAD: CI/CD Approach](/docs/2-technical/2-tad.md#cicd-approach) - Security scanning in pipeline

### Story-Specific Decisions

#### AD-1A.5.S7.1: Dependency Grouping Strategy

**Scope**: Story-specific

**Decision**: Group by category (testing, types, linting). **Rationale**: Reduces PRs ~20/week to ~5/week.

#### AD-1A.5.S7.2: pnpm Audit vs Snyk

**Scope**: Story-specific

**Decision**: Use `pnpm audit`; defer Snyk to Epic 5A.1. **Rationale**: Built-in, no cost, covers common vulnerabilities.

## Out of Scope

- **Snyk/OWASP ZAP/License compliance** - Deferred to Epic 5A.1
- **Minor/major auto-merge** - Requires manual review
- **GitHub Actions updates** - npm dependencies only

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S4**: Preview Deployment - Full PR pipeline for Dependabot PRs
- **S5**: Main Workflow - Staging deployment after merges
- **S6**: Branch Protection - Auto-merge requires protection

### Enables (Unblocks These Stories)

- None (final story in Epic 1A.5)

## References

- [EPIC.md](./EPIC.md) | [TAD: CI/CD](/docs/2-technical/2-tad.md#cicd-approach) | [Dependabot Docs](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file)

## Verification Checklist

- [ ] **Pre-req**: S4, S5, S6 completed; GitHub admin access
- [ ] **Quality**: Acceptance criteria met; Dependabot PRs appearing; audit running; auto-merge working
- [ ] **Git**: Conventional commit, PR description complete

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
