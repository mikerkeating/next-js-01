# Story 2A.3.S6: Create Health Check Utilities

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Observability Package](./EPIC.md)
- **Depends On**: [S1: Package Structure](./S1-package-structure.md) - Package structure and build configuration
- **Blocks**: [S7: Tests and Documentation](./S7-tests-docs.md)
- **Runs in Parallel With**: [S2: Structured Logger](./S2-structured-logger.md) (can develop independently after S1)

## User Story

**As a** developer
**I want** reusable health check utilities for database, auth, and cache services
**So that** I can monitor service availability and provide consistent health reporting across applications

## Acceptance Criteria

- [ ] Health check functions exported from `@repo/observability/health-checks`
- [ ] `checkDatabase()` function validates database connectivity and performance
- [ ] `checkAuth()` function validates authentication service availability
- [ ] `checkCache()` function validates cache service availability with graceful degradation
- [ ] `checkAllServices()` function aggregates all checks and determines overall status
- [ ] All checks use `Promise.allSettled` for parallel execution without fail-fast behavior
- [ ] Response time threshold detection (degraded if >1000ms for database, >500ms for auth)
- [ ] Each check returns `HealthCheckResult` interface with status, responseTime, message, and lastChecked
- [ ] Missing services return appropriate status (cache: "ok" with message, others: error handling via try-catch)
- [ ] All functions are fully typed with TypeScript strict mode

## Technical Requirements

### Files to Create

| Path                                              | Purpose                                    |
| ------------------------------------------------- | ------------------------------------------ |
| `packages/observability/src/health-checks.ts`     | Health check utility functions             |
| `packages/observability/src/types/health.ts`      | Health check TypeScript interfaces         |
| `packages/observability/__tests__/health.test.ts` | Unit tests for health check utilities      |

### Files to Modify

| Path                                  | Changes                                                        |
| ------------------------------------- | -------------------------------------------------------------- |
| `packages/observability/src/index.ts` | Export health check utilities and types                        |
| `packages/observability/package.json` | Add peer dependencies for database and environment config      |
| `packages/observability/README.md`    | Document health check utilities with usage examples            |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# Navigate to package directory
cd packages/observability

# Add peer dependencies (these will be provided by consuming apps)
# No direct dependencies needed - uses imports from @repo/database and @repo/config
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting                   | Requirement                                              | TAD Reference                                                                                 |
| ------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `HealthCheckResult` type  | Interface with status, responseTime, message, lastChecked | [TAD: Health Check Utilities](/docs/2-technical/2-tad-observability.md#health-check-utilities) |
| Response time thresholds  | Database: 1000ms (degraded), Auth: 500ms (degraded)      | [TAD: Health Check Utilities](/docs/2-technical/2-tad-observability.md#health-check-utilities) |
| Status values             | "ok" \| "degraded" \| "error"                            | [TAD: Health Check Utilities](/docs/2-technical/2-tad-observability.md#health-check-utilities) |
| Overall status            | "healthy" \| "degraded" \| "unhealthy"                   | [TAD: Health Check Utilities](/docs/2-technical/2-tad-observability.md#health-check-utilities) |
| Error handling            | Try-catch with logger integration                        | [TAD: Health Check Utilities](/docs/2-technical/2-tad-observability.md#health-check-utilities) |

**Configuration Rationale**: Health check utilities provide reusable service monitoring across applications. Performance thresholds (database: 1000ms, auth: 500ms) balance responsiveness expectations with reliability. The three-tier status system (ok/degraded/error) enables nuanced monitoring without false alarms. Using `Promise.allSettled` ensures all checks complete even if one fails, providing comprehensive health visibility.

For complete implementation patterns, see: [TAD: Health Check Utilities](/docs/2-technical/2-tad-observability.md#health-check-utilities)

## Test Requirements

### Manual Verification

- [ ] **Type Safety**: Import utilities in test file and verify TypeScript autocomplete works
- [ ] **Mock Database Check**: Call `checkDatabase()` with mocked database and verify status determination
- [ ] **Mock Auth Check**: Call `checkAuth()` with mocked fetch and verify response time calculation
- [ ] **Aggregate Check**: Call `checkAllServices()` and verify overall status logic (error > degraded > ok)

### Automated Tests

- [ ] Unit: `__tests__/health.test.ts` - Test `checkDatabase()` with mock database returning success/error
- [ ] Unit: `__tests__/health.test.ts` - Test `checkAuth()` with mock fetch returning various HTTP status codes
- [ ] Unit: `__tests__/health.test.ts` - Test `checkCache()` with and without REDIS_URL configured
- [ ] Unit: `__tests__/health.test.ts` - Test `checkAllServices()` overall status determination logic
- [ ] Unit: `__tests__/health.test.ts` - Test response time threshold detection (degraded vs ok)
- [ ] Unit: `__tests__/health.test.ts` - Test error handling when services throw exceptions

### Integration Tests

- [ ] Integration with Steel Thread health endpoint - Verify utilities can replace stub checks from 0A.1.S4
- [ ] Response time accuracy - Verify performance timing matches actual service response times

### Verification Commands

```bash
# Build the observability package
pnpm --filter @repo/observability build

# Run unit tests
pnpm --filter @repo/observability test

# Run type checking
pnpm --filter @repo/observability type-check

# Run linting
pnpm --filter @repo/observability lint

# Check test coverage (should be >80%)
pnpm --filter @repo/observability test --coverage

# Verify exports are accessible
node -e "import('@repo/observability/health-checks').then(console.log)"
```

## Implementation Notes

### Implementation Sequence

1. **Create Type Definitions** (~30min)
   - Define `HealthCheckResult` interface in `src/types/health.ts`
   - Define types for individual check functions and aggregate check
   - Export from `src/index.ts`

2. **Implement Database Check** (~45min)
   - Create `checkDatabase()` function in `src/health-checks.ts`
   - Use database execute method with simple `SELECT 1` query
   - Measure response time and determine status (ok/degraded/error)
   - Include try-catch with logger integration for errors

3. **Implement Auth Check** (~45min)
   - Create `checkAuth()` function
   - Use fetch with HEAD request to Clerk API endpoint
   - Check response status and measure response time
   - Handle missing `CLERK_SECRET_KEY` gracefully

4. **Implement Cache Check** (~30min)
   - Create `checkCache()` function
   - Return "ok" with message if `REDIS_URL` not configured
   - If configured, perform ping/test operation
   - Return "degraded" (not "error") if cache unavailable (non-critical service)

5. **Implement Aggregate Check** (~30min)
   - Create `checkAllServices()` function
   - Use `Promise.allSettled` to run all checks in parallel
   - Aggregate results and determine overall status (error > degraded > ok)
   - Return typed response with individual check results

6. **Write Unit Tests** (~60min)
   - Test each check function with mocked dependencies
   - Test error handling and edge cases
   - Test response time threshold logic
   - Test aggregate status determination

7. **Update Documentation** (~15min)
   - Add usage examples to README.md
   - Document integration with health endpoint
   - Update package exports

### Key Concepts

- **Parallel Execution**: `Promise.allSettled` runs all checks concurrently without fail-fast behavior
- **Response Time Thresholds**: Different thresholds for different services based on performance expectations
- **Graceful Degradation**: Cache returns "degraded" (not "error") when unavailable since it's non-critical
- **Status Hierarchy**: Error status takes precedence over degraded, which takes precedence over ok

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Health Check Utilities](/docs/2-technical/2-tad-observability.md#health-check-utilities)
- [TAD: Observability Architecture](/docs/2-technical/2-tad-observability.md#overview)

Key pattern notes for this story:

- Use the `HealthCheckResult` interface defined in TAD (status, responseTime, message, lastChecked)
- Import database utilities from `@repo/database` package (requires Epic 2A.2)
- Import environment configuration from `@repo/config/env` package
- Follow logger integration pattern for error logging

### Troubleshooting

| Issue                                          | Cause                                             | Solution                                                     |
| ---------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| Cannot import from `@repo/database`            | Database package not built or story dependency    | Verify Epic 2A.2 complete; run `pnpm build --filter @repo/database` |
| TypeScript error on db.execute()               | Database types not exported correctly             | Check database package exports include type definitions      |
| Auth check fails with CORS error               | Invalid fetch configuration for Clerk API         | Use HEAD request with proper Authorization header            |
| Cache check always returns error               | Missing graceful handling for unconfigured cache  | Check for `REDIS_URL` first, return "ok" with message if absent |
| Overall status always "unhealthy"              | Logic error in status aggregation                 | Review status determination: hasError → unhealthy, hasDegraded → degraded |
| Tests fail due to missing environment vars     | Test environment not configured                   | Mock environment variables in test setup                     |

### Reference Materials

- [Node.js Performance Timing](https://nodejs.org/api/perf_hooks.html)
- [Promise.allSettled()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled)
- [Clerk REST API](https://clerk.com/docs/reference/backend-api)
- [Vitest Mocking](https://vitest.dev/guide/mocking.html)

## Estimated Effort

**Size**: M (4-8h)

**Breakdown**:

- Type definitions: 30min
- Database check implementation: 45min
- Auth check implementation: 45min
- Cache check implementation: 30min
- Aggregate check implementation: 30min
- Unit tests: 60min
- Documentation: 15min
- Debugging and refinement: 45min

## Architecture Decisions

### Consolidated Decisions (reference only)

- [TAD: Health Check Utilities](/docs/2-technical/2-tad-observability.md#health-check-utilities) - Health check patterns and interfaces
- [TAD: Observability Architecture](/docs/2-technical/2-tad-observability.md#overview) - Overall observability strategy
- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md) - Package structure rationale

### Story-Specific Decisions

#### AD-2A.3.S6.1: Cache Returns Degraded (Not Error) When Unavailable

**Scope**: Story-specific (isolated to health check utilities)

**Decision**: Cache health check returns "degraded" status (not "error") when cache service is unavailable.

**Rationale**:

- Cache is a non-critical service - applications can function without it
- Returning "error" would cause overall health to be "unhealthy" and trigger HTTP 503
- "Degraded" status alerts operators without falsely indicating application failure
- Applications using health utilities can override this behavior if cache is critical for their use case

**Consequences**:

- Applications relying on cache as critical service must implement custom logic
- Health endpoint returns 200 (not 503) when only cache is down
- Clearer operational distinction between critical and non-critical services

**Alternatives Considered**:

- **Return "error" for cache failures**: Rejected - would cause false unhealthy status for most applications
- **Make cache status configurable**: Rejected - adds complexity; applications can implement custom checks if needed

## Out of Scope

The following items are explicitly NOT part of this story:

- **Actual Database Implementation** - Requires Epic 2A.2 (Database Infrastructure) to be complete; uses peer dependency
- **Authentication Service Integration** - Uses environment variables from `@repo/config`; actual Clerk integration in Epic 2A.7
- **Redis/Cache Implementation** - Deferred to future epic; placeholder logic handles missing cache gracefully
- **Health Check Endpoint Integration** - Steel Thread health endpoint (0A.1.S4) will be updated in future refactoring to use these utilities
- **Health Check Caching/Memoization** - Not required for MVP; checks are fast enough without caching
- **Custom Check Registration** - Fixed set of checks (database, auth, cache); extensibility deferred
- **Alerting Integration** - Health checks provide data; alerting configuration handled externally
- **Historical Health Data** - No persistence; each call provides current status only

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1: Package Structure** - Requires package directory, TypeScript config, and build setup

### Enables (Unblocks These Stories)

- **S7: Tests and Documentation** - Requires all utilities implemented to write comprehensive tests and documentation

## References

**Internal**:

- [EPIC.md: Overview](./EPIC.md#overview), [Technical Constraints](./EPIC.md#technical-constraints)
- [TAD: Health Check Utilities](/docs/2-technical/2-tad-observability.md#health-check-utilities)
- [TAD: Observability Architecture](/docs/2-technical/2-tad-observability.md)
- [TAD: Steel Thread Health Check](/docs/2-technical/2-tad-steel-thread-deployment.md#health-check-specification)
- [Story 0A.1.S4: Health Check Endpoint](../../0A.1-steel-thread/S4-health-endpoint.md)
- [Epic 2A.2: Database Infrastructure](../2A.2-database-infra/EPIC.md)
- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)

**External**:

- [Promise.allSettled - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled)
- [Clerk REST API Documentation](https://clerk.com/docs/reference/backend-api)
- [Node.js Performance Timing](https://nodejs.org/api/perf_hooks.html)
- [Vitest Testing Framework](https://vitest.dev/)

## Verification Checklist

- [ ] **Pre-Verification**: S1 complete; Epic 2A.2 available for database types; local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] **Implementation**: All acceptance criteria met; [coding standards](/docs/2-technical/references/coding-standards.md) followed; response time thresholds implemented correctly
- [ ] **Quality**: No lint errors; types compile with strict mode; tests pass with >80% coverage; all checks handle errors gracefully
- [ ] **Documentation**: README.md includes usage examples; code comments explain thresholds and status determination logic
- [ ] **Git**: Conventional commit (e.g., `feat(observability): add health check utilities`); PR references Epic 2A.3.S6

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
