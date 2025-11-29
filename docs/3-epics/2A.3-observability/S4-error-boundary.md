# Story 2A.3.S4: Create React Error Boundary Component

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Observability Package](./EPIC.md)
- **Depends On**: [S2: Structured Logger](./S2-structured-logger.md), [S3: Sentry Integration](./S3-sentry-integration.md)
- **Blocks**: [S7: Tests and Documentation](./S7-tests-docs.md)
- **Runs in Parallel With**: [S5: Web Vitals Tracking](./S5-web-vitals.md), [S6: Health Check Utilities](./S6-health-checks.md)

## User Story

**As a** developer
**I want** a React Error Boundary component with customizable fallback UI and automatic error reporting
**So that** I can gracefully handle React errors, maintain user experience during failures, and automatically capture errors in Sentry

## Acceptance Criteria

- [ ] Error Boundary component catches React rendering errors in child components
- [ ] Component logs errors using structured logger with component stack trace
- [ ] Errors are automatically sent to Sentry with React context metadata
- [ ] Default fallback UI displays user-friendly error message with refresh button
- [ ] Fallback UI can be customized via `fallback` prop
- [ ] Optional `onError` callback allows custom error handling logic
- [ ] Error state can be reset programmatically
- [ ] Component works in both client and server components (Next.js App Router)
- [ ] Error Boundary exported from `@repo/observability`
- [ ] TypeScript types exported for props and state

## Technical Requirements

### Files to Create

| Path                                                    | Purpose                                      |
| ------------------------------------------------------- | -------------------------------------------- |
| `packages/observability/src/error-boundary.tsx`         | Error Boundary React component               |
| `packages/observability/src/error-boundary-types.ts`    | TypeScript type definitions for Error Boundary |
| `packages/observability/__tests__/error-boundary.test.tsx` | Unit tests for Error Boundary component   |

### Files to Modify

| Path                                     | Changes                                                          |
| ---------------------------------------- | ---------------------------------------------------------------- |
| `packages/observability/src/index.ts`    | Export `ErrorBoundary`, `ErrorBoundaryProps`, `ErrorBoundaryState` |
| `packages/observability/package.json`    | Add `react` and `react-dom` as peer dependencies                 |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# Navigate to package directory
cd packages/observability

# Add peer dependencies (React)
pnpm add -D react react-dom

# Development dependencies for testing
pnpm add -D @testing-library/react @testing-library/jest-dom @vitejs/plugin-react
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting                      | Requirement                                              | TAD Reference                                                                  |
| ---------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Component type               | Must be class component (Error Boundaries require class) | [TAD: React Error Boundary](/docs/2-technical/2-tad-observability.md#react-error-boundary) |
| Client directive             | Must include `'use client'` for Next.js App Router       | [TAD: React Error Boundary](/docs/2-technical/2-tad-observability.md#react-error-boundary) |
| Error logging                | Use structured logger with component stack metadata      | [TAD: React Error Boundary](/docs/2-technical/2-tad-observability.md#react-error-boundary) |
| Sentry integration           | Send errors to Sentry with React context                 | [TAD: React Error Boundary](/docs/2-technical/2-tad-observability.md#react-error-boundary) |
| Fallback UI                  | Default fallback with refresh button; customizable via prop | [TAD: React Error Boundary](/docs/2-technical/2-tad-observability.md#react-error-boundary) |

**Configuration Rationale**: Error Boundaries are a React pattern for catching JavaScript errors in component trees. They must be class components because React requires the lifecycle methods `getDerivedStateFromError` and `componentDidCatch`. The `'use client'` directive is required for Next.js App Router because Error Boundaries cannot be server components. Automatic Sentry integration ensures all React errors are tracked for debugging. Customizable fallback UI allows different error experiences per application while providing a sensible default.

For complete implementation patterns, see: [TAD: React Error Boundary](/docs/2-technical/2-tad-observability.md#react-error-boundary)

## Test Requirements

### Manual Verification

- [ ] **Error Catching**: Trigger a React error in a child component and verify fallback UI displays
- [ ] **Sentry Capture**: Verify error appears in Sentry dashboard with component stack
- [ ] **Custom Fallback**: Provide custom fallback UI and verify it renders instead of default
- [ ] **Error Reset**: Click refresh button and verify page reloads

### Automated Tests

- [ ] Unit: `__tests__/error-boundary.test.tsx` - Verify Error Boundary catches errors and displays fallback
- [ ] Unit: `__tests__/error-boundary.test.tsx` - Verify logger is called with correct parameters when error caught
- [ ] Unit: `__tests__/error-boundary.test.tsx` - Verify Sentry.captureException is called with React context
- [ ] Unit: `__tests__/error-boundary.test.tsx` - Verify custom fallback prop renders correctly
- [ ] Unit: `__tests__/error-boundary.test.tsx` - Verify onError callback is invoked when error caught
- [ ] Unit: `__tests__/error-boundary.test.tsx` - Verify default fallback UI includes refresh button

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

# Verify Error Boundary can be imported
node -e "import('@repo/observability').then(m => console.log('ErrorBoundary:', m.ErrorBoundary))"
```

## Implementation Notes

### Implementation Sequence

1. **Create Type Definitions**
   - Create `error-boundary-types.ts` with `ErrorBoundaryProps` and `ErrorBoundaryState` interfaces
   - Define props: `children`, `fallback?`, `onError?`
   - Define state: `hasError`, `error?`

2. **Implement Error Boundary Component**
   - Create `error-boundary.tsx` with `'use client'` directive
   - Import Logger and Sentry utilities from package
   - Extend React.Component with props and state types
   - Implement constructor to initialize state

3. **Implement Error Lifecycle Methods**
   - Implement `getDerivedStateFromError()` to update state when error occurs
   - Implement `componentDidCatch()` to log error and send to Sentry
   - Extract component stack from `errorInfo.componentStack`
   - Call optional `onError` callback if provided

4. **Implement Render Logic**
   - Check `hasError` state to determine rendering path
   - If error and custom fallback provided, render custom fallback
   - If error and no custom fallback, render default fallback UI
   - Default fallback includes heading, message, and refresh button
   - If no error, render children normally

5. **Update Package Exports**
   - Export `ErrorBoundary` component from `src/index.ts`
   - Export type definitions for props and state
   - Ensure types are available for consuming apps

6. **Write Unit Tests**
   - Mock Logger and Sentry modules
   - Create test component that throws error
   - Test Error Boundary catches error and renders fallback
   - Test custom fallback prop
   - Test onError callback invocation
   - Verify logger and Sentry are called with correct parameters

### Key Concepts

- **Error Boundaries**: React components that catch JavaScript errors in child component trees, preventing entire app crashes
- **Class Components**: Required for Error Boundaries; functional components cannot implement error boundary lifecycle methods
- **Graceful Degradation**: Display user-friendly fallback UI instead of blank screen or crash
- **Client Components**: Next.js App Router requires `'use client'` directive for Error Boundaries
- **Component Stack**: React provides component hierarchy trace for debugging rendering errors

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: React Error Boundary](/docs/2-technical/2-tad-observability.md#react-error-boundary)

Key pattern notes for this story:

- Error Boundaries only catch errors in child components, not errors in the boundary itself
- Use `getDerivedStateFromError` to update state during render phase (must be pure, no side effects)
- Use `componentDidCatch` for side effects (logging, Sentry reporting)
- Default fallback UI should be simple and work without external dependencies
- Refresh button uses `window.location.reload()` to reset application state

### Troubleshooting

| Issue                                      | Cause                                        | Solution                                                         |
| ------------------------------------------ | -------------------------------------------- | ---------------------------------------------------------------- |
| "Error Boundaries must be class components" | Implemented as functional component       | Convert to class component extending React.Component            |
| Error Boundary not catching errors         | Error thrown in event handler, not render    | Error Boundaries only catch rendering errors, not event handlers |
| "use client" directive not working         | Directive not on first line                  | Ensure `'use client'` is the very first line of the file         |
| Tests fail with Sentry import error        | Sentry not mocked in tests                   | Mock `@sentry/nextjs` module in test setup                       |
| TypeScript errors on Component import      | Wrong React import                           | Use `import { Component } from 'react'`, not default import      |
| Fallback UI not styled correctly           | Tailwind classes not available               | Use inline styles or plain CSS for maximum compatibility         |

### Reference Materials

- [React Error Boundaries Documentation](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [Sentry React Error Boundaries](https://docs.sentry.io/platforms/javascript/guides/react/features/error-boundary/)
- [Testing Library - React Component Testing](https://testing-library.com/docs/react-testing-library/intro/)

## Estimated Effort

**Size**: M (4-8h)

**Breakdown**:

- Type definitions: 0.5h
- Error Boundary component implementation: 1.5h
- Default fallback UI implementation: 1h
- Logger and Sentry integration: 1h
- Unit tests: 1.5h
- Manual verification and debugging: 1.5h

## Architecture Decisions

**Consolidated Decisions** (documented in TAD/ADRs):

- [TAD: Observability Architecture](/docs/2-technical/2-tad-observability.md) - Overall error handling strategy
- [TAD: React Error Boundary](/docs/2-technical/2-tad-observability.md#react-error-boundary) - Error Boundary implementation pattern
- [EPIC.md: Actions or Decisions Required](./EPIC.md#actions-or-decisions-required) - Error boundary fallback design decision (open)

**Story-Specific Decisions**:

### AD-2A.3.S4.1: Default Fallback UI Design

**Scope**: Story-specific (affects Error Boundary component only)

**Decision**: Provide a simple, unstyled default fallback UI with heading, message, and refresh button using minimal inline styles.

**Rationale**:
- Default fallback must work without external dependencies (CSS frameworks, component libraries)
- Inline styles ensure fallback renders correctly even if CSS fails to load
- Simple design works in all contexts (light/dark mode, mobile/desktop)
- Applications can override with custom fallback for brand consistency

**Consequences**:
- Default fallback is functional but visually basic
- Applications should provide custom fallback for production use
- No dependency on Tailwind, component libraries, or external CSS

**Alternatives Considered**:
- **Tailwind classes**: Rejected because Tailwind may not be available in all consuming apps
- **No default fallback**: Rejected because developers need a working fallback out of the box
- **Headless (no UI)**: Rejected because Error Boundaries require fallback UI to function

### AD-2A.3.S4.2: Error State Reset Strategy

**Scope**: Story-specific (affects Error Boundary component only)

**Decision**: Use `window.location.reload()` for error reset instead of React state reset.

**Rationale**:
- Full page reload ensures complete application state reset (Redux, context, refs)
- Simpler implementation; no need to manage reset key or forceUpdate
- Prevents cascading errors from partially reset state
- Matches user expectation (refresh button = reload page)

**Consequences**:
- User loses unsaved form data on error
- Page reload may be slower than state-only reset
- Network request required to re-fetch page

**Alternatives Considered**:
- **React state reset**: Rejected because partial state reset can cause new errors
- **Reset key prop**: Rejected due to complexity and potential for stale state
- **Router navigation**: Rejected because navigation may not clear all state

## Out of Scope

The following items are explicitly NOT part of this story:

- **Next.js error.tsx convention** - Next.js provides built-in error handling; this component is for custom error boundaries within pages
- **Global error handling** - Error Boundary only catches React errors; API errors handled by middleware (Epic 2A.6)
- **Error recovery strategies** - Advanced retry logic, circuit breakers deferred to future enhancements
- **Custom error types** - Generic error handling only; specific error types (404, 500) handled by Next.js
- **Error analytics dashboard** - Error tracking is in Sentry; custom dashboard deferred to production readiness
- **Error boundary nesting strategies** - Documentation of nested boundaries deferred to S7
- **Suspense boundary integration** - Separate concern; Suspense boundaries handle async loading, not errors

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S2: Structured Logger** - Error Boundary uses logger to log caught errors
- **S3: Sentry Integration** - Error Boundary uses Sentry utilities to capture errors with React context

### Enables (Unblocks These Stories)

- **S7: Tests and Documentation** - Comprehensive testing requires Error Boundary implementation complete

## References

**Internal**:
- [EPIC.md: Overview](./EPIC.md#overview), [Technical Constraints](./EPIC.md#technical-constraints)
- [TAD: Observability Architecture](/docs/2-technical/2-tad-observability.md)
- [TAD: React Error Boundary](/docs/2-technical/2-tad-observability.md#react-error-boundary)
- [Coding Standards](/docs/2-technical/references/coding-standards.md)
- [Canonical Versions](/docs/2-technical/references/canonical-versions.md)

**External**:
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [Sentry React Error Boundaries](https://docs.sentry.io/platforms/javascript/guides/react/features/error-boundary/)
- [Testing Library - React Testing](https://testing-library.com/docs/react-testing-library/intro/)

## Verification Checklist

**Pre-Verification**:
- [ ] S2 (Structured Logger) complete
- [ ] S3 (Sentry Integration) complete
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] `@repo/observability` package builds successfully

**Implementation Quality**:
- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors (`pnpm lint`)
- [ ] Types compile successfully (`pnpm type-check`)
- [ ] Tests written and passing (`pnpm test`)
- [ ] Coverage > 80% for Error Boundary code

**Documentation**:
- [ ] JSDoc comments on Error Boundary component and props
- [ ] Type definitions include documentation comments
- [ ] Usage example in component documentation (if applicable)

**Git Hygiene**:
- [ ] Conventional commit message (e.g., `feat(observability): create React Error Boundary component`)
- [ ] No unrelated changes included
- [ ] PR references Epic 2A.3.S4

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
