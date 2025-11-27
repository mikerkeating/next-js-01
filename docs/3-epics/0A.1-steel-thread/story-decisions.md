# Story Decisions - Epic 0A.1: Steel Thread Deployment

This document consolidates all decisions required and made across the stories in the Steel Thread Deployment epic.

## Summary

| Story | Story-Specific Decisions | Consolidated Decisions (Reference Only) |
|-------|--------------------------|----------------------------------------|
| S1: GitHub Repository | None | TAD: Branch Naming, ADR-002: pnpm |
| S2: Next.js Application | None | TAD: App Router, ADR-002: pnpm, ADR-003: Next.js |
| S3: Vercel Integration | None | TAD: Vercel Configuration, ADR-004: Vercel Hosting |
| S4: Health Endpoint | AD-0A.1.S4.1 | TAD: Health Check Specification, ADR-003: Next.js |
| S5: Environment Variables | AD-0A.1.S5.1 | TAD: Environment Variables Strategy |
| S6: Smoke Tests | AD-0A.1.S6.1, AD-0A.1.S6.2 | TAD: Testing Architecture, TAD: Deployment Smoke Tests |
| S7: GitHub Actions | AD-0A.1.S7.1, AD-0A.1.S7.2 | TAD: CI/CD Approach, TAD: GitHub Actions Workflow |
| S8: Documentation | None | TAD: Documentation Architecture |

---

## Story-Specific Decisions

### S4: Health Check Endpoint

#### AD-0A.1.S4.1: Stub Health Checks for Steel Thread

**Scope**: Story-specific (does not affect other stories)

**Decision**: Implement database, auth, and cache checks as stubs returning "ok" status with TODO comments.

**Rationale**:
- Database infrastructure not yet implemented (Epic 2A.2)
- Authentication not yet integrated (Epic 2A.7)
- Cache not yet configured (future epic)
- Steel thread focuses on deployment pipeline, not dependency integration

**Consequences**:
- Health endpoint always returns "healthy" during steel thread phase
- Future stories will implement real checks when dependencies are available
- Clear TODO comments indicate intentional stubs

**Alternatives Considered**:
- **Skip checks entirely**: Rejected - structure needed for smoke tests
- **Return "degraded" for missing deps**: Rejected - would trigger false alerts

---

### S5: Environment Variables

#### AD-0A.1.S5.1: Minimal Environment Variables for Steel Thread

**Scope**: Story-specific

**Decision**: Configure only essential environment variables; defer Database/Auth/Analytics variables as optional in schema.

**Rationale**: Steel thread needs minimal config to prove deployment pipeline. Future stories will make variables required as dependencies are added.

**Consequences**:
- Simplified initial configuration
- Variables can be progressively made required as features are implemented

---

### S6: Playwright Smoke Tests

#### AD-0A.1.S6.1: Chromium-Only for Smoke Tests

**Scope**: Story-specific (does not affect other stories)

**Decision**: Run smoke tests only in Chromium, not full cross-browser suite.

**Rationale**: Smoke tests validate deployment, not browser compatibility. Single browser reduces CI time ~60%. Cross-browser testing deferred to Epic 1A.3.

**Consequences**:
- Firefox/WebKit issues not caught in deployment pipeline
- Faster PR feedback

#### AD-0A.1.S6.2: Minimal Smoke Test Scope

**Scope**: Story-specific (does not affect other stories)

**Decision**: Smoke suite includes 4 tests: health check, homepage load, console errors, static assets.

**Rationale**: Smoke tests prove deployment works, not feature completeness. Auth flow deferred until Clerk integration (Epic 2A.7).

**Consequences**:
- Quick feedback on deployment health
- Limited coverage by design

---

### S7: GitHub Actions CI Workflow

#### AD-0A.1.S7.1: Parallel Core Jobs

**Scope**: Story-specific (does not affect other stories)

**Decision**: Run lint, type-check, test, and build jobs in parallel rather than sequentially.

**Rationale**: Parallel execution reduces total CI time from ~8min to ~3min. Each job is independent and doesn't require output from others.

**Consequences**:
- Higher concurrent runner usage
- Faster developer feedback

#### AD-0A.1.S7.2: E2E Only on Pull Requests

**Scope**: Story-specific (does not affect other stories)

**Decision**: Only run E2E smoke tests on `pull_request` events, not on `push` events.

**Rationale**: Push to `development` already passed E2E in the PR. Running again wastes CI minutes and doesn't provide new information.

**Consequences**:
- Production deployment relies on PR E2E results
- Faster post-merge deployment

---

## Consolidated Decisions (Reference Only)

These decisions are documented in TAD/ADR documents and referenced by multiple stories:

### From TAD: Steel Thread Deployment

| Decision | Description | Referenced By |
|----------|-------------|---------------|
| Branch Naming Convention | Using `development` as production branch | S1 |
| Vercel Configuration | Framework preset, production branch, install command | S3 |
| Health Check Specification | Response format, status codes, check timeout | S4 |
| Environment Variables Strategy | Server/client separation, build-time validation | S5 |
| Deployment Smoke Tests | Base URL pattern, browsers, timeouts, retries | S6, S7 |
| GitHub Actions Workflow | Trigger branches, Node.js version, concurrency | S7 |

### From TAD: Main

| Decision | Description | Referenced By |
|----------|-------------|---------------|
| App Router Structure | Using `src/app` directory convention | S2 |
| Testing Architecture | E2E testing with Playwright | S6 |
| CI/CD Approach | GitHub Actions for CI/CD pipeline | S7 |
| Documentation Architecture | Two-audience approach (maintainer/consumer) | S8 |

### From ADRs

| ADR | Title | Referenced By |
|-----|-------|---------------|
| ADR-002 | pnpm as Package Manager | S1, S2 |
| ADR-003 | Next.js as Framework | S2, S4 |
| ADR-004 | Vercel as Hosting Platform | S3 |

---

## Decision Dependencies

```
S1 (no decisions)
 └─► S2 (no decisions) ─────────────────────┐
 └─► S3 (no decisions)                      │
      └─► S5 (AD-0A.1.S5.1: Minimal Env)    │
           └─► S4 (AD-0A.1.S4.1: Stub Checks)
                └─► S6 (AD-0A.1.S6.1: Chromium-Only)
                     (AD-0A.1.S6.2: Minimal Scope)
                     └─► S7 (AD-0A.1.S7.1: Parallel Jobs)
                          (AD-0A.1.S7.2: E2E on PR Only)
                          └─► S8 (no decisions)
```

---

## Open Questions / Future Decisions

The following items are explicitly deferred and will require decisions in future epics:

| Topic | Deferred To | Notes |
|-------|-------------|-------|
| Cross-browser E2E testing | Epic 1A.3 | Currently Chromium-only |
| Database health check implementation | Epic 2A.2 | Currently returns stub "ok" |
| Auth health check implementation | Epic 2A.7 | Currently returns stub "ok" |
| Cache/Redis health check | Future epic | Currently returns stub "ok" |
| Code coverage reporting | Epic 1A.5 | Not in steel thread CI |
| Security scanning (SAST) | Epic 1A.5 | Not in steel thread CI |
| Dependency vulnerability scanning | Epic 1A.5 | Not in steel thread CI |
| Bundle size checks | Epic 1A.5 | Not in steel thread CI |
