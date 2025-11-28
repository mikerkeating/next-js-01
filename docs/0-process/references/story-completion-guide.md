# Story Completion Guide

This guide describes what sections to **add to the story file itself** when implementation is complete.
Do NOT create a separate completion report file.

## Quick Reference

When a story is complete, update these sections in the story file:

1. **Status** - Mark as Complete with date
2. **Acceptance Criteria** - Check off completed items
3. **Verification Checklist** - Check off completed items
4. **Completion Notes** - Add new section with results (see below)

---

## Completion Notes Section

Add this section at the end of the story file (before any Appendix):

```markdown
## Completion Notes

### Summary

[2-3 sentences: What was built, key outcomes, any deviations from plan]

### Test Results

| Test       | Command           | Result         |
| ---------- | ----------------- | -------------- |
| Lint       | `pnpm lint`       | Pass           |
| Types      | `pnpm type-check` | Pass           |
| Unit Tests | `pnpm test`       | Pass (N tests) |
| Build      | `pnpm build`      | Pass           |

### Files Changed

Beyond planned files, list any additional files created/modified:

- `path/to/file.ts` - [reason for addition/change]

### Known Issues

(Include if any issues remain)

- **Issue**: [Description]
  - **Severity**: LOW/MEDIUM/HIGH
  - **Status**: Deferred/Workaround
  - **Tracking**: Story ID or issue #

### Lessons Learned

(Include if insights gained)

- [Technical insight or process improvement for future stories]
```

---

## Optional Sections

Add these subsections within Completion Notes when applicable:

### Performance Metrics (for performance-critical stories)

```markdown
### Performance Metrics

| Metric             | Target | Actual | Status |
| ------------------ | ------ | ------ | ------ |
| API Latency (p95)  | <200ms | 150ms  | Pass   |
| Bundle Size (gzip) | <200KB | 180KB  | Pass   |
| LCP                | <2.5s  | 1.8s   | Pass   |
```

### Test Coverage (for testing stories)

```markdown
### Test Coverage

| Metric     | Target | Actual | Status |
| ---------- | ------ | ------ | ------ |
| Statements | >80%   | 96.84% | Pass   |
| Branches   | >80%   | 93.9%  | Pass   |
| Functions  | >80%   | 98.68% | Pass   |
| Lines      | >80%   | 96.84% | Pass   |
```

### Security Validation (REQUIRED for auth/data/API stories)

Include for:

- Authentication/Authorization stories (Epic 2A.7)
- Database/Data model stories (Epic 2A.2)
- API endpoint stories
- Middleware stories (Epic 2A.6)
- User input handling stories

```markdown
### Security Validation

- [x] Input validation with Zod schemas
- [x] SQL injection prevention (Drizzle parameterized queries)
- [x] XSS prevention (React escaping)
- [x] Authentication checks (Clerk protected routes)
- [x] Authorization checks (RBAC + org scoping)
- [x] Error messages don't leak sensitive data
- [x] Secrets not in code/logs
```

### Automation Created (if scripts/tools were built)

```markdown
### Automation Created

- **Script**: `scripts/{name}.sh`
- **Purpose**: [What it automates]
- **Usage**: `pnpm {command}`
```

---

## Section Requirements by Story Type

| Section         | Implementation | Testing  | Documentation | Setup    | Integration |
| --------------- | -------------- | -------- | ------------- | -------- | ----------- |
| Summary         | Required       | Required | Required      | Required | Required    |
| Test Results    | Required       | Required | Optional      | Required | Required    |
| Files Changed   | If different   | If diff  | If diff       | If diff  | If diff     |
| Known Issues    | If any         | If any   | If any        | If any   | If any      |
| Lessons Learned | Recommended    | Rec      | Rec           | Rec      | Rec         |
| Performance     | If applicable  | Required | N/A           | N/A      | If appl.    |
| Security        | For auth/data  | N/A      | N/A           | N/A      | For APIs    |
| Coverage        | If applicable  | Required | N/A           | N/A      | N/A         |

---

## Common Commands Reference

```bash
# Pre-commit validation (all must pass)
pnpm lint          # 0 errors, 0 warnings
pnpm type-check    # 0 errors
pnpm test          # all passing
pnpm build         # successful

# Full CI simulation
turbo run lint type-check test build

# Package-specific testing
turbo run test --filter=@repo/{package}

# E2E tests
pnpm test:e2e

# Coverage report
pnpm test:coverage

# Database operations
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

---

## Monorepo File Locations

```
apps/
  routing/           # Main routing layer
  api/               # REST API endpoints
  cdn/               # Static asset delivery
  docs/              # Documentation site

packages/
  config/            # Shared configs (TS, ESLint, Tailwind)
  database/          # Drizzle schema & utilities
  auth/              # Clerk integration
  ui/                # shadcn/ui components
  analytics/         # PostHog/GA4 tracking
  observability/     # Logging & error tracking
  middleware/        # Next.js middleware
  api-client/        # Type-safe API client
  testing/           # Test utilities

docs/
  0-process/         # Workflow & process docs
  1-product/         # PRD, roadmap
  2-technical/       # TAD, ADRs, references
  3-epics/           # Epic & story specifications
```

---

## Package-Specific Notes

When completing stories for specific packages, include relevant details:

| Package             | Include in Completion Notes                          |
| ------------------- | ---------------------------------------------------- |
| @repo/config        | Config exports added, environment schema changes     |
| @repo/database      | Schema changes, migrations run, seed updates         |
| @repo/auth          | Clerk config changes, protected routes, webhooks     |
| @repo/ui            | Components exported, Storybook stories, a11y results |
| @repo/analytics     | Events tracked, provider config                      |
| @repo/observability | Logging config, Sentry setup, health checks          |

---

## Example: Minimal Completion Notes

For a simple story:

```markdown
## Completion Notes

### Summary

Implemented the health check endpoint returning JSON status. All acceptance criteria met without deviation from the original plan.

### Test Results

| Test       | Command           | Result         |
| ---------- | ----------------- | -------------- |
| Lint       | `pnpm lint`       | Pass           |
| Types      | `pnpm type-check` | Pass           |
| Unit Tests | `pnpm test`       | Pass (3 tests) |
| Build      | `pnpm build`      | Pass           |
```

## Example: Comprehensive Completion Notes

For a complex story with issues and learnings:

```markdown
## Completion Notes

### Summary

Implemented multi-tenant database schema with Drizzle ORM. Added Organisation scoping to all queries. Deviated from plan by using composite indexes instead of separate indexes for better query performance.

### Test Results

| Test       | Command           | Result          |
| ---------- | ----------------- | --------------- |
| Lint       | `pnpm lint`       | Pass            |
| Types      | `pnpm type-check` | Pass            |
| Unit Tests | `pnpm test`       | Pass (24 tests) |
| Build      | `pnpm build`      | Pass            |

### Files Changed

Beyond planned:

- `packages/database/src/utils/tenant-context.ts` - Added tenant context helper
- `turbo.json` - Added db:migrate task

### Security Validation

- [x] Input validation with Zod schemas
- [x] SQL injection prevention (Drizzle parameterized queries)
- [x] Authorization checks (org scoping on all queries)
- [x] Error messages don't leak tenant data

### Performance Metrics

| Metric           | Target | Actual | Status |
| ---------------- | ------ | ------ | ------ |
| Query time (p95) | <50ms  | 12ms   | Pass   |
| Migration time   | <30s   | 8s     | Pass   |

### Known Issues

- **Issue**: Hot reload doesn't pick up schema changes
  - **Severity**: LOW
  - **Status**: Workaround (restart dev server)
  - **Tracking**: Deferred to 2A.2.S8

### Lessons Learned

- Composite indexes in Drizzle require explicit column ordering - document in TAD
- `pnpm drizzle-kit push` is faster than generate+migrate for dev iteration
```
