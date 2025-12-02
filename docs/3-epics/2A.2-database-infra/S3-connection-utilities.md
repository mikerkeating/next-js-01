# Story 2A.2.S3: Implement Connection Utilities

> **To implement this story:** Read the Technical Requirements, create the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Database Infrastructure](./EPIC.md)
- **Depends On**: [S1: Create @repo/database Package Structure](./S1-package-structure.md), [S2: Configure Drizzle ORM and Client](./S2-drizzle-config.md)
- **Blocks**: [S4: Set Up Migration Infrastructure](./S4-migration-infrastructure.md), [S5: Create Seed Script Framework](./S5-seed-framework.md), [S6: Implement Generic Utility Functions](./S6-utility-functions.md)
- **Runs in Parallel With**: None

## User Story

**As a** Backend Developer
**I want** connection utilities with health checks and retry logic
**So that** I can reliably manage database connections across serverless and edge environments with proper error handling

## Acceptance Criteria

- [x] Connection health check utility returns connection status with latency measurement
- [x] Retry logic wrapper handles transient connection failures with exponential backoff
- [x] Connection utilities work in both serverless (Node.js) and edge (Vercel Edge) runtimes
- [x] Health check includes basic query execution to verify database accessibility
- [x] Connection errors provide actionable error messages for debugging
- [x] Utilities handle missing DATABASE_URL gracefully with clear error messages
- [x] Connection timing metrics available for performance monitoring
- [x] All utilities are exported from package entry point

## Technical Requirements

### Files to Create

| Path                                       | Purpose                                     |
| ------------------------------------------ | ------------------------------------------- |
| `packages/database/src/connection.ts`      | Connection health check and retry utilities |
| `packages/database/src/connection.test.ts` | Unit tests for connection utilities         |

### Files to Modify

| Path                             | Changes                                    |
| -------------------------------- | ------------------------------------------ |
| `packages/database/src/index.ts` | Export connection utilities                |
| `packages/database/package.json` | Add testing scripts if not already present |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# In packages/database directory (testing dependencies)
pnpm add -D vitest @vitest/ui
```

### Configuration Details

| Setting            | Requirement                                 | TAD Reference                                                    |
| ------------------ | ------------------------------------------- | ---------------------------------------------------------------- |
| Connection timeout | Default 5000ms, configurable                | [ADR-005: Drizzle ORM](/docs/2-technical/adr/005-drizzle-orm.md) |
| Retry attempts     | Default 3 attempts with exponential backoff | Epic acceptance criteria (<100ms connection times)               |
| Health check query | Simple `SELECT 1` for minimal overhead      | [TAD: Database & ORM](/docs/2-technical/2-tad.md#database--orm)  |
| Error handling     | Typed errors with specific failure reasons  | [TAD: Observability](/docs/2-technical/2-tad-observability.md)   |

**Configuration Rationale**: Connection utilities provide resilient database access patterns required for serverless environments where connections can fail or timeout. Health checks enable observability endpoints to verify database availability per Epic acceptance criteria.

## Test Requirements

### Manual Verification

- [ ] **Health Check Success**: Run health check with valid DATABASE_URL - returns healthy status with latency <100ms
- [ ] **Health Check Failure**: Run health check with invalid DATABASE_URL - returns error with clear message
- [ ] **Retry Logic**: Simulate transient failure - verify retry attempts with exponential backoff

### Automated Tests

- [ ] Unit: `connection.test.ts` - Health check returns success with valid connection
- [ ] Unit: `connection.test.ts` - Health check returns failure with invalid connection string
- [ ] Unit: `connection.test.ts` - Retry logic attempts configured number of retries
- [ ] Unit: `connection.test.ts` - Exponential backoff delays increase between retries
- [ ] Unit: `connection.test.ts` - Connection timeout enforced correctly

### Integration Tests

- [ ] Health check endpoint integration - Verify health check can be called from API route (deferred to S7 for full integration suite)

### Verification Commands

```bash
# Run unit tests
cd packages/database && pnpm test

# Run tests with coverage
cd packages/database && pnpm test --coverage

# Test health check manually (requires DATABASE_URL)
cd packages/database && pnpm tsx -e "
import { checkDatabaseHealth } from './src/connection';
checkDatabaseHealth().then(console.log);
"

# Verify exports
cd packages/database && node -e "
const db = require('./dist/index.js');
console.log('Exports:', Object.keys(db));
"
```

## Implementation Notes

### Implementation Sequence

1. **Create Connection Health Check**
   - Implement `checkDatabaseHealth()` function
   - Execute simple `SELECT 1` query to verify connectivity
   - Measure query execution time for latency metrics
   - Return typed result with status and timing

2. **Implement Retry Logic**
   - Create `withRetry()` wrapper function
   - Implement exponential backoff algorithm
   - Handle specific error types (connection vs. query errors)
   - Add configurable retry attempts and timeout

3. **Add Error Handling**
   - Create typed error classes for connection failures
   - Validate DATABASE_URL environment variable
   - Provide actionable error messages
   - Log connection attempts for debugging

4. **Write Unit Tests**
   - Mock database client for unit tests
   - Test success and failure scenarios
   - Verify retry behavior and backoff timing
   - Test timeout enforcement

5. **Export Utilities**
   - Add connection utilities to package exports
   - Update package documentation
   - Verify tree-shakeable exports

### Key Concepts

- **Health Check**: Lightweight query to verify database accessibility and measure latency
- **Retry Logic**: Automatic retry with exponential backoff for transient failures
- **Exponential Backoff**: Delay between retries increases exponentially (e.g., 100ms, 200ms, 400ms)
- **Connection Pooling**: Managed by Neon HTTP driver with fetch connection cache (configured in S2)

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.

Reference the TAD for connection patterns:

- [ADR-005: Drizzle ORM - Edge Runtime Support](/docs/2-technical/adr/005-drizzle-orm.md#rationale)
- [TAD: Observability - Health Checks](/docs/2-technical/2-tad-observability.md)

Key pattern notes for this story:

- Health check should use same database client from S2 (`src/client.ts`)
- Retry logic should wrap any async database operation generically
- Connection errors should be distinguishable from query errors
- Health check latency should be measured for performance monitoring

### Troubleshooting

| Issue                               | Cause                                 | Solution                                               |
| ----------------------------------- | ------------------------------------- | ------------------------------------------------------ |
| Health check always returns timeout | DATABASE_URL points to wrong host     | Verify connection string format and host accessibility |
| Retry logic loops indefinitely      | No max retry limit configured         | Ensure retry attempts default to 3                     |
| Edge runtime compatibility errors   | Using Node.js-specific APIs           | Use only fetch-compatible APIs (per Neon HTTP driver)  |
| Connection succeeds but query fails | Database exists but permissions wrong | Check database user permissions                        |
| Test failures in CI                 | No test database configured           | Use mocked client for unit tests (deferred to S7)      |

### Reference Materials

- [Drizzle ORM: Connection Configuration](https://orm.drizzle.team/docs/get-started-postgresql#neon)
- [Neon Serverless Driver Documentation](https://neon.tech/docs/serverless/serverless-driver)
- [Exponential Backoff Pattern](https://en.wikipedia.org/wiki/Exponential_backoff)

## Estimated Effort

**Size**: M (4-8h)

**Breakdown**:

- Connection health check: 1.5h
- Retry logic with backoff: 2h
- Error handling and validation: 1.5h
- Unit tests: 2h
- Documentation and verification: 1h

## Architecture Decisions

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [ADR-005: Drizzle as ORM](/docs/2-technical/adr/005-drizzle-orm.md) - Defines connection patterns and edge runtime compatibility requirements
- [Epic 2A.2: Acceptance Criteria](./EPIC.md#acceptance-criteria) - Connection pooling maintains <100ms connection times under normal load

### Story-Specific Decisions

#### AD-2A.2.S3.1: Simple SELECT 1 for Health Check

**Scope**: Story-specific (health check implementation)

**Decision**: Use `SELECT 1` query instead of querying actual tables for health check

**Rationale**:

- Minimal overhead - fastest possible query
- No dependency on product schemas (which don't exist yet)
- Standard health check pattern across databases
- Sufficient to verify connection and database accessibility

**Consequences**:

- Health check works even with empty database (no schemas required)
- Cannot detect schema-level issues (acceptable for infrastructure story)
- May need enhanced health checks in future for schema validation

**Alternatives Considered**:

- **Query system tables** - Rejected because adds unnecessary complexity and overhead
- **Query product tables** - Rejected because product schemas don't exist until Epic 2B.1

#### AD-2A.2.S3.2: Default 3 Retry Attempts with Exponential Backoff

**Scope**: Story-specific (retry logic configuration)

**Decision**: Default to 3 retry attempts with exponential backoff starting at 100ms

**Rationale**:

- Balances resilience with responsiveness (total <1s for all retries)
- Exponential backoff reduces load during outages (100ms, 200ms, 400ms)
- Industry standard pattern for transient failures
- Configurable for future tuning based on metrics

**Consequences**:

- Transient failures auto-recover without user impact
- Total retry time ~700ms worst case (acceptable for serverless)
- May need adjustment based on production metrics

**Alternatives Considered**:

- **Fixed delay** - Rejected because doesn't reduce load during sustained outages
- **More retries** - Rejected because increases latency beyond acceptable limits

## Out of Scope

The following items are explicitly NOT part of this story:

- **Database migration execution** - Handled in S4 (Set Up Migration Infrastructure)
- **Seed data utilities** - Handled in S5 (Create Seed Script Framework)
- **Generic utility functions** (createId, timestamps, softDelete) - Handled in S6 (Implement Generic Utility Functions)
- **Integration test suite** - Basic unit tests only; full suite in S7 (Write Tests for Database Package)
- **Connection pooling configuration** - Already configured in S2; this story adds utilities on top
- **Production monitoring integration** - Deferred to Epic 2A.3 (Observability Package)

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1**: Create @repo/database Package Structure - Requires package structure and TypeScript configuration
- **S2**: Configure Drizzle ORM and Client - Requires configured database client to build utilities around

### Enables (Unblocks These Stories)

- **S4**: Set Up Migration Infrastructure - Requires connection health check for migration validation
- **S5**: Create Seed Script Framework - Requires retry logic for reliable seed execution
- **S6**: Implement Generic Utility Functions - Requires working connection for utility development

## References

### Epic & TAD References

- [EPIC.md: Acceptance Criteria](./EPIC.md#acceptance-criteria)
- [ADR-005: Drizzle as ORM](/docs/2-technical/adr/005-drizzle-orm.md)
- [TAD: Database & ORM](/docs/2-technical/2-tad.md#database--orm)
- [TAD: Observability](/docs/2-technical/2-tad-observability.md)

### External Documentation

- [Neon Serverless Driver](https://neon.tech/docs/serverless/serverless-driver)
- [Drizzle ORM with Neon](https://orm.drizzle.team/docs/get-started-postgresql#neon)

## Verification Checklist

**Pre-Verification:**

- [x] S1 and S2 completed
- [x] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [x] DATABASE_URL environment variable configured

**Implementation Quality:**

- [x] All acceptance criteria met
- [x] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [x] No lint errors
- [x] Types compile successfully
- [x] Tests written and passing
- [x] Coverage > 80% for connection utilities (81.63% achieved)

**Documentation & Git:**

- [x] Code comments for health check and retry logic
- [ ] README.md updated with connection utilities usage - deferred, index.ts contains usage examples
- [x] Commit: `feat(2A.2.S3): implement connection utilities with health checks and retry logic`

## Status

- **State**: Complete
- **Completed**: 2025-12-01
- **PR**: -

## Completion Notes

### Summary

Implemented connection health check and retry utilities for the @repo/database package. The `checkDatabaseHealth()` function executes a `SELECT 1` query to verify database connectivity and measure latency. The `withRetry()` wrapper provides exponential backoff retry logic for any async database operation. Custom `ConnectionError` class provides typed error codes for programmatic error handling.

### Test Results

| Test       | Command              | Result          |
| ---------- | -------------------- | --------------- |
| Lint       | `pnpm lint`          | Pass            |
| Types      | `pnpm type-check`    | Pass            |
| Unit Tests | `pnpm test`          | Pass (17 tests) |
| Coverage   | `pnpm test:coverage` | Pass (81.63%)   |
| Build      | `pnpm build`         | Pass            |

### Files Changed

Beyond planned files:

- `packages/database/vitest.config.ts` - Added Vitest configuration for the package

### Known Issues

None.

### Lessons Learned

- Vitest's `vi.mock()` factory cannot reference external variables due to hoisting. Use dynamic imports within tests to access mocked modules.
- When testing with fake timers and rejected promises, use `mockImplementation()` that returns `Promise.reject()` inside the function rather than `mockRejectedValue()` to avoid unhandled promise rejection warnings.
