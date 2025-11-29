# Story 2A.3.S2: Implement Structured Logger

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Observability Package](./EPIC.md)
- **Depends On**: [S1: Package Structure](./S1-package-structure.md)
- **Blocks**: [S3: Sentry Integration](./S3-sentry-integration.md), [S4: Error Boundary](./S4-error-boundary.md), [S5: Web Vitals Tracking](./S5-web-vitals.md), [S7: Tests and Documentation](./S7-tests-docs.md)
- **Runs in Parallel With**: None

## User Story

**As a** developer
**I want** a structured JSON logger with 5 log levels and automatic PII filtering
**So that** I can log application events consistently across all services with queryable, privacy-compliant output

## Acceptance Criteria

- [ ] Logger class supports 5 log levels (debug, info, warn, error, fatal)
- [ ] All log entries output as structured JSON with timestamp, level, service, environment, and optional trace ID
- [ ] Logger automatically hashes user IDs to prevent PII leakage
- [ ] Development mode outputs human-readable pretty-printed logs
- [ ] Production mode outputs JSON-formatted logs for Vercel ingestion
- [ ] Error and fatal logs include error details (name, message, stack, code)
- [ ] Performance metadata can be attached to log entries (duration, memory usage)
- [ ] Logger can be imported and instantiated from `@repo/observability`
- [ ] Type definitions exported for `LogEntry`, `LogLevel`, and `LogMetadata`

## Technical Requirements

### Files to Create

| Path                                           | Purpose                                    |
| ---------------------------------------------- | ------------------------------------------ |
| `packages/observability/src/logger.ts`         | Logger class implementation                |
| `packages/observability/src/logger-types.ts`   | TypeScript type definitions for logger     |
| `packages/observability/src/utils/privacy.ts`  | PII filtering utilities (user ID hashing)  |
| `packages/observability/src/utils/format.ts`   | Log formatting utilities (pretty-print)    |
| `packages/observability/__tests__/logger.test.ts` | Unit tests for logger functionality     |

### Files to Modify

| Path                                     | Changes                                                          |
| ---------------------------------------- | ---------------------------------------------------------------- |
| `packages/observability/src/index.ts`    | Export `Logger`, `LogEntry`, `LogLevel`, `LogMetadata` types     |
| `packages/observability/src/types.ts`    | Import and re-export logger types for centralized type access    |
| `packages/observability/package.json`    | Add peer dependency on `@repo/config` for environment variables  |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# Navigate to package directory
cd packages/observability

# No new production dependencies required
# Logger uses built-in Node.js and Web APIs

# Development dependencies (for testing)
pnpm add -D vitest @vitest/coverage-v8
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting                       | Requirement                                                   | TAD Reference                                                                |
| ----------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Log entry schema              | Must include all required fields per `LogEntry` interface    | [TAD: Structured Logging Schema](/docs/2-technical/2-tad-observability.md#structured-logging-schema) |
| Log levels                    | Support debug, info, warn, error, fatal with correct semantics | [TAD: Log Levels](/docs/2-technical/2-tad-observability.md#log-levels) |
| Environment detection         | Use `VERCEL_ENV` or `NODE_ENV` to determine environment      | [TAD: Observability Architecture](/docs/2-technical/2-tad-observability.md#logger-implementation) |
| User ID privacy               | Hash user IDs using SHA-256 or equivalent                     | [TAD: Privacy-First Logging](/docs/2-technical/2-tad-observability.md#overview) |
| Output format                 | JSON in production, pretty-print in development               | [TAD: Logger Implementation](/docs/2-technical/2-tad-observability.md#logger-implementation) |

**Configuration Rationale**: The structured logger provides queryable logs in production while maintaining developer-friendly output locally. User ID hashing ensures compliance with privacy regulations (GDPR, CCPA). Environment-based formatting allows Vercel to ingest JSON logs while developers see readable output. The five log levels align with industry standards and enable log retention policies (defined in Epic EPIC.md).

For complete implementation patterns, see: [TAD: Logger Implementation](/docs/2-technical/2-tad-observability.md#logger-implementation)

## Test Requirements

### Manual Verification

- [ ] **Logger Instantiation**: Create logger instance with service name and verify it logs correctly
- [ ] **Pretty-Print Format**: Run logger in development mode (`NODE_ENV=development`) and verify human-readable output
- [ ] **JSON Format**: Run logger with `NODE_ENV=production` and verify valid JSON output
- [ ] **User ID Hashing**: Log with user ID and verify it's hashed in output

### Automated Tests

- [ ] Unit: `__tests__/logger.test.ts` - Verify logger outputs JSON with correct schema
- [ ] Unit: `__tests__/logger.test.ts` - Verify all 5 log levels work correctly
- [ ] Unit: `__tests__/logger.test.ts` - Verify user IDs are hashed in log output
- [ ] Unit: `__tests__/logger.test.ts` - Verify error objects are serialized correctly
- [ ] Unit: `__tests__/logger.test.ts` - Verify performance metadata is attached correctly
- [ ] Unit: `__tests__/privacy.test.ts` - Verify user ID hashing is deterministic and secure

### Verification Commands

```bash
# Build the observability package
pnpm --filter @repo/observability build

# Run unit tests
pnpm --filter @repo/observability test

# Run tests with coverage
pnpm --filter @repo/observability test:coverage

# Type checking
pnpm --filter @repo/observability type-check

# Verify logger can be imported
node -e "import('@repo/observability').then(m => console.log('Logger:', m.Logger))"

# Test logger in development mode
NODE_ENV=development node -e "
  import('@repo/observability').then(({ Logger }) => {
    const logger = new Logger('test-service');
    logger.info('Test message', { data: { key: 'value' } });
  })
"

# Test logger in production mode
NODE_ENV=production node -e "
  import('@repo/observability').then(({ Logger }) => {
    const logger = new Logger('test-service');
    logger.info('Test message', { data: { key: 'value' } });
  })
"
```

## Implementation Notes

### Implementation Sequence

1. **Create Type Definitions**
   - Create `logger-types.ts` with `LogEntry`, `LogLevel`, `LogMetadata` interfaces
   - Ensure all required fields match TAD specification

2. **Implement Privacy Utilities**
   - Create `utils/privacy.ts` with `hashUserId()` function
   - Use Web Crypto API (browser) or Node crypto (server) for SHA-256 hashing
   - Include salt or truncation to prevent reverse lookups

3. **Implement Format Utilities**
   - Create `utils/format.ts` with `prettyPrint()` function
   - Use ANSI color codes for log level highlighting
   - Format timestamp, level, message, and metadata readably

4. **Implement Logger Class**
   - Create `logger.ts` with `Logger` class
   - Constructor accepts service name
   - Detect environment from `VERCEL_ENV` or `NODE_ENV`
   - Implement private `log()` method that all public methods call
   - Implement public methods: `debug()`, `info()`, `warn()`, `error()`, `fatal()`
   - Route error/fatal logs to Sentry integration (placeholder for S3)

5. **Update Package Exports**
   - Export `Logger` class from `src/index.ts`
   - Export all logger types from `src/index.ts`
   - Update `src/types.ts` to re-export logger types

6. **Write Unit Tests**
   - Test JSON output format and schema compliance
   - Test each log level independently
   - Test user ID hashing with mock user IDs
   - Test error serialization with various error types
   - Mock console methods to capture output for assertions

### Key Concepts

- **Structured Logging**: JSON format enables log aggregation, filtering, and querying in production monitoring tools
- **Log Levels**: Hierarchical severity levels (debug < info < warn < error < fatal) with different use cases and retention policies
- **PII Filtering**: Automatically hash or redact personally identifiable information to comply with privacy regulations
- **Environment-Aware**: Different output formats for development (human-readable) vs production (machine-parsable JSON)

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Logger Implementation](/docs/2-technical/2-tad-observability.md#logger-implementation)
- [TAD: Structured Logging Schema](/docs/2-technical/2-tad-observability.md#structured-logging-schema)

Key pattern notes for this story:

- Use a singleton pattern or factory function to create logger instances per service
- Environment detection should check `VERCEL_ENV` first (Vercel deployments), then fall back to `NODE_ENV`
- User ID hashing should be deterministic (same user ID = same hash) for correlation across logs
- Error serialization should extract `name`, `message`, `stack`, and optional `code` properties

### Troubleshooting

| Issue                                  | Cause                                       | Solution                                                       |
| -------------------------------------- | ------------------------------------------- | -------------------------------------------------------------- |
| Logger outputs undefined for metadata  | Metadata parameter not passed correctly     | Ensure metadata is optional and handle undefined gracefully    |
| Pretty-print colors don't show         | Terminal doesn't support ANSI codes         | Detect TTY support or add environment flag to disable colors   |
| User ID hash is not consistent         | Hashing algorithm uses random salt          | Use deterministic hashing without random elements              |
| Error stack traces missing in logs     | Error object not serialized correctly       | Ensure error serialization extracts `stack` property           |
| TypeScript errors importing Logger     | Package exports not configured correctly    | Verify `package.json` exports and build output matches types   |
| Tests fail with "Logger is not a constructor" | ES module import mismatch          | Use `import { Logger }` syntax, ensure package is built        |

### Reference Materials

- [Winston Logger (prior art)](https://github.com/winstonjs/winston)
- [Pino Logger (prior art)](https://getpino.io/)
- [Structured Logging Best Practices](https://www.honeycomb.io/blog/structured-logging-and-your-team)
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)

## Estimated Effort

**Size**: M (4-8h)

**Breakdown**:

- Type definitions and interfaces: 0.5h
- Privacy utilities (user ID hashing): 1h
- Format utilities (pretty-print): 1h
- Logger class implementation: 2h
- Unit tests: 1.5h
- Integration with package exports: 0.5h
- Manual verification and debugging: 1.5h

## Architecture Decisions

**Consolidated Decisions** (documented in TAD/ADRs):

- [TAD: Observability Architecture](/docs/2-technical/2-tad-observability.md) - Overall logging strategy and log retention policies
- [TAD: Structured Logging Schema](/docs/2-technical/2-tad-observability.md#structured-logging-schema) - Log entry format and required fields
- [TAD: Security Architecture](/docs/2-technical/2-tad-security-architecture.md) - PII filtering requirements

**Story-Specific Decisions**:

### AD-2A.3.S2.1: User ID Hashing Method

**Scope**: Story-specific (affects logger only)

**Decision**: Use SHA-256 hashing with first 8 characters + ellipsis format (`usr_abc12345...`) for user IDs in logs.

**Rationale**:
- Balances privacy (irreversible hash) with debuggability (deterministic for correlation)
- Prefix `usr_` clearly indicates it's a user identifier
- 8 characters provides ~2^32 unique values, sufficient for collision-free correlation
- Shorter than full hash, reduces log size

**Consequences**:
- User IDs cannot be reverse-engineered from logs
- Same user ID produces same hash for log correlation
- Support staff cannot identify users from logs alone (requires separate lookup)

**Alternatives Considered**:
- **Full SHA-256 hash**: Too long (64 chars), increases log size unnecessarily
- **No hashing**: Rejected due to PII compliance requirements
- **Random IDs**: Rejected because correlation across logs would be impossible

### AD-2A.3.S2.2: Development vs Production Output Format

**Scope**: Story-specific (affects logger only)

**Decision**: Use environment variable `VERCEL_ENV` (if present) or `NODE_ENV` to determine output format. Development outputs pretty-printed logs, production outputs JSON.

**Rationale**:
- Vercel deployments set `VERCEL_ENV` (development/preview/production)
- Local development uses `NODE_ENV=development`
- Developers need readable logs; production systems need parsable JSON
- Single logger implementation handles both use cases

**Consequences**:
- Logs are human-readable in local development
- Logs are machine-parsable in Vercel production
- Developers don't need to configure output format manually

**Alternatives Considered**:
- **Always JSON**: Rejected because local development debugging is harder
- **Separate logger instances**: Rejected because it complicates usage

## Out of Scope

The following items are explicitly NOT part of this story:

- **Sentry integration** - Deferred to S3 (Sentry Integration); logger includes placeholder for error routing
- **Log transport mechanisms** - Vercel handles log ingestion; no custom transport needed
- **Log aggregation UI** - Use Vercel dashboard for log viewing
- **PostHog integration** - Deferred to Epic 2A.4 (Analytics Infrastructure)
- **Custom log filtering rules** - Use default console output; filtering happens in Vercel/Sentry
- **Performance monitoring** - Basic performance metadata supported, but APM is in S3
- **Request tracing middleware** - Trace ID support exists, but middleware to generate IDs is in Epic 2A.6 (Middleware Package)

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1: Package Structure** - Requires package directory, TypeScript config, and build tooling to implement logger

### Enables (Unblocks These Stories)

- **S3: Sentry Integration** - Logger will route error/fatal logs to Sentry SDK
- **S4: Error Boundary** - Error Boundary will use logger to log caught errors
- **S5: Web Vitals Tracking** - Web Vitals will use logger to log performance metrics
- **S7: Tests and Documentation** - Comprehensive test suite requires logger implementation complete

## References

**Internal**:
- [EPIC.md: Overview](./EPIC.md#overview), [Technical Constraints](./EPIC.md#technical-constraints)
- [TAD: Observability Architecture](/docs/2-technical/2-tad-observability.md)
- [TAD: Structured Logging Schema](/docs/2-technical/2-tad-observability.md#structured-logging-schema)
- [TAD: Logger Implementation](/docs/2-technical/2-tad-observability.md#logger-implementation)
- [TAD: Security Architecture](/docs/2-technical/2-tad-security-architecture.md)
- [Coding Standards](/docs/2-technical/references/coding-standards.md)

**External**:
- [Structured Logging Best Practices](https://www.honeycomb.io/blog/structured-logging-and-your-team)
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [Winston Logger](https://github.com/winstonjs/winston)
- [Pino Logger](https://getpino.io/)

## Verification Checklist

**Pre-Verification**:
- [ ] S1 (Package Structure) complete
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] `@repo/observability` package builds successfully

**Implementation Quality**:
- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors (`pnpm lint`)
- [ ] Types compile successfully (`pnpm type-check`)
- [ ] Tests written and passing (`pnpm test`)
- [ ] Coverage > 80% for logger code

**Documentation**:
- [ ] JSDoc comments on public Logger methods
- [ ] Type definitions include documentation comments
- [ ] README.md updated with logger usage example (if applicable)

**Git Hygiene**:
- [ ] Conventional commit message (e.g., `feat(observability): implement structured logger`)
- [ ] No unrelated changes included
- [ ] PR references Epic 2A.3.S2

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
