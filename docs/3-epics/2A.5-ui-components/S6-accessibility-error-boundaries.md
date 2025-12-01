# Story 2A.5.S6: Add Accessibility and Error Boundary Integration

> **To implement this story:** Read the Technical Requirements, enhance existing components with accessibility validation and error boundary integration following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [UI Component Library (Generic)](./EPIC.md)
- **Depends On**: [S3 - Implement Form Components](./S3-form-components.md), [S4 - Implement Layout Components](./S4-layout-components.md), [S5 - Implement Feedback Components](./S5-feedback-components.md)
- **Blocks**: [S7 - Configure Storybook and Write Documentation](./S7-storybook-docs.md)
- **Runs in Parallel With**: None (requires all component stories to complete first)

## User Story

**As a** developer building accessible applications
**I want** all UI components to meet WCAG 2.1 AA accessibility standards and gracefully handle errors
**So that** the application is usable by all users including those with disabilities, and component errors don't crash the entire application

## Acceptance Criteria

- [ ] axe-core accessibility testing configured and integrated with component test suite
- [ ] All components pass WCAG 2.1 Level AA compliance checks (no critical or serious violations)
- [ ] Keyboard navigation works for all interactive components (Button, Input, Select, Dialog, Dropdown Menu, Tabs, Toast close buttons)
- [ ] All components have proper ARIA labels, roles, and attributes
- [ ] Focus management implemented correctly for modal components (Dialog, Dropdown Menu)
- [ ] Color contrast ratios meet WCAG AA requirements (4.5:1 for normal text, 3:1 for large text and UI components)
- [ ] Error boundary component created and exported from `@repo/ui`
- [ ] Interactive components (Dialog, Dropdown, Tabs, Toast) integrate with error boundary for graceful error handling
- [ ] Error boundary provides fallback UI with error details and recovery options
- [ ] Error boundary integrates with Sentry for error reporting (using `@repo/logger` package)
- [ ] Accessibility tests run automatically in CI/CD pipeline
- [ ] Test suite coverage remains >80% after adding accessibility and error handling tests

## Technical Requirements

### Files to Create

| Path                                                           | Purpose                              |
| -------------------------------------------------------------- | ------------------------------------ |
| `packages/ui/src/components/error-boundary.tsx`                | React error boundary component       |
| `packages/ui/src/components/__tests__/error-boundary.test.tsx` | Error boundary unit tests            |
| `packages/ui/src/test-utils/accessibility.ts`                  | Accessibility testing utilities      |
| `packages/ui/src/test-utils/axe-matchers.ts`                   | Custom axe-core matchers for Vitest  |
| `.github/workflows/accessibility.yml`                          | CI workflow for accessibility checks |

### Files to Modify

| Path                                              | Changes                                                  |
| ------------------------------------------------- | -------------------------------------------------------- |
| `packages/ui/src/index.ts`                        | Export ErrorBoundary component                           |
| `packages/ui/src/components/__tests__/*.test.tsx` | Add axe-core accessibility tests to all component tests  |
| `packages/ui/package.json`                        | Add axe-core and jest-axe dependencies                   |
| `packages/ui/vitest.config.ts`                    | Configure axe-core matchers globally                     |
| `packages/ui/README.md`                           | Document accessibility features and error boundary usage |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# In packages/ui directory
pnpm add react-error-boundary
pnpm add -D axe-core jest-axe @axe-core/react
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.

| Setting                    | Requirement                                      | TAD Reference                                                                            |
| -------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| WCAG Compliance Level      | WCAG 2.1 Level AA (allow only minor violations)  | [TAD: UI Components Architecture](/docs/2-technical/2-tad.md#ui-components-architecture) |
| Error boundary integration | Wrap interactive components with error boundary  | [TAD: Observability Architecture](/docs/2-technical/2-tad.md#observability-architecture) |
| Accessibility testing      | Run axe-core in all component tests              | [TAD: Testing Architecture](/docs/2-technical/2-tad.md#testing-architecture)             |
| Focus management           | Trap focus in modal components, restore on close | [TAD: UI Components Architecture](/docs/2-technical/2-tad.md#ui-components-architecture) |
| Color contrast             | Minimum 4.5:1 for text, 3:1 for UI components    | [TAD: UI Components Architecture](/docs/2-technical/2-tad.md#ui-components-architecture) |
| Error reporting            | Report errors to Sentry via `@repo/logger`       | [TAD: Observability Architecture](/docs/2-technical/2-tad-observability.md)              |

**Configuration Rationale**:

- WCAG 2.1 Level AA is the industry standard for web accessibility and required for many compliance frameworks
- Error boundaries prevent component failures from crashing the entire application
- axe-core is the industry-standard accessibility testing library, integrated with CI/CD for continuous validation
- Focus management ensures keyboard users and screen reader users can navigate modal interfaces
- Color contrast requirements ensure text is readable for users with visual impairments
- Sentry integration enables monitoring and debugging of component errors in production

## Test Requirements

### Manual Verification

- [ ] **Keyboard Navigation - Button**: Navigate to button with Tab, activate with Enter/Space, verify focus visible
- [ ] **Keyboard Navigation - Dialog**: Open dialog with keyboard, focus trapped inside, Tab cycles through dialog elements, Escape closes dialog and restores focus
- [ ] **Keyboard Navigation - Dropdown**: Open dropdown with Enter/Space/Arrow Down, navigate items with arrows, select with Enter, close with Escape
- [ ] **Keyboard Navigation - Tabs**: Navigate tab list with arrows, activate tabs with Enter/Space, Tab moves to tab panel
- [ ] **Screen Reader - Form Components**: Use NVDA/JAWS to verify Button, Input, and Select components announce correctly with labels and states
- [ ] **Screen Reader - Toast**: Trigger toast notifications and verify announcements (polite for info, assertive for errors)
- [ ] **Color Contrast**: Use browser devtools to verify all text meets 4.5:1 ratio, UI components meet 3:1 ratio
- [ ] **Error Boundary Fallback**: Trigger component error and verify fallback UI displays with error details and recovery option
- [ ] **Reduced Motion**: Enable prefers-reduced-motion and verify animations pause appropriately (Skeleton, Spinner, Dialog transitions)

### Automated Tests

- [ ] Unit: `error-boundary.test.tsx` - Error catching, fallback rendering, error reporting, reset functionality
- [ ] Unit: All component tests - Add axe-core checks for WCAG violations in all variants
- [ ] Unit: `accessibility.ts` - Accessibility testing utility functions
- [ ] Unit: Dialog tests - Focus trap, focus restoration, Escape key handling
- [ ] Unit: Dropdown tests - Arrow key navigation, Enter/Space selection, Escape closing
- [ ] Unit: Tabs tests - Arrow key navigation, roving tabindex
- [ ] Unit: Toast tests - ARIA live region announcements
- [ ] Unit: Color contrast - Automated checks for all Badge and Button variants

### Integration Tests

- [ ] Error boundary catches errors from Dialog component and displays fallback UI
- [ ] Error boundary catches errors from Dropdown component and displays fallback UI
- [ ] Error boundary integrates with `@repo/logger` to report errors to Sentry
- [ ] Error boundary reset functionality restores component to working state
- [ ] Accessibility tests run in CI/CD pipeline and fail build on critical violations
- [ ] Focus management works across nested modal components (Dialog containing Dropdown)

### Verification Commands

```bash
# Run all component tests with accessibility checks
pnpm --filter @repo/ui test

# Run only accessibility tests
pnpm --filter @repo/ui test -- --testNamePattern="accessibility"

# Run tests with coverage
pnpm --filter @repo/ui test:coverage

# Type check
pnpm --filter @repo/ui type-check

# Lint components
pnpm --filter @repo/ui lint

# Build package
pnpm --filter @repo/ui build

# Verify error boundary export
node -e "const ui = require('./packages/ui/dist'); console.log('ErrorBoundary exported:', !!ui.ErrorBoundary);"

# Run accessibility CI check (if on CI)
pnpm --filter @repo/ui test:a11y
```

## Implementation Notes

### Implementation Sequence

1. **Configure axe-core Testing Infrastructure**
   - Install axe-core, jest-axe, and @axe-core/react dependencies
   - Create `test-utils/axe-matchers.ts` with custom Vitest matchers
   - Configure `vitest.config.ts` to load axe matchers globally
   - Create `test-utils/accessibility.ts` with helper functions for running axe tests

2. **Add Accessibility Tests to All Components**
   - Update all existing component tests (Button, Input, Select, Card, Dialog, Dropdown, Tabs, Toast, Avatar, Badge, Skeleton, Spinner)
   - Add `toHaveNoViolations()` assertions for each variant
   - Add keyboard navigation tests for interactive components
   - Add ARIA attribute verification tests
   - Test focus management for modal components

3. **Create Error Boundary Component**
   - Build ErrorBoundary component using react-error-boundary library
   - Implement fallback UI with error message display and reset button
   - Integrate with `@repo/logger` for Sentry error reporting
   - Add support for custom fallback components
   - Include error recovery mechanism (reset error state)

4. **Integrate Error Boundaries with Interactive Components**
   - Wrap Dialog, Dropdown, Tabs, and Toast components with error boundary internally (optional) or document usage pattern
   - Ensure errors in child components are caught and don't crash parent
   - Test error boundary with intentional errors in components

5. **Configure CI/CD Accessibility Checks**
   - Create `.github/workflows/accessibility.yml` to run axe tests
   - Configure workflow to fail on critical or serious violations
   - Add accessibility check as required status check for PRs

6. **Manual Accessibility Validation**
   - Test keyboard navigation across all interactive components
   - Verify screen reader announcements with NVDA or JAWS
   - Check color contrast with browser devtools or contrast checker
   - Test focus management and visible focus indicators
   - Verify prefers-reduced-motion handling

### Key Concepts

- **WCAG 2.1 Level AA**: Web Content Accessibility Guidelines ensuring content is perceivable, operable, understandable, and robust for all users including those with disabilities
- **axe-core**: Automated accessibility testing engine that detects WCAG violations in rendered HTML
- **Focus Trap**: Pattern that restricts keyboard focus to within a modal component (Dialog, Dropdown) until dismissed
- **ARIA Live Regions**: Accessibility mechanism to announce dynamic content changes to screen readers (used by Toast notifications)
- **Error Boundaries**: React pattern that catches JavaScript errors in component trees, logs errors, and displays fallback UI
- **Color Contrast Ratio**: Ratio between foreground and background colors; WCAG AA requires 4.5:1 for normal text, 3:1 for large text and UI components

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.

Reference the TAD for implementation patterns:

- [TAD: UI Components Architecture](/docs/2-technical/2-tad.md#ui-components-architecture)
- [TAD: Observability Architecture](/docs/2-technical/2-tad.md#observability-architecture)
- [TAD: Testing Architecture](/docs/2-technical/2-tad.md#testing-architecture)

Key pattern notes for this story:

- Use `jest-axe` with Vitest custom matchers for accessibility testing in component tests
- Error boundary should be a lightweight wrapper around `react-error-boundary` with Sentry integration
- Focus trap implementation already handled by Radix UI primitives (Dialog, Dropdown); just verify it works
- ARIA live regions for Toast already implemented in S5; verify with axe-core tests
- axe-core tests should run against rendered components with `@testing-library/react`
- Error boundary can be used as wrapper or integrated directly into components; document both patterns

### Troubleshooting

| Issue                                        | Cause                                        | Solution                                                                                |
| -------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------- |
| axe-core reports false positive violations   | Component not fully rendered before axe scan | Add `await waitFor()` before running axe to ensure component fully renders              |
| Focus not trapped in Dialog                  | Radix UI Dialog not configured correctly     | Verify Dialog.Root and Dialog.Content structure matches Radix documentation             |
| Screen reader not announcing toast messages  | Missing ARIA live region or incorrect role   | Ensure Toast component has `role="status"` or `role="alert"` attribute                  |
| Color contrast failures in dark mode         | Theme tokens don't meet contrast ratios      | Adjust Tailwind color tokens in theme config using contrast checker                     |
| Error boundary not catching errors           | Error thrown in event handler, not render    | Event handler errors must be caught with try/catch; boundaries only catch render errors |
| axe tests slow down test suite significantly | Running axe on every component variant       | Reduce axe scans to key variants or run accessibility tests separately                  |

### Reference Materials

- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [jest-axe Documentation](https://github.com/nickcolley/jest-axe)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Error Boundary Documentation](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [react-error-boundary Library](https://github.com/bvaughn/react-error-boundary)
- [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM: Keyboard Accessibility](https://webaim.org/articles/keyboard/)
- [WebAIM: Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Radix UI Accessibility Documentation](https://www.radix-ui.com/primitives/docs/overview/accessibility)

## Estimated Effort

**Size**: M (4-8h)

**Breakdown**:

- Configure axe-core testing infrastructure: 1h
- Add accessibility tests to all 12 components: 2h
- Create error boundary component with Sentry integration: 1h
- Manual keyboard and screen reader testing: 2h
- Configure CI/CD accessibility workflow: 0.5h
- Documentation updates: 0.5h

## Architecture Decisions

> **Consolidation Rule**: Only document story-specific decisions here.

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: UI Components Architecture](/docs/2-technical/2-tad.md#ui-components-architecture) - WCAG 2.1 Level AA compliance requirement
- [TAD: Observability Architecture](/docs/2-technical/2-tad.md#observability-architecture) - Error boundary pattern and Sentry integration
- [TAD: Testing Architecture](/docs/2-technical/2-tad.md#testing-architecture) - axe-core for accessibility testing, >80% coverage requirement

### Story-Specific Decisions

#### AD-2A.5.S6.1: Error Boundary Scope

**Scope**: Story-specific (isolated to `@repo/ui` package error handling pattern)

**Decision**: Provide ErrorBoundary as an exported component for application-level usage rather than wrapping individual UI components internally.

**Rationale**:

- Gives applications control over error boundary granularity (wrap entire page, specific sections, or individual components)
- Allows applications to customize fallback UI based on context
- Reduces bundle size by avoiding redundant error boundaries in every component
- Follows React best practice of placing error boundaries at appropriate levels in component tree
- Component library shouldn't make assumptions about error handling strategy for consuming applications

**Consequences**:

- Applications must explicitly wrap components with ErrorBoundary where needed
- More flexible but requires documentation and examples for proper usage
- Component errors may propagate to parent boundaries if not wrapped appropriately
- Enables different error handling strategies per application

**Alternatives Considered**:

- **Wrap all interactive components internally**: Rejected because it reduces flexibility and adds unnecessary overhead to simple use cases
- **No error boundary in `@repo/ui`**: Rejected because error handling is critical infrastructure that should be available to all applications

#### AD-2A.5.S6.2: Accessibility Violation Threshold

**Scope**: Story-specific (isolated to `@repo/ui` package testing standards)

**Decision**: Fail tests on critical and serious axe-core violations; allow minor and moderate violations as warnings.

**Rationale**:

- Critical violations (e.g., missing alt text, no keyboard access) make components unusable for some users
- Serious violations (e.g., color contrast failures) significantly impair usability
- Minor violations (e.g., missing autocomplete attributes) don't block usage but should be fixed eventually
- Moderate violations fall between serious and minor; often context-dependent
- Failing on all violations creates false positives and blocks productive work

**Consequences**:

- Tests may pass with some accessibility issues remaining
- Team must manually review moderate violations and prioritize fixes
- Provides pragmatic balance between accessibility goals and development velocity
- Minor violations may accumulate over time if not addressed

**Alternatives Considered**:

- **Fail on all violations**: Rejected because it creates false positives and blocks development (e.g., "landmark should be unique" when testing single component in isolation)
- **Only fail on critical violations**: Rejected because serious violations (like color contrast) are too important to ignore

## Out of Scope

The following items are explicitly NOT part of this story:

- **Comprehensive Manual Accessibility Audit** - axe-core automated testing covers most issues; full manual audit with assistive technology deferred to QA phase
- **Internationalization (i18n) for Error Messages** - Error boundary messages in English only; i18n deferred to Epic 2B.6 (Localization)
- **Advanced Error Recovery Strategies** - Basic reset functionality only; advanced recovery (retry with backoff, partial state restoration) deferred to application layer
- **Accessibility Training Materials** - Usage documentation only; comprehensive accessibility guide for developers deferred to documentation epic
- **Visual Regression Testing Integration** - Chromatic/Percy integration deferred to S7 (Storybook and Documentation)
- **Screen Reader Testing Automation** - Manual screen reader testing only; automated screen reader testing (Guidepup) deferred to future enhancement
- **High Contrast Mode Support** - Windows High Contrast Mode support deferred to future accessibility enhancements
- **Error Boundary Telemetry Dashboard** - Error tracking via Sentry only; custom dashboard for component errors deferred to observability enhancements

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S3**: [Implement Form Components](./S3-form-components.md) - Form components (Button, Input, Select) must exist before accessibility testing
- **S4**: [Implement Layout Components](./S4-layout-components.md) - Layout components (Card, Dialog, Dropdown, Tabs) must exist before accessibility testing
- **S5**: [Implement Feedback Components](./S5-feedback-components.md) - Feedback components (Toast, Avatar, Badge, Skeleton, Spinner) must exist before accessibility testing

### Enables (Unblocks These Stories)

- **S7**: [Configure Storybook and Write Documentation](./S7-storybook-docs.md) - Accessibility features and error boundary must be complete before documenting in Storybook

## References

### Epic & TAD References

- [EPIC.md: UI Component Library (Generic)](./EPIC.md)
- [TAD: UI Components Architecture](/docs/2-technical/2-tad.md#ui-components-architecture)
- [TAD: Observability Architecture](/docs/2-technical/2-tad.md#observability-architecture)
- [TAD: Testing Architecture](/docs/2-technical/2-tad.md#testing-architecture)

### ADR References

- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)

### External Documentation

- [axe-core Accessibility Testing](https://github.com/dequelabs/axe-core)
- [jest-axe](https://github.com/nickcolley/jest-axe)
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [react-error-boundary](https://github.com/bvaughn/react-error-boundary)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/)
- [Radix UI Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility)

## Verification Checklist

### Pre-Verification

- [ ] S3 (Form Components), S4 (Layout Components), and S5 (Feedback Components) completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] `@repo/ui` package exists with all 12 core components implemented
- [ ] `@repo/logger` package available for Sentry integration

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors (`pnpm --filter @repo/ui lint`)
- [ ] Types compile successfully (`pnpm --filter @repo/ui type-check`)
- [ ] Tests written and passing (`pnpm --filter @repo/ui test`)
- [ ] Coverage > 80% for error boundary and accessibility utilities (`pnpm --filter @repo/ui test:coverage`)
- [ ] All components pass axe-core accessibility tests (no critical or serious violations)
- [ ] Keyboard navigation works for all interactive components
- [ ] Focus management verified for Dialog and Dropdown components
- [ ] Color contrast ratios meet WCAG AA requirements
- [ ] Error boundary catches component errors and displays fallback UI
- [ ] Error boundary integrates with Sentry via `@repo/logger`
- [ ] ErrorBoundary component exported from `packages/ui/src/index.ts`

### Documentation

- [ ] Code comments where logic isn't self-evident (especially error boundary integration, axe-core test setup)
- [ ] README.md updated with accessibility features documentation
- [ ] README.md updated with ErrorBoundary usage examples
- [ ] TypeScript interfaces exported and documented with JSDoc comments
- [ ] Accessibility testing utilities documented

### Git Hygiene

- [ ] Conventional commit message used (e.g., `feat(ui): add accessibility testing and error boundaries`)
- [ ] No unrelated changes included
- [ ] PR description includes accessibility test results summary

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
