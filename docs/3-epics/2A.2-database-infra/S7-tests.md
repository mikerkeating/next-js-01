# Story 2A.2.S7: Write Tests for Database Package

> **To implement this story:** Read the Technical Requirements, create the specified test files following TAD testing patterns, then verify using the Verification Checklist.

## Context

- **Epic**: [Database Infrastructure](./EPIC.md)
- **Depends On**: [S5: Create Seed Script Framework](./S5-seed-framework.md), [S6: Implement Generic Utility Functions](./S6-utility-functions.md)
- **Blocks**: [S8: Create Documentation and Examples](./S8-documentation.md)
- **Runs in Parallel With**: None

## User Story

**As a** Developer
**I want** comprehensive tests for the database package
**So that** I can confidently use database utilities, verify correctness of connections and migrations, and prevent regressions when making changes

## Acceptance Criteria

- [ ] Test coverage exceeds 80% for all database utility functions
- [ ] Unit tests verify ID generation, timestamps, soft delete, and organization context helpers
- [ ] Integration tests verify database connection, migration execution, and seed operations
- [ ] Edge runtime compatibility tests verify utilities work in serverless environments
- [ ] Test suite runs successfully in CI pipeline
- [ ] All tests use seed framework for consistent test data
- [ ] Tests can run in isolation without affecting other tests (transaction rollback)
- [ ] Performance tests verify connection pooling stays under 100ms for typical operations

## Technical Requirements

### Files to Create

| Path                                              | Purpose                                    |
| ------------------------------------------------- | ------------------------------------------ |
| `packages/database/src/utils/ids.test.ts`         | Unit tests for ID generation               |
| `packages/database/src/utils/timestamps.test.ts`  | Unit tests for timestamp helpers           |
| `packages/database/src/utils/soft-delete.test.ts` | Unit tests for soft delete utilities       |
| `packages/database/src/utils/org-context.test.ts` | Unit tests for organization context        |
| `packages/database/src/connection.test.ts`        | Integration tests for connection utilities |
| `packages/database/src/seed/index.test.ts`        | Integration tests for seed framework       |
| `packages/database/src/__tests__/setup.ts`        | Test environment setup and teardown        |
| `packages/database/src/__tests__/helpers.ts`      | Shared test utilities and fixtures         |
| `packages/database/vitest.config.ts`              | Vitest configuration for database package  |

### Files to Modify

| Path                             | Changes                                 |
| -------------------------------- | --------------------------------------- |
| `packages/database/package.json` | Add test script and Vitest dependencies |
| `packages/database/.env.test`    | Test database connection string         |
| `.github/workflows/ci.yml`       | Add database tests to CI workflow       |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md#testing)

**Install commands:**

```bash
# Add Vitest and testing utilities (dev dependencies)
pnpm add -D vitest @vitest/coverage-v8 @vitest/ui --filter @repo/database
```

### Configuration Details

| Setting            | Requirement                                  | Notes                                        |
| ------------------ | -------------------------------------------- | -------------------------------------------- |
| Test database      | Separate test database or schema             | Use `DATABASE_URL_TEST` environment variable |
| Test isolation     | Transaction rollback after each test         | Prevents test pollution                      |
| Parallel execution | Tests can run concurrently                   | Use separate test database connections       |
| Coverage threshold | 80% minimum for utility functions            | Enforced in vitest.config.ts                 |
| Test timeout       | 10s for integration tests, 5s for unit tests | Allow time for database operations           |

**Configuration Rationale**:

Test isolation via transaction rollback ensures tests don't affect each other, enabling parallel execution and faster test runs. Separate test database prevents pollution of development data. Coverage thresholds ensure code quality and catch untested edge cases.

## Test Requirements

### Manual Verification

- [ ] **Test Coverage Report**: Run `pnpm test --coverage` and verify >80% coverage
- [ ] **CI Integration**: Verify tests run successfully in GitHub Actions
- [ ] **Test Isolation**: Run test suite 3 times consecutively - all runs should pass
- [ ] **Performance**: Verify test suite completes in under 30 seconds

### Automated Tests

- [ ] Unit: `utils/ids.test.ts` - Verify `createId()` generates unique, valid cuid2 IDs
- [ ] Unit: `utils/ids.test.ts` - Verify 10,000 generated IDs are all unique
- [ ] Unit: `utils/timestamps.test.ts` - Verify `timestamps()` returns createdAt and updatedAt columns
- [ ] Unit: `utils/soft-delete.test.ts` - Verify `isNotDeleted()` filters null deletedAt
- [ ] Unit: `utils/soft-delete.test.ts` - Verify `isDeleted()` filters non-null deletedAt
- [ ] Unit: `utils/org-context.test.ts` - Verify `withOrgContext()` applies organization filter
- [ ] Integration: `connection.test.ts` - Verify database connection can be established
- [ ] Integration: `connection.test.ts` - Verify connection pooling reuses connections
- [ ] Integration: `connection.test.ts` - Verify connection times stay under 100ms
- [ ] Integration: `seed/index.test.ts` - Verify seed script populates test data
- [ ] Integration: `seed/index.test.ts` - Verify re-seeding is idempotent

### Integration Tests

- [ ] Verify complete seed-query-cleanup lifecycle works in transaction
- [ ] Verify migration execution creates expected schema in test database
- [ ] Verify utility functions work correctly with actual database schema
- [ ] Verify soft delete pattern allows separate queries for deleted vs active records
- [ ] Verify organization context prevents cross-organization data access
- [ ] Verify edge runtime compatibility (test utilities work without Node.js-only APIs)

### Verification Commands

```bash
# Run all tests
cd packages/database && pnpm test

# Run tests with coverage report
cd packages/database && pnpm test --coverage

# Run tests in watch mode for development
cd packages/database && pnpm test --watch

# Run only unit tests
cd packages/database && pnpm test src/utils

# Run only integration tests
cd packages/database && pnpm test src/__tests__

# Run tests with UI
cd packages/database && pnpm test --ui

# Check coverage threshold enforcement
cd packages/database && pnpm test --coverage --reporter=json
```

## Implementation Notes

### Implementation Sequence

1. **Set Up Test Infrastructure**
   - Create Vitest configuration with coverage thresholds
   - Set up test database environment variables
   - Create shared test setup/teardown utilities
   - Configure transaction rollback for test isolation

2. **Write Unit Tests for Utility Functions**
   - Test ID generation (uniqueness, format, performance)
   - Test timestamp helpers (column definitions, auto-population)
   - Test soft delete utilities (filtering, edge cases)
   - Test organization context (filtering, type safety)

3. **Create Shared Test Helpers**
   - Database connection helper for tests
   - Transaction wrapper for test isolation
   - Test data factories using seed framework
   - Cleanup utilities for test teardown

4. **Write Integration Tests**
   - Test complete seed-query cycle
   - Test migration execution and rollback
   - Test connection pooling and performance
   - Test edge runtime compatibility

5. **Add Performance Tests**
   - Measure connection establishment time
   - Verify query performance with indexed vs non-indexed columns
   - Test batch insert performance with seed data

6. **Configure CI Integration**
   - Add test database setup to GitHub Actions
   - Configure parallel test execution in CI
   - Add coverage reporting to PR comments
   - Set up test result notifications

### Key Concepts

- **Test Isolation**: Each test runs in a transaction that rolls back, preventing side effects
- **Test Fixtures**: Reusable test data created via seed framework
- **Coverage Thresholds**: Minimum percentage of code that must be tested
- **Integration vs Unit**: Unit tests verify individual functions; integration tests verify system behavior
- **Edge Runtime**: Serverless environment constraints (no Node.js-specific APIs)

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for testing patterns:

- [TAD: Testing Architecture](/docs/2-technical/2-tad.md#testing-architecture)

Key pattern notes for this story:

- Use `beforeEach` to create test transaction, `afterEach` to roll back
- Use seed factories for test data instead of hardcoded values
- Mock external dependencies (if any) to ensure unit test isolation
- Use `describe` blocks to group related tests by feature
- Use descriptive test names following "should [expected behavior] when [condition]" format

### Troubleshooting

| Issue                             | Cause                                 | Solution                                           |
| --------------------------------- | ------------------------------------- | -------------------------------------------------- |
| Tests fail intermittently         | Race conditions in parallel execution | Use transaction isolation or test.sequential       |
| Test database connection errors   | Missing DATABASE_URL_TEST env var     | Add test database URL to .env.test                 |
| Coverage below threshold          | Missing tests for edge cases          | Add tests for error paths and boundary conditions  |
| Slow test execution               | Too many database round-trips         | Use batch operations and seed data efficiently     |
| Tests fail in CI but pass locally | Environment differences               | Ensure CI uses same Node.js/pnpm versions as local |

### Reference Materials

- [Vitest Documentation](https://vitest.dev/)
- [Drizzle ORM Testing Guide](https://orm.drizzle.team/docs/testing)
- [PostgreSQL Test Database Setup](https://www.postgresql.org/docs/current/regress.html)

## Estimated Effort

**Size**: M (6h)

**Breakdown**:

- Test infrastructure setup: 1h
- Unit tests for utility functions: 2h
- Integration tests: 2h
- Performance tests and CI configuration: 1h

## Architecture Decisions

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: Testing Architecture](/docs/2-technical/2-tad.md#testing-architecture) - Testing strategy and tool selection
- [ADR-005: Drizzle ORM](/docs/2-technical/adr/005-drizzle-orm.md) - Database testing patterns

### Story-Specific Decisions

#### AD-2A.2.S7.1: Transaction Rollback for Test Isolation

**Scope**: Story-specific (database package testing strategy)

**Decision**: Use transaction rollback pattern for test isolation rather than manual cleanup or database reset between tests.

**Rationale**:

- **Fast execution**: Rollback is faster than DELETE queries or database reset
- **Guaranteed cleanup**: No risk of leftover test data even if test fails
- **Parallel execution**: Each test gets isolated transaction, enabling concurrent runs
- **Simplicity**: No need to track which tables to clean up
- **Industry standard**: Common pattern in database testing

**Consequences**:

- Each test runs in a transaction that never commits
- Tests cannot verify commit-dependent behavior (rare case)
- Requires database connection wrapper to inject transaction
- All test database operations must use the transaction-wrapped client

**Alternatives Considered**:

- **Manual cleanup**: Rejected - error-prone, slower, risk of leftover data
- **Database reset per test**: Rejected - very slow, breaks parallel execution
- **Separate test database per test**: Rejected - resource intensive, complex setup
- **In-memory database**: Rejected - doesn't match production PostgreSQL behavior

#### AD-2A.2.S7.2: 80% Coverage Threshold for Utility Functions

**Scope**: Story-specific (test coverage requirements)

**Decision**: Enforce 80% minimum test coverage for utility functions in the database package.

**Rationale**:

- **Quality baseline**: Ensures most code paths are tested
- **Regression prevention**: Catches breaking changes early
- **Documentation value**: Tests serve as usage examples
- **Reasonable target**: 100% coverage often yields diminishing returns

**Consequences**:

- Coverage enforced by Vitest configuration and CI checks
- Requires writing tests for error paths and edge cases
- Some utility code (like logging) may need coverage exclusion
- Failing coverage breaks CI build

**Alternatives Considered**:

- **100% coverage**: Rejected - diminishing returns, hard to maintain
- **No threshold**: Rejected - allows untested code to merge
- **Lower threshold (60-70%)**: Rejected - too many gaps in critical infrastructure

## Out of Scope

The following items are explicitly NOT part of this story:

- **Product-specific schema tests** - Deferred to Epic 2B.1 (Product Database Schema)
- **Load testing / stress testing** - Not required for MVP; deferred to performance epic
- **Mutation testing** - Advanced testing technique; not required for initial implementation
- **Database backup/restore testing** - Handled by Neon/Supabase platform
- **Snapshot testing for schemas** - Over-engineered; migrations provide schema versioning
- **Browser-based E2E tests** - Covered by separate E2E testing epic

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S5: Create Seed Script Framework** - Tests use seed framework to generate test data
- **S6: Implement Generic Utility Functions** - Tests verify utility function correctness

### Enables (Unblocks These Stories)

- **S8: Create Documentation and Examples** - Tests serve as code examples for documentation

## References

### Epic & TAD References

- [EPIC.md: Acceptance Criteria](./EPIC.md#acceptance-criteria) - Test suite achieves 80% coverage requirement
- [TAD: Testing Architecture](/docs/2-technical/2-tad.md#testing-architecture)

### ADR References

- [ADR-005: Drizzle ORM](/docs/2-technical/adr/005-drizzle-orm.md) - Database testing patterns

### External Documentation

- [Vitest Getting Started](https://vitest.dev/guide/)
- [Vitest Configuration](https://vitest.dev/config/)
- [Drizzle Testing Best Practices](https://orm.drizzle.team/docs/testing)

## Verification Checklist

### Pre-Verification

- [ ] S5 (Seed Framework) completed and functional
- [ ] S6 (Utility Functions) completed and exported
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] Test database configured via DATABASE_URL_TEST

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors (`pnpm lint`)
- [ ] Types compile successfully (`pnpm tsc --noEmit`)
- [ ] All tests passing (`pnpm test`)
- [ ] Coverage > 80% for utility functions (`pnpm test --coverage`)

### Documentation

- [ ] Test file documentation explains what is being tested
- [ ] Complex test setup has explanatory comments
- [ ] README updated with test running instructions

### Git Hygiene

- [ ] Conventional commit message used
- [ ] No unrelated changes included
- [ ] PR description references this story

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
