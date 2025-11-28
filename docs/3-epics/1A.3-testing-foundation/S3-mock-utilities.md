# Story 1A.3.S3: Set Up Mock Utilities and Factories

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context
- **Epic**: [Testing Foundation](./EPIC.md)
- **Depends On**: [S1: Install and Configure Vitest](./S1-vitest-setup.md)
- **Blocks**: [S5: Create @repo/testing Package](./S5-testing-package.md)
- **Runs in Parallel With**: [S2: Configure React Testing Library](./S2-react-testing-library.md)

## User Story
**As a** developer
**I want** reusable mock utilities and data factories for testing
**So that** I can write tests with consistent, realistic test data and reliable API mocking

## Acceptance Criteria
- [ ] MSW (Mock Service Worker) is installed and configured for API request interception
- [ ] MSW handlers can be defined and used in Vitest tests
- [ ] Mock factories generate realistic test data using @faker-js/faker
- [ ] User factory creates valid user objects with optional overrides
- [ ] Organisation factory creates valid organisation objects with optional overrides
- [ ] MSW server starts before tests and resets handlers between tests
- [ ] Sample test demonstrates API mocking with MSW handler

## Technical Requirements

### Files to Create
| Path | Purpose |
|------|---------|
| `packages/testing/src/mocks/server.ts` | MSW server setup for Vitest |
| `packages/testing/src/mocks/handlers.ts` | Default MSW request handlers |
| `packages/testing/src/factories/user.ts` | User data factory |
| `packages/testing/src/factories/organisation.ts` | Organisation data factory |
| `packages/testing/src/factories/index.ts` | Factory exports barrel file |
| `packages/testing/src/mocks/index.ts` | Mock exports barrel file |
| `apps/web/src/lib/api.test.ts` | Sample test demonstrating MSW usage |

### Files to Modify
| Path | Changes |
|------|---------|
| `packages/config/vitest/base.ts` | Add MSW server setup in setupFiles |
| `packages/testing/package.json` | Add MSW and faker dependencies |
| `packages/testing/src/index.ts` | Export mocks and factories |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

```bash
pnpm add msw @faker-js/faker --filter @repo/testing
```

### Configuration Details

| Setting | Requirement | TAD Reference |
|---------|-------------|---------------|
| MSW `onUnhandledRequest` | `'bypass'` for unhandled requests in tests | [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md) |
| Faker `seed` | Consistent seed for reproducible tests | [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md) |

**Configuration Rationale**:
- MSW intercepts `fetch` requests at the network level, enabling realistic API testing
- Factories with Faker create realistic, varied test data without manual creation
- Reproducible seeds ensure deterministic tests when needed

## Test Requirements

### Manual Verification
- [ ] **MSW Interception**: Write a test that fetches `/api/users`, verify MSW handler responds
- [ ] **Factory Override**: Create user with custom email, verify override applied
- [ ] **Handler Reset**: Verify handlers reset between tests (no state leakage)

### Automated Tests
- [ ] Unit: `api.test.ts` - Verify MSW intercepts fetch request and returns mocked response
- [ ] Unit: `api.test.ts` - Verify factory creates valid user object
- [ ] Unit: `api.test.ts` - Verify factory accepts partial overrides

### Integration Tests
N/A - Mock utilities are tested via unit tests; integration with real services is out of scope.

### Verification Commands
```bash
# Run tests using mock utilities
pnpm test --filter @repo/web -- api.test.ts

# Verify MSW server starts without errors
pnpm test --filter @repo/testing
```

## Implementation Notes

### Implementation Sequence

1. **Install Dependencies**
   - Add MSW and @faker-js/faker to packages/testing

2. **Create MSW Server Setup**
   - Create `mocks/server.ts` with MSW `setupServer()`
   - Create `mocks/handlers.ts` with sample API handlers

3. **Create Data Factories**
   - Create user factory with faker-generated defaults
   - Create organisation factory with faker-generated defaults
   - Export factories from barrel file

4. **Configure Vitest Integration**
   - Update base config to start MSW server in setupFiles
   - Configure `beforeAll`, `afterEach`, `afterAll` hooks

5. **Create Sample Test**
   - Demonstrate fetch interception with MSW
   - Demonstrate factory usage for test data

### Key Concepts
- **MSW Server Mode**: Uses `setupServer()` for Node.js (Vitest runs in Node)
- **Handler Reset**: `server.resetHandlers()` between tests prevents state leakage
- **Factory Pattern**: Functions that return objects with sensible defaults and optional overrides

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:
- [TAD: Test Infrastructure](/docs/2-technical/2-tad-testing.md#test-infrastructure)
- [TAD: Test Helpers](/docs/2-technical/2-tad-testing.md#test-helpers)

Key pattern notes for this story:
- Use `http.get()`, `http.post()` from MSW for REST endpoint handlers
- Factories should accept `Partial<T>` for flexible overrides
- Set faker seed in test setup for reproducible generated data

### Troubleshooting

**Issue**: MSW doesn't intercept requests
- **Cause**: Server not started before tests run
- **Solution**: Ensure `server.listen()` called in `beforeAll` via setup file

**Issue**: Tests fail with "Request handler not found"
- **Cause**: No handler matches the request URL/method
- **Solution**: Add handler or set `onUnhandledRequest: 'bypass'` for passthrough

**Issue**: Factory generates same data every run
- **Cause**: Faker seed is set (intentional for reproducibility)
- **Solution**: Remove seed or use different seed per test file if variety needed

### Reference Materials
- [MSW Documentation](https://mswjs.io/)
- [MSW with Vitest Guide](https://mswjs.io/docs/integrations/node)
- [@faker-js/faker Documentation](https://fakerjs.dev/)

## Estimated Effort
**Size**: M (5h)

**Breakdown**:
- Install and configure MSW: 1.5h
- Create MSW server and handlers: 1h
- Create data factories: 1h
- Configure Vitest integration: 0.5h
- Testing and sample tests: 1h

## Architecture Decisions

### Consolidated Decisions (reference only)

- [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md) - MSW as API mocking solution
- [EPIC: Technology Decisions](/docs/3-epics/1A.3-testing-foundation/EPIC.md#technology-decisions) - MSW server location in packages/testing

### Story-Specific Decisions

#### AD-1A.3.S3.1: Factory Function Pattern
**Scope**: Story-specific (implementation approach for test data)

**Decision**: Use factory functions with spread overrides rather than builder pattern

**Rationale**:
- Simpler API: `createUser({ email: 'test@example.com' })`
- TypeScript inference works well with spread pattern
- Aligns with Testing Library's minimal API philosophy

**Consequences**:
- Less flexibility for complex object construction
- Simpler codebase and learning curve

**Alternatives Considered**:
- **Builder pattern**: More flexible but verbose; rejected for simplicity
- **Object Mother pattern**: Similar to factories; rejected as factories are more TypeScript-friendly

## Out of Scope

The following items are explicitly NOT part of this story:

- **renderWithProviders utility** - Handled in [S5: @repo/testing Package](./S5-testing-package.md)
- **Database test helpers** - Deferred to Epic 2A.2 (Database Infrastructure)
- **GraphQL handlers** - Not applicable; REST API only in initial scope
- **Advanced MSW scenarios (delays, errors)** - Added incrementally with feature epics
- **MSW browser mode** - Server mode only for Vitest; browser mode added with E2E if needed

## Dependencies on Other Stories

### Depends On (Must Complete First)
- **S1**: Install and Configure Vitest - MSW integrates with Vitest setup

### Enables (Unblocks These Stories)
- **S5**: @repo/testing Package - Consolidates mock utilities and factories into shared package

## References

### Epic & TAD References
- [EPIC.md: Testing Foundation](./EPIC.md)
- [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md)
- [TAD: Test Helpers](/docs/2-technical/2-tad-testing.md#test-helpers)

### ADR References
- None yet - Testing-specific ADRs may be created during implementation

### External Documentation
- [MSW Documentation](https://mswjs.io/)
- [MSW Node Integration](https://mswjs.io/docs/integrations/node)
- [MSW Request Handlers](https://mswjs.io/docs/concepts/request-handler)
- [@faker-js/faker Documentation](https://fakerjs.dev/)
- [Faker API Reference](https://fakerjs.dev/api/)

## Verification Checklist

### Pre-Verification
- [ ] S1 (Vitest Setup) completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] packages/testing package exists (may need to create if not present)

### Implementation Quality
- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors
- [ ] Types compile successfully
- [ ] MSW handlers type-safe with request/response types
- [ ] Factories return correctly typed objects

### Documentation
- [ ] Factory functions have JSDoc comments explaining usage
- [ ] MSW handlers have comments explaining mocked endpoints

### Git Hygiene
- [ ] Conventional commit message used
- [ ] No unrelated changes included
- [ ] PR description complete

## Status
- **State**: Not Started
- **PR**: -
- **Completed**: -
