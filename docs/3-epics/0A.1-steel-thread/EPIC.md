# Epic 0A.1: Steel Thread Deployment

> **To create stories for this epic:** Define the epic scope and acceptance criteria first, then break down into stories following the [story template](../../0-process/references/story-details-template.md). Each story should be independently implementable and testable.

## Context

- **PRD Reference**: [PRD: Feature M.5 Content API & Data Layer](/docs/1-product/1-prd.md#feature-m5-content-api--data-layer) (foundation for API)
- **TAD Reference**: [TAD: Steel Thread & Deployment Pipeline](/docs/2-technical/2-tad.md#steel-thread--deployment-pipeline)
- **Phase**: 0A - Steel Thread (Day 1-2)
- **Type**: Foundation

## Dependencies

### Requires (Must Complete First)

| Epic | Title | Reason                                          |
| ---- | ----- | ----------------------------------------------- |
| -    | None  | This is the foundational epic; no prerequisites |

### Blocks (Enables These Epics)

| Epic | Title                                                                    | What This Provides                                                     |
| ---- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| 1A.1 | [Monorepo Foundation](../1A.1-monorepo-foundation/EPIC.md)               | Deployed Next.js app with CI/CD pipeline ready for monorepo conversion |
| 1A.2 | [Package Management & Quality Gates](../1A.2-package-management/EPIC.md) | GitHub repository with branch protection and Vercel integration        |
| 1A.5 | [Basic CI/CD Pipeline](../1A.5-basic-cicd/EPIC.md)                       | Base GitHub Actions workflow to extend                                 |

### Can Run in Parallel With

| Epic | Title | Notes                                            |
| ---- | ----- | ------------------------------------------------ |
| -    | None  | This is the initial epic and must complete first |

## Overview

The Steel Thread establishes working end-to-end deployment infrastructure from Day 1, proving that code can flow from developer laptop to production in an automated, repeatable manner. This foundational epic creates the skeleton upon which all subsequent development is built.

**Key Deliverables:**

- Minimal Next.js 16 application with health check endpoint
- GitHub repository with branch protection rules
- Vercel project with auto-deploy from `development` branch
- Preview deployments on PR creation
- SSL certificates auto-provisioned
- Playwright smoke tests validating deployment
- README documenting deployment process

## Acceptance Criteria

> **Note**: Epic acceptance criteria should be high-level outcomes. Story-level criteria provide the detailed verification.

- [ ] Pushing to `development` branch triggers automatic deployment to production URL
- [ ] Creating a PR generates a unique preview deployment URL within 2 minutes
- [ ] Health endpoint (`/api/health`) returns 200 OK with status "healthy"
- [ ] All PRs require passing CI checks (lint, type-check, test, build) before merge
- [ ] SSL certificate is automatically provisioned and valid for custom domain
- [ ] Playwright smoke test suite validates health endpoint and homepage load
- [ ] README documents complete deployment process from clone to production
- [ ] All stories complete and verified
- [ ] Documentation updated

## Stories

| ID  | Title                                                                        | Size | Status | Depends On | Blocks |
| --- | ---------------------------------------------------------------------------- | ---- | ------ | ---------- | ------ |
| S1  | [Create GitHub Repository with Branch Protection](./S1-github-repository.md) | S    | ⬜     | -          | S2, S3 |
| S2  | [Create Minimal Next.js 16 Application](./S2-nextjs-app.md)                  | M    | ⬜     | S1         | S3, S4 |
| S3  | [Configure Vercel Project Integration](./S3-vercel-integration.md)           | S    | ⬜     | S1         | S4, S5 |
| S4  | [Implement Health Check Endpoint](./S4-health-endpoint.md)                   | S    | ⬜     | S2, S3     | S6     |
| S5  | [Configure Environment Variables](./S5-environment-variables.md)             | S    | ⬜     | S3         | S4, S6 |
| S6  | [Create Playwright Smoke Test Suite](./S6-smoke-tests.md)                    | M    | ⬜     | S4, S5     | S7     |
| S7  | [Setup GitHub Actions CI Workflow](./S7-github-actions.md)                   | M    | ⬜     | S6         | S8     |
| S8  | [Document Deployment Process](./S8-documentation.md)                         | S    | ⬜     | S7         | -      |
| S9  | [Add Basic Auth Middleware](./S9-basic-auth-middleware.md)                   | S    | ⬜     | S2, S5     | -      |

**Status Legend**: ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Blocked

## Story Dependency Graph

```
S1 (GitHub Repository)
 ├──→ S2 (Next.js App)
 │     ↓
 │     ├──→ S4 (Health Endpoint) ←── S5 (Env Variables)
 │     │         ↓                         ↓
 └──→ S3 (Vercel) ──→ S5              S9 (Basic Auth)
                       ↓
                      S6 (Smoke Tests)
                       ↓
                      S7 (GitHub Actions)
                       ↓
                      S8 (Documentation)
```

**Parallel Execution Notes:**

- S2 (Next.js App) and S3 (Vercel Integration) can start in parallel after S1 completes
- S4 (Health Endpoint) requires both S2 and S3 because it needs the app structure and deployment verification
- S5 (Environment Variables) requires S3 (Vercel configured) but can run parallel to S2
- S6-S8 are sequential as each builds on the previous
- S9 (Basic Auth Middleware) can run in parallel with S6-S8 after S2 and S5 are complete

## Technical Constraints

### Required Patterns

- **Health Check Pattern**: Implement structured health check per [TAD: Steel Thread](../../2-technical/2-tad-steel-thread-deployment.md#health-check-specification) with database, auth, and cache checks
- **Environment Validation**: Use `@t3-oss/env-nextjs` for type-safe environment variables per [TAD: Developer Experience](../../2-technical/2-tad.md#developer-experience)

### Technology Decisions

| Decision        | Choice     | Reference                                                                             |
| --------------- | ---------- | ------------------------------------------------------------------------------------- |
| Framework       | Next.js 16 | [ADR-003: Next.js as Framework](/docs/2-technical/adr/003-nextjs-framework.md)        |
| Hosting         | Vercel     | [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md)    |
| Package Manager | pnpm       | [ADR-002: pnpm as Package Manager](/docs/2-technical/adr/002-pnpm-package-manager.md) |

### Constraints

- **Versions**: All technology versions per [Canonical Versions](/docs/2-technical/references/canonical-versions.md)
- **Branch Protection**: `development` branch must require PR with passing checks before merge
- **Preview Deployments**: Must generate unique URL for every PR automatically
- **Health Check Response Time**: Must respond within 100ms under normal load
- **No Database Required**: Health endpoint should handle missing database gracefully (return degraded status)

## Out of Scope

The following items are explicitly NOT part of this epic:

- **Turborepo/Monorepo Configuration** - Deferred to Epic 1A.1 (Monorepo Foundation)
- **Full Testing Infrastructure (Vitest)** - Deferred to Epic 1A.3 (Testing Foundation)
- **Production Database Setup** - Deferred to Epic 2A.2 (Database Infrastructure); health check will return "ok" for database check with TODO comment
- **Authentication Integration** - Deferred to Epic 2A.7 (Auth Infrastructure); health check will skip auth check initially
- **Custom Domain Configuration** - Can be added in S3 but not required for steel thread; Vercel default domains sufficient
- **Advanced CI/CD (code coverage, security scanning)** - Deferred to Epic 1A.5 (Basic CI/CD Pipeline)

## Actions or Decisions Required

> **Note**: Flag decisions that need resolution before or during implementation.

| Decision                     | Options                                       | Impact                          | Status                         |
| ---------------------------- | --------------------------------------------- | ------------------------------- | ------------------------------ |
| Custom domain for production | Use Vercel default vs configure custom domain | Affects SSL and documentation   | ⬜ Open                        |
| Branch strategy              | `main` vs `development` as production branch  | Affects branch protection setup | ✅ Resolved: Use `development` |

## Risks and Mitigations

| Risk                                          | Likelihood | Impact | Mitigation                                                       |
| --------------------------------------------- | ---------- | ------ | ---------------------------------------------------------------- |
| Vercel integration issues with new Next.js 16 | Low        | Medium | Fallback to Next.js 15 if blocking issues found                  |
| GitHub Actions workflow complexity            | Low        | Low    | Start with minimal workflow, expand in 1A.5                      |
| Preview deployment URL not generated          | Low        | Medium | Manual trigger as fallback; verify Vercel GitHub app permissions |

## Estimated Effort

| Metric          | Value        |
| --------------- | ------------ |
| Total Stories   | 9            |
| Total Hours     | 23h          |
| Calendar Days   | 2 days       |
| Parallel Tracks | 2 (after S1) |

### Story Breakdown

| Size      | Count | Hours |
| --------- | ----- | ----- |
| XS (1-2h) | 0     | 0h    |
| S (2-4h)  | 6     | 18h   |
| M (4-8h)  | 3     | 15h   |
| L (8-16h) | 0     | 0h    |

**Note**: S-sized stories estimated at ~3h average, M-sized at ~5h average given this is foundational work.

## References

### Internal Documentation

- [PRD: Core Features](/docs/1-product/1-prd.md#3-core-features-moscow-prioritization)
- [TAD: Steel Thread & Deployment Pipeline](/docs/2-technical/2-tad.md#steel-thread--deployment-pipeline)
- [TAD: Steel Thread Details](/docs/2-technical/2-tad-steel-thread-deployment.md)
- [Roadmap: Phase 0A](/docs/1-product/3-roadmap.md#phase-0a-steel-thread-day-1-2)

### ADRs

- [ADR-002: pnpm as Package Manager](/docs/2-technical/adr/002-pnpm-package-manager.md)
- [ADR-003: Next.js as Framework](/docs/2-technical/adr/003-nextjs-framework.md)
- [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md)

### External Documentation

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Vercel Deployment Documentation](https://vercel.com/docs/deployments/overview)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Playwright Documentation](https://playwright.dev/docs/intro)

## Status

- **State**: Not Started
- **Started**: -
- **Completed**: -
- **Stories Complete**: 0/9
