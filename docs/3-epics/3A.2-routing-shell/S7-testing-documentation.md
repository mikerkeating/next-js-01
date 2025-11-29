# Story 3A.2.S7: Testing and Documentation

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Routing Application Shell](./EPIC.md)
- **Depends On**: [S6: Create Responsive Shell Layout](./S6-responsive-shell.md)
- **Blocks**: None (final story in epic)
- **Runs in Parallel With**: None (requires complete routing shell)

## User Story

**As a** Platform Engineer
**I want** comprehensive tests, Lighthouse CI checks, and complete documentation for the routing shell
**So that** the routing application is production-ready with verified quality gates, maintainable code, and clear documentation for future development

## Acceptance Criteria

- [ ] Integration tests verify routing shell components interact correctly with rewrite framework, SEO utilities, analytics, and CDN
- [ ] E2E smoke tests validate critical user journeys across the routing shell
- [ ] Lighthouse CI workflow runs on every PR and enforces SEO > 90, Accessibility = 100, Performance > 90
- [ ] Test coverage > 80% for routing shell components and utilities
- [ ] All tests pass in CI pipeline without flakiness
- [ ] README.md documents routing shell architecture, configuration, and usage patterns
- [ ] Architecture decisions from S1-S6 consolidated into EPIC.md
- [ ] Developer onboarding documentation includes routing shell setup and development workflow
- [ ] Epic acceptance criteria validated and marked complete

## Technical Requirements

### Files to Create

| Path                                                      | Purpose                                          |
| --------------------------------------------------------- | ------------------------------------------------ |
| `apps/routing/tests/integration/shell-layout.test.tsx`    | Integration tests for complete shell layout      |
| `apps/routing/tests/integration/navigation.test.tsx`      | Navigation integration with rewrite framework    |
| `apps/routing/tests/integration/seo-analytics.test.tsx`   | SEO and analytics integration tests              |
| `apps/routing/tests/integration/cdn-assets.test.tsx`      | CDN asset integration tests                      |
| `apps/routing/tests/e2e/smoke-tests.spec.ts`              | Critical user journey E2E tests                  |
| `.github/workflows/lighthouse-ci.yml`                     | Lighthouse CI workflow for quality gates         |
| `apps/routing/lighthouserc.js`                            | Lighthouse CI configuration                      |
| `apps/routing/README.md`                                  | Routing application documentation                |
| `apps/routing/docs/DEVELOPMENT.md`                        | Developer setup and workflow guide               |
| `apps/routing/docs/ARCHITECTURE.md`                       | Architecture overview and component relationships |
| `apps/routing/tests/setup/test-utils.tsx`                 | Shared test utilities and helpers                |
| `apps/routing/tests/setup/mocks.ts`                       | Mock data and factories for tests                |

### Files to Modify

| Path                                          | Changes                                              |
| --------------------------------------------- | ---------------------------------------------------- |
| `apps/routing/package.json`                   | Add test scripts and Lighthouse CI dependencies      |
| `apps/routing/vitest.config.ts`               | Configure integration test environment               |
| `apps/routing/playwright.config.ts`           | Configure E2E test settings                          |
| `docs/3-epics/3A.2-routing-shell/EPIC.md`     | Update status, consolidate architecture decisions    |
| `.github/workflows/ci.yml`                    | Add routing shell test jobs                          |
| `turbo.json`                                  | Add test and lighthouse tasks                        |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# Navigate to apps/routing
cd apps/routing

# Install Lighthouse CI
pnpm add -D @lhci/cli

# Install additional testing utilities
pnpm add -D @testing-library/user-event
pnpm add -D @axe-core/playwright

# Install at workspace root for GitHub Actions
pnpm add -D @lhci/cli -w
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting                      | Requirement                                                  | TAD Reference                                                                 |
| ---------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| Lighthouse SEO threshold     | Assert score > 90                                            | [TAD: Testing - E2E](/docs/2-technical/2-tad-testing.md#e2e-tests)            |
| Lighthouse Accessibility     | Assert score = 100 (WCAG 2.1 Level AA)                       | [TAD: Testing - Accessibility](/docs/2-technical/2-tad-testing.md#accessibility-testing) |
| Lighthouse Performance       | Assert score > 90 for production builds                      | [TAD: Performance Targets](/docs/2-technical/2-tad.md#performance-targets)    |
| Test coverage threshold      | Minimum 80% for statements, branches, functions, lines       | [TAD: Testing - Unit Tests](/docs/2-technical/2-tad-testing.md#unit-tests)    |
| E2E test timeout             | 30 seconds per test, 60 seconds for navigation-heavy tests   | [TAD: Testing - E2E](/docs/2-technical/2-tad-testing.md#e2e-tests)            |
| Integration test environment | Use test database, mock external services (analytics, auth)  | [TAD: Testing - Integration](/docs/2-technical/2-tad-testing.md#integration-tests) |

**Configuration Rationale**:
- Lighthouse CI ensures quality gates are enforced automatically on every PR
- High accessibility score (100) demonstrates WCAG 2.1 Level AA compliance commitment
- Performance threshold ensures responsive user experience across devices
- Coverage thresholds prevent untested code from reaching production
- Reasonable timeouts balance test reliability with CI pipeline speed

For complete Lighthouse CI configuration templates, see: [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md)

## Test Requirements

### Manual Verification

- [ ] **End-to-End Smoke Test**: Navigate through routing shell manually at localhost:3000, verify layout renders, navigation works, no console errors
- [ ] **Lighthouse Audit**: Run `pnpm lighthouse http://localhost:3000` and verify SEO > 90, Accessibility = 100, Performance > 90
- [ ] **Responsive Testing**: Test shell at 320px, 768px, 1024px, 1536px viewports and verify layout adapts correctly
- [ ] **Documentation Review**: Read through README.md, DEVELOPMENT.md, ARCHITECTURE.md and verify clarity, completeness, accuracy
- [ ] **CI Pipeline**: Push PR and verify Lighthouse CI job runs successfully and reports scores

### Automated Tests

- [ ] Integration: `shell-layout.test.tsx` - Shell layout integrates Header, Footer, navigation, and content areas correctly
- [ ] Integration: `navigation.test.tsx` - Navigation links work with rewrite framework from S2
- [ ] Integration: `seo-analytics.test.tsx` - SEO meta tags from S3 and analytics from S4 render correctly
- [ ] Integration: `cdn-assets.test.tsx` - CDN images and assets from S5 load with proper cache headers
- [ ] E2E: `smoke-tests.spec.ts` - Critical user journeys (home page, navigation, responsive layout) work end-to-end
- [ ] Unit: Coverage report shows > 80% coverage for routing shell codebase

### Integration Tests

- [ ] Complete shell layout renders with Header, Footer, MainNav, and Container components integrated correctly
- [ ] Navigation clicks trigger rewrite logic and update active link state
- [ ] SEO meta tags populate correctly in document head for different pages
- [ ] Analytics events fire when navigation occurs
- [ ] CDN assets render with content-hashed URLs and immutable cache headers
- [ ] Mobile navigation drawer opens/closes correctly and is accessible via keyboard
- [ ] Responsive breakpoints apply correct layouts at sm, md, lg, xl, 2xl viewports
- [ ] Lighthouse accessibility tree includes proper landmark regions (header, nav, main, footer)

### Verification Commands

```bash
# Run all routing shell tests
cd apps/routing
pnpm test

# Run integration tests only
pnpm test:integration

# Run E2E smoke tests
pnpm test:e2e

# Generate coverage report
pnpm test:coverage

# Run Lighthouse CI locally
pnpm lighthouse:ci

# Verify build succeeds
pnpm build

# Type check
pnpm type-check

# Lint check
pnpm lint

# Run all quality checks
pnpm test && pnpm type-check && pnpm lint && pnpm build
```

## Implementation Notes

### Implementation Sequence

1. **Set Up Test Infrastructure**
   - Create test utilities and shared mocks in `tests/setup/`
   - Configure Vitest for integration tests
   - Configure Playwright for E2E tests
   - Add test scripts to package.json

2. **Write Integration Tests**
   - Test shell layout component integration
   - Test navigation with rewrite framework
   - Test SEO and analytics integration
   - Test CDN asset integration
   - Verify responsive behavior at different breakpoints

3. **Write E2E Smoke Tests**
   - Critical user journey: Home page loads and renders
   - Critical user journey: Navigation works across pages
   - Critical user journey: Responsive layout adapts on mobile
   - Use Playwright for real browser testing
   - Keep tests focused and fast (< 30 seconds each)

4. **Set Up Lighthouse CI**
   - Create Lighthouse CI configuration file
   - Define quality gate thresholds (SEO > 90, A11y = 100, Perf > 90)
   - Create GitHub Actions workflow for Lighthouse CI
   - Test locally with `pnpm lighthouse:ci`
   - Verify CI pipeline integration

5. **Generate Coverage Reports**
   - Run tests with coverage enabled
   - Verify > 80% coverage threshold met
   - Identify untested code paths and add tests if critical
   - Add coverage badges to README (optional)

6. **Write Documentation**
   - Create README.md with overview, installation, usage
   - Write DEVELOPMENT.md with setup instructions, dev workflow, testing guide
   - Write ARCHITECTURE.md with component diagram, data flow, integration points
   - Document configuration options and environment variables
   - Add links to Epic, TAD, and ADR references

7. **Consolidate Epic Documentation**
   - Review architecture decisions from S1-S6
   - Move cross-cutting decisions to TAD if needed
   - Update EPIC.md with consolidated decision references
   - Mark epic stories as complete
   - Update epic status to Complete

8. **Validate Epic Acceptance Criteria**
   - Go through each epic acceptance criterion
   - Verify with manual tests and automated checks
   - Document verification results
   - Mark epic as complete if all criteria met

### Key Concepts

- **Integration Tests**: Verify multiple components/modules work together correctly
- **E2E Tests**: Validate complete user journeys in real browser environment
- **Smoke Tests**: Minimal set of E2E tests covering critical functionality
- **Lighthouse CI**: Automated quality gates for SEO, accessibility, performance
- **Test Coverage**: Percentage of code executed during test runs
- **Quality Gates**: Automated checks that prevent low-quality code from merging

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Testing - Integration Tests](/docs/2-technical/2-tad-testing.md#integration-tests)
- [TAD: Testing - E2E Tests](/docs/2-technical/2-tad-testing.md#e2e-tests)
- [TAD: Testing - Accessibility Testing](/docs/2-technical/2-tad-testing.md#accessibility-testing)

Key pattern notes for this story:

- Use `@testing-library/react` for integration tests with user interaction simulation
- Use Playwright for E2E tests with real browser automation
- Mock external services (auth, analytics) in integration tests to avoid flakiness
- Use test database or in-memory database for integration tests
- Structure tests with Arrange-Act-Assert pattern
- Keep E2E tests focused on critical paths only (not exhaustive scenarios)

### Troubleshooting

| Issue                                      | Cause                                      | Solution                                                        |
| ------------------------------------------ | ------------------------------------------ | --------------------------------------------------------------- |
| Integration tests fail with fetch errors   | API routes not properly mocked             | Use MSW (Mock Service Worker) or vitest.mock() for API mocks    |
| E2E tests flaky or timeout                 | Race conditions, slow page loads           | Use `page.waitForLoadState()` and explicit waits                |
| Lighthouse CI fails with low scores        | Production build not optimized             | Run `pnpm build` before Lighthouse, test production server      |
| Coverage below 80% threshold               | Missing tests for components/utilities     | Identify untested files with coverage report, add tests         |
| CI pipeline Lighthouse job fails           | Missing dependencies or build artifacts    | Ensure build step runs before Lighthouse, install @lhci/cli     |
| Tests pass locally but fail in CI          | Environment differences                    | Check Node version, env vars, dependencies match CI environment |
| Documentation links broken                 | Incorrect relative paths                   | Use absolute paths from repo root, verify links with markdown linter |

### Reference Materials

- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/getting-started.md)
- [Playwright Testing Best Practices](https://playwright.dev/docs/best-practices)
- [Vitest Integration Testing Guide](https://vitest.dev/guide/)
- [Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Axe Accessibility Testing](https://www.deque.com/axe/devtools/)

## Estimated Effort

**Size**: M (7h)

**Breakdown**:

- Test infrastructure setup: 45 minutes
- Integration tests: 2 hours
- E2E smoke tests: 1.5 hours
- Lighthouse CI setup: 1 hour
- Documentation (README, DEVELOPMENT, ARCHITECTURE): 1.5 hours
- Epic consolidation and validation: 30 minutes

## Architecture Decisions

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: Testing Strategy](/docs/2-technical/2-tad-testing.md#overview) - Test pyramid approach and distribution
- [TAD: Lighthouse Quality Gates](/docs/2-technical/2-tad.md#performance-targets) - SEO, accessibility, performance thresholds
- [TAD: Test Coverage Requirements](/docs/2-technical/2-tad-testing.md#code-coverage) - Minimum 80% coverage for all packages

### Story-Specific Decisions

#### AD-3A.2.S7.1: Lighthouse CI as Quality Gate

**Scope**: Story-specific (does not affect other stories)

**Decision**: Enforce Lighthouse quality gates (SEO > 90, Accessibility = 100, Performance > 90) via GitHub Actions CI workflow that blocks merging if thresholds not met.

**Rationale**:
- Automated quality enforcement prevents regressions
- Lighthouse is industry-standard tool for web quality measurement
- GitHub Actions integration provides clear PR feedback
- Accessibility score of 100 demonstrates commitment to WCAG 2.1 Level AA compliance
- SEO and performance thresholds ensure good user experience

**Consequences**:
- PRs cannot merge if Lighthouse scores fall below thresholds
- Developers receive immediate feedback on quality regressions
- Quality gates are consistent and objective
- May require occasional threshold adjustments during development
- Ensures production-ready quality from the start

**Alternatives Considered**:
- **Option 1**: Manual Lighthouse audits - Rejected due to inconsistency and human error
- **Option 2**: Lighthouse checks without blocking - Rejected because non-blocking checks are often ignored
- **Option 3**: Different tool (e.g., Sitespeed.io) - Rejected because Lighthouse is more widely adopted and has better CI integration

#### AD-3A.2.S7.2: Integration Tests Mock External Services

**Scope**: Story-specific (does not affect other stories)

**Decision**: Integration tests mock external services (analytics, authentication, CDN) rather than testing against live services.

**Rationale**:
- Eliminates flakiness from external service downtime or rate limits
- Tests run faster without network latency
- No need for test credentials or API keys in CI
- Tests remain deterministic and reproducible
- Isolates testing to routing shell behavior

**Consequences**:
- Integration tests verify routing shell logic, not external service integration
- Separate E2E tests validate real service integration in staging environment
- Mocks must be kept in sync with real service behavior
- Tests run reliably in CI without external dependencies
- Faster feedback loop for developers

**Alternatives Considered**:
- **Option 1**: Test against live services - Rejected due to flakiness and reliance on external availability
- **Option 2**: Use staging/sandbox environments - Rejected due to complexity and still introduces network dependency
- **Option 3**: No integration tests, only unit and E2E - Rejected because integration tests catch component interaction bugs

#### AD-3A.2.S7.3: Minimal E2E Smoke Tests

**Scope**: Story-specific (does not affect other stories)

**Decision**: Implement minimal E2E smoke tests (3-5 critical paths) rather than comprehensive E2E test suite.

**Rationale**:
- E2E tests are slow and expensive to maintain
- Smoke tests catch critical failures without long CI times
- Test pyramid emphasizes more unit/integration tests, fewer E2E tests
- Critical paths cover most important user journeys (home page, navigation, responsive)
- Comprehensive E2E testing deferred to dedicated testing epic (4A.2)

**Consequences**:
- E2E test suite runs in < 2 minutes
- Critical functionality verified in real browser
- Non-critical paths covered by unit and integration tests
- Faster CI pipeline, quicker developer feedback
- May miss edge cases that would be caught by comprehensive E2E

**Alternatives Considered**:
- **Option 1**: Comprehensive E2E test suite - Rejected due to long CI times and maintenance burden
- **Option 2**: No E2E tests in routing shell - Rejected because E2E provides valuable real-world validation
- **Option 3**: Visual regression tests - Deferred to future epic (4A.3); smoke tests sufficient for initial quality gate

## Out of Scope

The following items are explicitly NOT part of this story:

- **Comprehensive E2E Test Suite** - Minimal smoke tests only; comprehensive E2E deferred to Epic 4A.2 (E2E Testing Infrastructure)
- **Visual Regression Testing** - Deferred to Epic 4A.3 (Visual Regression Testing)
- **Performance Profiling** - Basic Lighthouse performance checks only; detailed profiling deferred to performance optimization epic
- **Load Testing** - Not required for routing shell; addressed in infrastructure/scalability epic
- **Security Testing** - Basic security headers verified; comprehensive security testing in separate epic
- **Internationalization Testing** - i18n deferred to post-MVP
- **Cross-Browser Testing** - Playwright tests in Chromium only; multi-browser testing deferred to Epic 4A.2
- **API Documentation** - Routing shell has minimal API surface; API docs deferred to API-heavy epics
- **User Acceptance Testing (UAT)** - Automated tests only; UAT is separate QA phase

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S6**: Create Responsive Shell Layout - Complete shell layout required for integration and E2E testing

### Enables (Unblocks These Stories)

- **Epic 3B.3**: Routing Configuration (Product Routes) - Production-ready routing shell with quality gates enables product route development
- **Epic 4A.1**: Unit Testing Infrastructure (Vitest) - Routing shell tests serve as reference implementation for other apps
- **Epic 4A.2**: E2E Testing Infrastructure (Playwright) - Routing shell E2E tests establish patterns for other apps

## References

### Epic & TAD References

- [EPIC.md: Overview](./EPIC.md#overview)
- [EPIC.md: Acceptance Criteria](./EPIC.md#acceptance-criteria)
- [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md)
- [TAD: Performance Targets](/docs/2-technical/2-tad.md#performance-targets)
- [TAD: Documentation Standards](/docs/2-technical/2-tad.md#developer-experience)

### ADR References

- [ADR-003: Next.js 16 Framework](/docs/2-technical/adr/003-nextjs-framework.md)
- [ADR-004: Vercel Hosting](/docs/2-technical/adr/004-vercel-hosting.md)

### External Documentation

- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Playwright Documentation](https://playwright.dev)
- [Vitest Documentation](https://vitest.dev)
- [Testing Library](https://testing-library.com)
- [Web.dev: Lighthouse Scoring](https://web.dev/performance-scoring/)

## Verification Checklist

### Pre-Verification

- [ ] S6 (Responsive Shell Layout) completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] Playwright and Lighthouse CI dependencies installed
- [ ] Routing shell builds successfully

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors
- [ ] TypeScript compiles successfully
- [ ] All tests pass locally
- [ ] Test coverage > 80%
- [ ] Lighthouse SEO score > 90
- [ ] Lighthouse Accessibility score = 100
- [ ] Lighthouse Performance score > 90
- [ ] Integration tests verify component interactions
- [ ] E2E smoke tests validate critical paths
- [ ] Documentation is clear and complete

### Documentation

- [ ] README.md created with installation and usage instructions
- [ ] DEVELOPMENT.md created with developer workflow guide
- [ ] ARCHITECTURE.md created with component diagrams and relationships
- [ ] All documentation links verified and working
- [ ] Architecture decisions consolidated in EPIC.md
- [ ] Code comments added where logic isn't self-evident

### Git Hygiene

- [ ] Conventional commit message used
- [ ] No unrelated changes included
- [ ] PR description references this story
- [ ] PR title follows format: `test(3A.2.S7): add routing shell tests and documentation`

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -

## Appendix A: Lighthouse CI Configuration Template

```javascript
// apps/routing/lighthouserc.js
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm start',
      startServerReadyPattern: 'ready',
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 1.0 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

## Appendix B: Integration Test Example Structure

```typescript
// apps/routing/tests/integration/shell-layout.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import RootLayout from '@/app/layout';

describe('Shell Layout Integration', () => {
  it('renders complete shell with header, main, footer', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    // Verify landmark regions
    expect(screen.getByRole('banner')).toBeInTheDocument(); // Header
    expect(screen.getByRole('navigation')).toBeInTheDocument(); // Nav
    expect(screen.getByRole('main')).toBeInTheDocument(); // Main
    expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // Footer
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies responsive layout classes correctly', () => {
    const { container } = render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    );

    // Verify container max-width
    const main = screen.getByRole('main');
    expect(main).toHaveClass('container');
  });
});
```

## Appendix C: E2E Smoke Test Example Structure

```typescript
// apps/routing/tests/e2e/smoke-tests.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Routing Shell Smoke Tests', () => {
  test('home page loads and renders correctly', async ({ page }) => {
    await page.goto('/');

    // Verify page loaded
    await expect(page).toHaveTitle(/Home/);

    // Verify shell components visible
    await expect(page.getByRole('banner')).toBeVisible(); // Header
    await expect(page.getByRole('navigation')).toBeVisible(); // Nav
    await expect(page.getByRole('main')).toBeVisible(); // Main content
    await expect(page.getByRole('contentinfo')).toBeVisible(); // Footer
  });

  test('navigation works across pages', async ({ page }) => {
    await page.goto('/');

    // Click navigation link
    await page.getByRole('link', { name: 'About' }).click();

    // Verify navigation occurred
    await expect(page).toHaveURL(/\/about/);
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('responsive layout adapts on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Verify mobile navigation visible
    const hamburger = page.getByRole('button', { name: /menu/i });
    await expect(hamburger).toBeVisible();

    // Open mobile menu
    await hamburger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});
```
