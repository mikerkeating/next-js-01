# Story 0A.1.S4: Implement Health Check Endpoint

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Steel Thread Deployment](./EPIC.md)
- **Depends On**: [S2: Create Minimal Next.js 16 Application](./S2-nextjs-app.md), [S3: Configure Vercel Project Integration](./S3-vercel-integration.md), [S5: Configure Environment Variables](./S5-environment-variables.md)
- **Blocks**: [S6: Create Playwright Smoke Test Suite](./S6-smoke-tests.md)
- **Runs in Parallel With**: None

## User Story

**As a** DevOps engineer
**I want** a health check endpoint that reports application status
**So that** I can monitor deployment health and integrate with uptime monitoring services

## Acceptance Criteria

- [ ] Health endpoint accessible at `GET /api/health`
- [ ] Returns HTTP 200 OK with JSON body when healthy
- [ ] Response includes `status`, `timestamp`, `version`, and `environment` fields
- [ ] Response includes `checks` object with `database`, `auth`, and `cache` status
- [ ] Returns HTTP 503 when any critical check reports error status
- [ ] Response time is under 100ms for healthy checks
- [ ] Handles missing database gracefully (returns "ok" with TODO comment for steel thread)
- [ ] Handles missing auth gracefully (returns "ok" with TODO comment for steel thread)

## Technical Requirements

### Files to Create

| Path                          | Purpose                                         |
| ----------------------------- | ----------------------------------------------- |
| `src/app/api/health/route.ts` | Health check API route handler                  |
| `src/lib/health/types.ts`     | TypeScript interfaces for health check response |
| `src/lib/health/checks.ts`    | Individual health check functions               |

### Files to Modify

| Path        | Changes                                            |
| ----------- | -------------------------------------------------- |
| `README.md` | Document health endpoint usage and response format |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

No additional dependencies required - uses Next.js built-in API routes.

### Configuration Details

| Setting           | Requirement                             | TAD Reference                                                                                                    |
| ----------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Response Format   | `HealthCheckResponse` interface         | [TAD: Health Check Specification](/docs/2-technical/2-tad-steel-thread-deployment.md#health-check-specification) |
| HTTP Status Codes | 200 (healthy/degraded), 503 (unhealthy) | [TAD: Health Check Specification](/docs/2-technical/2-tad-steel-thread-deployment.md#health-check-specification) |
| Check Timeout     | Individual checks timeout at 5 seconds  | [TAD: Health Check Specification](/docs/2-technical/2-tad-steel-thread-deployment.md#health-check-specification) |

**Configuration Rationale**: The health check endpoint provides operational visibility and enables automated monitoring. Using structured checks allows granular status reporting and easier debugging.

## Test Requirements

### Manual Verification

- [ ] **Endpoint Accessible**: `curl http://localhost:3000/api/health` returns 200 OK
- [ ] **JSON Response Valid**: Response parses as valid JSON with required fields
- [ ] **Environment Correct**: `environment` field matches deployment context
- [ ] **Response Time**: Endpoint responds in under 100ms locally

### Automated Tests

No automated tests in this story - E2E smoke tests added in S6.

### Integration Tests

- [ ] Health check validates in Vercel preview deployment
- [ ] External uptime monitoring can poll endpoint successfully

### Verification Commands

```bash
# Local verification
curl -s http://localhost:3000/api/health | jq .

# Check HTTP status code
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health

# Verify response time (should be < 100ms)
curl -s -o /dev/null -w "%{time_total}" http://localhost:3000/api/health

# Production/Preview verification (replace URL)
curl -s https://<deployment-url>/api/health | jq .
```

## Implementation Notes

### Implementation Sequence

1. **Create Type Definitions** (~15min)
   - Define `HealthCheckResponse` and `HealthCheckDetail` interfaces
   - Reference TAD specification for interface structure

2. **Implement Check Functions** (~30min)
   - Create placeholder `checkDatabase()` returning "ok" with TODO
   - Create placeholder `checkAuth()` returning "ok" with TODO
   - Create placeholder `checkCache()` returning "ok" with TODO

3. **Implement Route Handler** (~30min)
   - Create API route at `/api/health`
   - Use `Promise.allSettled` for parallel checks
   - Determine overall status based on check results

4. **Add Documentation** (~15min)
   - Update README with endpoint documentation

### Key Concepts

- **Parallel Checks**: Use `Promise.allSettled` to run all checks concurrently without failing fast
- **Graceful Degradation**: Missing dependencies (database, auth) return "ok" for steel thread phase
- **Status Determination**: Any "error" = unhealthy (503), any "degraded" = degraded (200), all "ok" = healthy (200)

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Health Check Specification](/docs/2-technical/2-tad-steel-thread-deployment.md#health-check-specification)
- [TAD: Health Check Logic](/docs/2-technical/2-tad-steel-thread-deployment.md#health-check-specification)

Key pattern notes for this story:

- Use the `HealthCheckResponse` interface defined in TAD
- Implement stub check functions that return "ok" with TODO comments
- Database and auth checks will be implemented in future epics (2A.2, 2A.7)

### Troubleshooting

**Issue**: Health endpoint returns 404

- **Cause**: Route file not in correct location
- **Solution**: Verify file is at `src/app/api/health/route.ts`

**Issue**: TypeScript errors on Response.json()

- **Cause**: Missing type annotations or incorrect return type
- **Solution**: Ensure route handler returns `Promise<NextResponse<HealthCheckResponse>>`

**Issue**: Environment field shows "development" in preview

- **Cause**: `VERCEL_ENV` not available
- **Solution**: Check Vercel automatically provides this; fallback to "development" is correct locally

### Reference Materials

- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables/system-environment-variables)

## Estimated Effort

**Size**: S (2-4h)

**Breakdown**:

- Type definitions: 15min
- Check functions: 30min
- Route handler: 30min
- Testing & verification: 30min
- Documentation: 15min

## Architecture Decisions

### Consolidated Decisions (reference only)

- [TAD: Health Check Specification](/docs/2-technical/2-tad-steel-thread-deployment.md#health-check-specification) - Response format and status codes
- [ADR-003: Next.js as Framework](/docs/2-technical/adr/003-nextjs-framework.md) - Using App Router API routes

### Story-Specific Decisions

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

## Out of Scope

The following items are explicitly NOT part of this story:

- **Database Health Check Implementation** - Deferred to Epic 2A.2 (Database Infrastructure); returns stub "ok"
- **Auth Provider Health Check** - Deferred to Epic 2A.7 (Auth Infrastructure); returns stub "ok"
- **Cache/Redis Health Check** - Deferred to future epic; returns stub "ok"
- **Uptime Monitoring Configuration** - Documentation only; external service setup not required
- **Alerting/Slack Integration** - Deferred to future observability epic
- **Health Check Caching** - Not needed for steel thread; simple implementation sufficient

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S2**: Create Minimal Next.js 16 Application - Needs App Router structure for API route
- **S3**: Configure Vercel Project Integration - Needs deployment to verify in preview environment
- **S5**: Configure Environment Variables - Needs environment variable patterns for `VERCEL_ENV` access

### Enables (Unblocks These Stories)

- **S6**: Create Playwright Smoke Test Suite - Needs health endpoint to test deployment

## References

### Epic & TAD References

- [EPIC.md](./EPIC.md)
- [TAD: Health Check Specification](/docs/2-technical/2-tad-steel-thread-deployment.md#health-check-specification)
- [TAD: Steel Thread Components](/docs/2-technical/2-tad-steel-thread-deployment.md#steel-thread-components)

### ADR References

- [ADR-003: Next.js as Framework](/docs/2-technical/adr/003-nextjs-framework.md)

### External Documentation

- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Vercel System Environment Variables](https://vercel.com/docs/projects/environment-variables/system-environment-variables)

## Verification Checklist

### Pre-Verification

- [ ] S2 (Next.js Application) completed
- [ ] S3 (Vercel Integration) completed
- [ ] S5 (Environment Variables) completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] Health endpoint returns 200 OK locally
- [ ] Response matches `HealthCheckResponse` interface from TAD
- [ ] All check functions include TODO comments for future implementation
- [ ] `pnpm lint` passes without errors
- [ ] `pnpm type-check` passes without errors

### Documentation

- [ ] README.md updated with health endpoint documentation
- [ ] Code comments explain stub check rationale

### Git Hygiene

- [ ] Conventional commit message used (e.g., `feat(api): add health check endpoint`)
- [ ] No unrelated changes included
- [ ] PR description references this story

## Status

- **State**: Implemented
- **PR**: Pending
- **Completed**: 2025-11-27
