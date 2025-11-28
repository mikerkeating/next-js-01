# Epic 1A.5: Basic CI/CD Pipeline

> **To create stories for this epic:** Define the epic scope and acceptance criteria first, then break down into stories following the [story template](../../0-process/references/story-details-template.md). Each story should be independently implementable and testable.

## Context

- **PRD Reference**: [PRD: Technical Requirements](/docs/1-product/1-prd.md#6-technical-requirements)
- **TAD Reference**: [TAD: Infrastructure - CI/CD Approach](/docs/2-technical/2-tad.md#cicd-approach)
- **Phase**: 1A - Foundation & Infrastructure (Days 3-7)
- **Type**: Foundation

## Dependencies

### Requires (Must Complete First)

| Epic | Title                                                                | Reason                                                                                                                           |
| ---- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 1A.3 | [Testing Foundation](../1A.3-testing-foundation/EPIC.md)             | Test execution commands (`turbo run test`, `turbo run test:e2e`), coverage reporting patterns, and E2E smoke test infrastructure |
| 1A.4 | [Documentation Foundation](../1A.4-documentation-foundation/EPIC.md) | Documentation quality checks for CI pipeline, ADR template for pipeline decisions                                                |

### Blocks (Enables These Epics)

| Epic | Title                                                              | What This Provides                                                                                 |
| ---- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| 2A.1 | [Configuration Package](../2A.1-config-package/EPIC.md)            | CI pipeline infrastructure for testing package builds, lint, and type-check                        |
| 2A.2 | [Database Infrastructure](../2A.2-database-infrastructure/EPIC.md) | Pipeline patterns for database migration and testing workflows                                     |
| 5A.1 | [Advanced CI/CD Pipeline](../5A.1-advanced-cicd/EPIC.md)           | Foundation pipeline to extend with security scanning, semantic versioning, and rollback automation |

### Can Run in Parallel With

| Epic | Title | Notes                                                                             |
| ---- | ----- | --------------------------------------------------------------------------------- |
| None | -     | This epic follows the testing and documentation foundations and unblocks Phase 2A |

## Overview

Basic CI/CD Pipeline establishes automated quality gates and deployment workflows for every pull request and merge to the development branch. This epic configures GitHub Actions workflows that leverage Turborepo's filtering capabilities to run only affected checks, integrates preview deployments with Vercel, and ensures all code meets quality standards before merging. The pipeline provides fast feedback loops for developers while maintaining code quality through comprehensive automated checks.

**Key Deliverables:**

- PR workflow: lint, type-check, test, build with Turborepo filtering
- Coverage report posted to PR comments
- Preview deployment URL added to PR with E2E smoke test validation
- All checks required for merge (branch protection)
- Main workflow: full test suite, staging deployment, failure notifications
- Dependabot configured for automated dependency updates
- npm audit integrated for security vulnerability scanning

## Acceptance Criteria

> **Note**: Epic acceptance criteria should be high-level outcomes. Story-level criteria provide the detailed verification.

- [ ] Every PR triggers automated checks (lint, type-check, test, build) and cannot merge until all pass
- [ ] Turborepo filtering ensures only affected packages are checked, reducing CI time by >50% on average
- [ ] Coverage report appears as a PR comment showing percentage and diff from base branch
- [ ] Preview deployment URL is posted to PR within 5 minutes of push, with E2E smoke test results
- [ ] Merging to `development` branch triggers full test suite and staging deployment automatically
- [ ] Build failures on `development` branch send notifications to configured channels (Slack/Discord)
- [ ] Dependabot creates PRs for dependency updates on weekly schedule with security updates prioritised
- [ ] `npm audit` runs on every PR and fails on high/critical vulnerabilities
- [ ] Branch protection rules enforce: required reviews, passing checks, and up-to-date branch
- [ ] CI pipeline completes in <10 minutes for full run, <5 minutes for affected-only run
- [ ] All stories complete and verified
- [ ] Documentation updated

## Stories

| ID  | Title                                                                          | Size | Status | Depends On | Blocks         |
| --- | ------------------------------------------------------------------------------ | ---- | ------ | ---------- | -------------- |
| S1  | [Create PR Workflow with Quality Checks](./S1-pr-workflow.md)                  | M    | ⬜     | -          | S2, S3, S4, S6 |
| S2  | [Configure Turborepo Filtering for CI](./S2-turborepo-filtering.md)            | S    | ⬜     | S1         | S4             |
| S3  | [Add Coverage Reporting to PRs](./S3-coverage-reporting.md)                    | S    | ⬜     | S1         | S4             |
| S4  | [Integrate Preview Deployment and E2E Smoke Tests](./S4-preview-deployment.md) | M    | ⬜     | S1, S2, S3 | S7             |
| S5  | [Create Main Branch Workflow](./S5-main-workflow.md)                           | M    | ⬜     | -          | S6, S7         |
| S6  | [Configure Branch Protection Rules](./S6-branch-protection.md)                 | S    | ⬜     | S1, S5     | S7             |
| S7  | [Set Up Dependabot and Security Scanning](./S7-dependabot-security.md)         | S    | ⬜     | S4, S5, S6 | -              |

**Status Legend**: ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Blocked

## Story Dependency Graph

```
S1 (PR Workflow) ──────────────────┐
 │                                  │
 ├──→ S2 (Turborepo Filtering)      │
 │     ↓                            │
 ├──→ S3 (Coverage Reporting)       │
 │     ↓                            │
 └──→ S4 (Preview + E2E) ←── S2, S3 │
           ↓                        │
           └──→ S7 (Dependabot) ←───┤
                     ↑              │
S5 (Main Workflow) ──┼──→ S6 (Branch Protection)
                     │              ↑
                     └──────────────┘
```

**Parallel Execution Notes:**

- S1 (PR Workflow) and S5 (Main Workflow) can start in parallel as they are independent workflow files
- S2 (Turborepo Filtering) and S3 (Coverage Reporting) can run in parallel after S1 completes
- S4 (Preview + E2E) requires S1, S2, S3 to complete for full integration
- S6 (Branch Protection) requires both workflow types to be tested
- S7 (Dependabot) is the final convergence point requiring all pipeline components in place

## Technical Constraints

### Required Patterns

- **Workflow Triggers**: `pull_request` for PRs, `push` to `development` for main workflow per [TAD: CI/CD Approach](/docs/2-technical/2-tad.md#cicd-approach)
- **Turborepo Caching**: Use Vercel Remote Caching for shared build cache across CI runs per [TAD: Monorepo Structure](/docs/2-technical/2-tad.md#monorepo-structure)
- **Job Parallelisation**: Independent jobs (lint, type-check, test, build) run in parallel per [TAD: PR Workflow](/docs/2-technical/2-tad.md#pull-request-workflow)
- **Fail Fast**: Jobs should fail immediately on first error to provide fast feedback

### Technology Decisions

| Decision            | Choice                                    | Reference                                                                          |
| ------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------- |
| CI Platform         | GitHub Actions                            | [TAD: Infrastructure](/docs/2-technical/2-tad.md#infrastructure)                   |
| Preview Deployments | Vercel (automatic via GitHub integration) | [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md) |
| Dependency Updates  | Dependabot                                | [Roadmap: Epic 1A.5](/docs/1-product/3-roadmap.md#epic-1a5-basic-cicd-pipeline)    |
| Coverage Reporting  | Built-in Vitest coverage + PR comment     | [Epic 1A.3: Testing Foundation](/docs/3-epics/1A.3-testing-foundation/EPIC.md)     |

### Constraints

- **Versions**: Node.js and pnpm versions per [Canonical Versions](/docs/2-technical/references/canonical-versions.md)
- **Timeout Limits**: Individual jobs must complete in <15 minutes; total workflow <30 minutes
- **Secrets Management**: Use GitHub repository secrets for sensitive values (Vercel token, notification webhooks)
- **Concurrency**: Cancel in-progress workflows when new commits pushed to same PR
- **Cache Efficiency**: Turborepo remote cache must be enabled; local cache insufficient for CI
- **Node Version**: Use `.nvmrc` file to ensure consistent Node.js version across CI and local

## Out of Scope

The following items are explicitly NOT part of this epic:

- **OWASP ZAP Security Scanning** - Deferred to Epic 5A.1 (Advanced CI/CD Pipeline)
- **Snyk Vulnerability Scanning** - Deferred to Epic 5A.1; `npm audit` provides basic coverage
- **License Compliance Checking** - Deferred to Epic 5A.1 (Advanced CI/CD Pipeline)
- **Semantic Versioning and Automated Changelog** - Deferred to Epic 5A.1 (Advanced CI/CD Pipeline)
- **Automated Rollback Procedures** - Deferred to Epic 5A.1; manual rollback via Vercel initially
- **Multi-Region Deployment** - Deferred to Epic 5A.2 (Vercel Production Configuration)
- **Load Testing in CI** - Deferred to Epic 4A.1 (Advanced Testing Infrastructure)
- **Visual Regression Testing** - Deferred to Epic 4A.2 (Storybook Enhancement)
- **Production Deployment Pipeline** - Staging only; production release process deferred
- **Deployment Approval Gates** - Automatic deployment to staging; approval gates deferred

## Actions or Decisions Required

> **Note**: Flag decisions that need resolution before or during implementation.

| Decision                           | Options                   | Impact                                  | Status                                     |
| ---------------------------------- | ------------------------- | --------------------------------------- | ------------------------------------------ |
| Notification channel for failures  | Slack vs Discord vs Email | Affects team communication setup        | ⬜ Open                                    |
| Coverage threshold enforcement     | Fail PR vs warning only   | Affects development velocity vs quality | ✅ Resolved: Fail on decrease from base    |
| Dependabot auto-merge scope        | Patch only vs patch+minor | Affects update frequency and risk       | ✅ Resolved: Auto-merge patch updates only |
| E2E test sharding                  | None vs 2-way vs 4-way    | Affects CI time vs complexity           | ⬜ Open                                    |
| Vercel Remote Cache token location | Org secret vs repo secret | Affects multi-repo reuse                | ✅ Resolved: Repo secret initially         |

## Risks and Mitigations

| Risk                                    | Likelihood | Impact   | Mitigation                                                                                     |
| --------------------------------------- | ---------- | -------- | ---------------------------------------------------------------------------------------------- |
| CI times exceed 10-minute target        | Medium     | Medium   | Implement aggressive Turborepo filtering; parallelise jobs; monitor and optimise bottlenecks   |
| Flaky E2E tests block PRs               | High       | High     | Implement retry logic (2x); quarantine flaky tests; invest in test stability from day one      |
| Preview deployment fails silently       | Medium     | Medium   | Add explicit deployment status check step; require E2E smoke test pass before marking PR ready |
| Dependabot creates too many PRs         | Medium     | Low      | Group related dependencies; weekly schedule only; auto-close stale PRs after 7 days            |
| Secrets exposed in CI logs              | Low        | Critical | Use GitHub secrets; mask sensitive values; audit workflow outputs                              |
| Cache misses due to configuration drift | Medium     | Medium   | Pin cache keys to lockfile hash; clear cache on major dependency updates                       |

## Estimated Effort

| Metric          | Value                                |
| --------------- | ------------------------------------ |
| Total Stories   | 7                                    |
| Total Hours     | 28h                                  |
| Calendar Days   | 3-4 days                             |
| Parallel Tracks | 2 (S1-S4 and S5 can run in parallel) |

### Story Breakdown

| Size      | Count | Hours |
| --------- | ----- | ----- |
| XS (1-2h) | 0     | 0h    |
| S (2-4h)  | 4     | 14h   |
| M (4-8h)  | 3     | 14h   |

**Note**: M-sized stories involve configuring complex workflow interactions (PR workflow orchestration, preview deployment integration). S-sized stories are more focused configuration tasks.

## References

### Internal Documentation

- [PRD: Technical Requirements](/docs/1-product/1-prd.md#6-technical-requirements)
- [TAD: Infrastructure - CI/CD Approach](/docs/2-technical/2-tad.md#cicd-approach)
- [TAD: Pull Request Workflow](/docs/2-technical/2-tad.md#pull-request-workflow)
- [TAD: Main Branch Workflow](/docs/2-technical/2-tad.md#main-branch-workflow)
- [Roadmap: Phase 1A](/docs/1-product/3-roadmap.md#phase-1a-foundation--infrastructure-days-3-7)
- [Canonical Versions](/docs/2-technical/references/canonical-versions.md)

### ADRs

- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)
- [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md)

### External Documentation

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Turborepo CI Guide](https://turbo.build/repo/docs/ci)
- [Turborepo Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Vercel Preview Deployments](https://vercel.com/docs/deployments/preview-deployments)
- [Dependabot Configuration](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file)
- [GitHub Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule)

## Status

- **State**: Not Started
- **Started**: -
- **Completed**: -
- **Stories Complete**: 0/7
