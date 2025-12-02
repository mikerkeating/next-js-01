# Epic Completion Guide

This guide describes what sections to **add to the EPIC.md file itself** when implementation is complete.
Do NOT create a separate completion report file - use the epic-eval.md for evaluation purposes.

## Quick Reference

When an epic is complete, update these sections in the EPIC.md file:

1. **Status** - Mark as Complete with date
2. **Acceptance Criteria** - Check off all completed items
3. **Stories Table** - Update all story statuses
4. **Epic Completion Notes** - Add new section with results (see below)

---

## Epic Completion Notes Section

Add this section at the end of the EPIC.md file (before any Appendix):

```markdown
## Epic Completion Notes

### Summary

[2-3 sentences: What was delivered, key outcomes, any deviations from the original plan]

### Acceptance Criteria Verification

| Criterion                     | Status                | Evidence                            |
| ----------------------------- | --------------------- | ----------------------------------- |
| [Criterion 1 from AC section] | Pass                  | [How verified - test, demo, metric] |
| [Criterion 2 from AC section] | Pass                  | [How verified]                      |
| [Criterion N from AC section] | Pass/Partial/Deferred | [How verified or reason for status] |

### Test Results

| Test              | Command                 | Result         |
| ----------------- | ----------------------- | -------------- |
| Lint              | `pnpm lint`             | Pass           |
| Types             | `pnpm type-check`       | Pass           |
| Unit Tests        | `pnpm test`             | Pass (N tests) |
| Integration Tests | `pnpm test:integration` | Pass (N tests) |
| E2E Tests         | `pnpm test:e2e`         | Pass (N tests) |
| Build             | `pnpm build`            | Pass           |

### Story Delivery Summary

| Story | Title   | Status            | Notes                |
| ----- | ------- | ----------------- | -------------------- |
| S1    | [Title] | Complete          | -                    |
| S2    | [Title] | Complete          | -                    |
| S{N}  | [Title] | Complete/Deferred | [Reason if deferred] |

**Stories Completed**: {N}/{Total}
**Deferred Stories**: [List if any, with tracking references]

### Key Deliverables

List the concrete outputs of this epic:

- **[Package/Feature 1]**: [Brief description of what was delivered]
- **[Package/Feature 2]**: [Brief description]
- **[Documentation]**: [What docs were created/updated]

### Metrics Achieved

(Include if epic had measurable targets)

| Metric               | Target         | Actual         | Status    |
| -------------------- | -------------- | -------------- | --------- |
| [Performance metric] | [Target value] | [Actual value] | Pass/Fail |
| [Coverage metric]    | [Target %]     | [Actual %]     | Pass/Fail |
| [Other KPI]          | [Target]       | [Actual]       | Pass/Fail |

### Deferred Items

(Include if any acceptance criteria or stories were deferred)

| Item                       | Reason         | Tracking                                   |
| -------------------------- | -------------- | ------------------------------------------ |
| [Deferred criterion/story] | [Why deferred] | [Epic/Story ID where it will be addressed] |

### Known Issues

(Include if any issues remain)

- **Issue**: [Description]
  - **Severity**: LOW/MEDIUM/HIGH
  - **Impact**: [What functionality is affected]
  - **Workaround**: [If any]
  - **Tracking**: [Story ID or issue #]

### Lessons Learned

(Include technical insights and process improvements)

- **Technical**: [Insight about architecture, tools, or implementation]
- **Process**: [Insight about workflow, estimation, or planning]
- **Documentation**: [Updates needed to TAD, ADRs, or other docs]

### Dependencies Delivered

List what this epic now enables for downstream work:

- **[Epic ID]**: [What this epic unblocks for that epic]
- **[Package/Feature]**: [What can now be built on top of this work]
```

---

## Optional Sections

Add these subsections within Epic Completion Notes when applicable:

### Security Validation (REQUIRED for auth/data/API epics)

Include for epics involving:

- Authentication/Authorization (Epic 2A.7)
- Database/Data models (Epic 2A.2)
- API endpoints
- Middleware
- User input handling

```markdown
### Security Validation

- [x] All database queries use parameterized queries (Drizzle ORM)
- [x] Input validation implemented with Zod schemas
- [x] XSS prevention via React escaping
- [x] CSRF protection configured
- [x] Authentication required for protected routes
- [x] Authorization checks (RBAC/org scoping) implemented
- [x] Secrets stored in environment variables, not in code
- [x] Error messages don't leak sensitive information
- [x] Audit logging for sensitive operations
- [x] Security scan passing (pnpm audit)
```

### Performance Validation (for infrastructure/performance epics)

```markdown
### Performance Validation

| Metric              | Baseline | Target | Achieved | Status |
| ------------------- | -------- | ------ | -------- | ------ |
| Build time (cold)   | N/A      | <5min  | 3.2min   | Pass   |
| Build time (cached) | N/A      | <1min  | 45s      | Pass   |
| API latency (p95)   | N/A      | <200ms | 150ms    | Pass   |
| Bundle size (gzip)  | N/A      | <200KB | 180KB    | Pass   |
```

### Integration Verification (for integration epics)

```markdown
### Integration Verification

| Integration Point          | Type    | Status | Notes                     |
| -------------------------- | ------- | ------ | ------------------------- |
| [Service A] → [Service B]  | API     | Pass   | Verified via E2E tests    |
| [Package A] → [Package B]  | Import  | Pass   | Type-safe exports working |
| [App] → [External Service] | Webhook | Pass   | Tested in staging         |
```

### Migration Summary (for migration epics)

```markdown
### Migration Summary

| Migration          | From         | To           | Status   | Rollback Tested |
| ------------------ | ------------ | ------------ | -------- | --------------- |
| [Schema migration] | v1.0         | v2.0         | Complete | Yes             |
| [Data migration]   | [Old format] | [New format] | Complete | N/A             |

**Data Migrated**: [N records/entities]
**Migration Duration**: [Time]
**Rollback Procedure**: [Reference to runbook or steps]
```

---

## Section Requirements by Epic Type

| Section                  | Foundation     | Feature        | Integration    | Migration      |
| ------------------------ | -------------- | -------------- | -------------- | -------------- |
| Summary                  | Required       | Required       | Required       | Required       |
| AC Verification          | Required       | Required       | Required       | Required       |
| Test Results             | Required       | Required       | Required       | Required       |
| Story Delivery           | Required       | Required       | Required       | Required       |
| Key Deliverables         | Required       | Required       | Required       | Required       |
| Metrics Achieved         | If targets set | If targets set | If targets set | If targets set |
| Deferred Items           | If any         | If any         | If any         | If any         |
| Known Issues             | If any         | If any         | If any         | If any         |
| Lessons Learned          | Recommended    | Recommended    | Recommended    | Recommended    |
| Dependencies Delivered   | Required       | If applicable  | Required       | If applicable  |
| Security Validation      | For auth/data  | For auth/data  | Required       | For auth/data  |
| Performance Validation   | If applicable  | If applicable  | If applicable  | N/A            |
| Integration Verification | N/A            | If applicable  | Required       | N/A            |
| Migration Summary        | N/A            | N/A            | N/A            | Required       |

---

## Status Tracking

Update the Status section at the top of the EPIC.md:

```markdown
## Status

| Field            | Value                                     |
| ---------------- | ----------------------------------------- |
| State            | Complete                                  |
| Started          | YYYY-MM-DD                                |
| Completed        | YYYY-MM-DD                                |
| Stories Complete | {N}/{N}                                   |
| PR               | [Link to epic branch PR or merge commits] |
```

---

## Verification Checklist

Before marking an epic as complete, verify:

### Acceptance Criteria

- [ ] All acceptance criteria have been verified (or explicitly deferred with tracking)
- [ ] Verification evidence documented for each criterion
- [ ] No criterion marked as partial without justification

### Stories

- [ ] All stories marked as Complete (or explicitly deferred)
- [ ] All story completion notes added
- [ ] Deferred stories have tracking references

### Code Quality

- [ ] `pnpm lint` passes with 0 errors, 0 warnings
- [ ] `pnpm type-check` passes with 0 errors
- [ ] `pnpm test` passes (all applicable tests)
- [ ] `pnpm build` succeeds

### Documentation

- [ ] Epic completion notes added to EPIC.md
- [ ] TAD updated if architectural changes were made
- [ ] ADRs created for significant decisions
- [ ] README files updated for new packages
- [ ] API documentation updated

### Integration

- [ ] Changes integrated to development branch
- [ ] No regressions in dependent packages
- [ ] Downstream epics unblocked as expected

---

## Example: Minimal Epic Completion Notes

For a small epic with straightforward delivery:

```markdown
## Epic Completion Notes

### Summary

Implemented the @repo/config package providing centralized TypeScript, ESLint, Prettier, and Tailwind configurations. All 7 stories completed without deviation from the original plan.

### Acceptance Criteria Verification

| Criterion                                    | Status | Evidence                                     |
| -------------------------------------------- | ------ | -------------------------------------------- |
| Packages can extend shared TypeScript config | Pass   | apps/routing extends base.json successfully  |
| ESLint runs consistently across monorepo     | Pass   | `pnpm lint` works in all packages            |
| Prettier formatting uniform                  | Pass   | `pnpm format` formats all files consistently |
| Tailwind theme tokens shared                 | Pass   | apps/routing uses shared tokens              |

### Test Results

| Test       | Command           | Result           |
| ---------- | ----------------- | ---------------- |
| Lint       | `pnpm lint`       | Pass             |
| Types      | `pnpm type-check` | Pass             |
| Unit Tests | `pnpm test`       | Pass (147 tests) |
| Build      | `pnpm build`      | Pass             |

### Story Delivery Summary

| Story | Title             | Status   |
| ----- | ----------------- | -------- |
| S1    | Package Structure | Complete |
| S2    | TypeScript Config | Complete |
| S3    | ESLint Config     | Complete |
| S4    | Prettier Config   | Complete |
| S5    | Tailwind Config   | Complete |
| S6    | Integration       | Complete |
| S7    | Tests & Docs      | Complete |

**Stories Completed**: 7/7

### Key Deliverables

- **@repo/config package**: Centralized configuration with exports for all tooling
- **Documentation**: README.md and API.md with usage examples
- **Test coverage**: 100% coverage on src/ files
```

---

## Example: Comprehensive Epic Completion Notes

For a complex epic with deferred items and lessons learned:

```markdown
## Epic Completion Notes

### Summary

Established the CI/CD pipeline with automated PR checks, Turborepo filtering, preview deployments, and Dependabot configuration. 6 of 7 stories completed; S6 (Branch Protection) explicitly deferred pending admin access. The pipeline achieves >50% CI time reduction via Turborepo filtering and provides automated quality gates for all PRs.

### Acceptance Criteria Verification

| Criterion                             | Status   | Evidence                              |
| ------------------------------------- | -------- | ------------------------------------- |
| Every PR triggers automated checks    | Pass     | PR workflow runs on all PRs           |
| Cannot merge until checks pass        | Deferred | Requires S6 branch protection         |
| Turborepo filtering reduces CI >50%   | Pass     | Measured 62% reduction on typical PRs |
| Coverage report appears on PRs        | Pass     | Sticky comment updates on each push   |
| Preview URL posted within 5 min       | Pass     | Average 2.3 min deployment time       |
| Development merge triggers full suite | Pass     | Main workflow verified                |
| Dependabot creates weekly PRs         | Pass     | Configured with 8 dependency groups   |
| CI completes <10 min full run         | Pass     | 8.2 min average                       |

### Test Results

| Test       | Command           | Result          |
| ---------- | ----------------- | --------------- |
| Lint       | `pnpm lint`       | Pass            |
| Types      | `pnpm type-check` | Pass            |
| Unit Tests | `pnpm test`       | Pass (89 tests) |
| E2E Tests  | `pnpm test:e2e`   | Pass (12 tests) |
| Build      | `pnpm build`      | Pass            |

### Story Delivery Summary

| Story | Title               | Status   | Notes                          |
| ----- | ------------------- | -------- | ------------------------------ |
| S1    | PR Workflow         | Complete | -                              |
| S2    | Turborepo Filtering | Complete | -                              |
| S3    | Coverage Reporting  | Complete | Threshold enforcement deferred |
| S4    | Preview & E2E       | Complete | Custom wait-for-vercel action  |
| S5    | Main Workflow       | Complete | -                              |
| S6    | Branch Protection   | Deferred | Pending admin access           |
| S7    | Dependabot          | Complete | -                              |

**Stories Completed**: 6/7
**Deferred Stories**: S6 → Tracking in Epic 2A.1 Phase 2

### Key Deliverables

- **PR Workflow**: `.github/workflows/pr.yml` with lint, type-check, test, build
- **Main Workflow**: `.github/workflows/main.yml` with staging deployment
- **Dependabot Config**: `.github/dependabot.yml` with auto-merge for patches
- **Custom Actions**: `.github/actions/wait-for-vercel` for preview URL detection

### Metrics Achieved

| Metric             | Target  | Actual  | Status |
| ------------------ | ------- | ------- | ------ |
| CI time (full)     | <10 min | 8.2 min | Pass   |
| CI time (filtered) | <5 min  | 3.1 min | Pass   |
| Coverage threshold | >80%    | 87%     | Pass   |

### Deferred Items

| Item                           | Reason                       | Tracking          |
| ------------------------------ | ---------------------------- | ----------------- |
| S6 Branch Protection           | Requires GitHub admin access | Epic 2A.1 Phase 2 |
| Coverage threshold enforcement | Needs base branch caching    | S3 follow-up      |

### Known Issues

- **Issue**: Preview URL occasionally takes longer than 5 min on large PRs
  - **Severity**: LOW
  - **Impact**: E2E tests may timeout on first attempt
  - **Workaround**: Retry logic implemented in workflow
  - **Tracking**: Monitoring for pattern

### Lessons Learned

- **Technical**: Turborepo's `--filter=[HEAD^1]` requires careful configuration for merge commits
- **Process**: Deferring branch protection was correct - avoids blocking pipeline setup on admin access
- **Documentation**: Workflow documentation should include secret requirements upfront

### Dependencies Delivered

- **Epic 2A.2 (Database)**: Can now rely on CI pipeline for PR validation
- **All Phase 2 Epics**: Automated quality checks enable faster iteration
```

---

## Common Commands Reference

```bash
# Pre-completion validation (all must pass)
pnpm lint              # 0 errors, 0 warnings
pnpm type-check        # 0 errors
pnpm test              # all passing
pnpm build             # successful

# Full CI simulation
turbo run lint type-check test build

# Package-specific testing
turbo run test --filter=@repo/{package}

# E2E tests
pnpm test:e2e

# Coverage report
pnpm test:coverage

# Security scan
pnpm audit --audit-level=high
```

---

## Relationship to Other Documents

| Document                         | Purpose                                               |
| -------------------------------- | ----------------------------------------------------- |
| **story-completion-guide.md**    | What to add to story files when stories complete      |
| **epic-completion-guide.md**     | What to add to EPIC.md when epic completes (this doc) |
| **epic-story-check-template.md** | Template for pre-implementation story evaluation      |
| **epic-eval.md**                 | Post-implementation evaluation (created per epic)     |
| **epic-acceptance-criteria.md**  | Standards for writing epic acceptance criteria        |
