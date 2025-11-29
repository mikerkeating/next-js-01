# Story 2A.7.S4: Protected Route HOC

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Auth Infrastructure](./EPIC.md)
- **Depends On**: [S2: ClerkProvider Wrapper and Auth Context](./S2-clerk-provider.md)
- **Blocks**: [S7: Auth Error Boundary and Token Refresh](./S7-error-boundary.md)
- **Runs in Parallel With**: [S3: Auth Hooks Implementation](./S3-auth-hooks.md)

## User Story

**As a** developer building protected features
**I want** a reusable Higher-Order Component (HOC) that protects routes from unauthenticated access
**So that** I can easily enforce authentication requirements without writing repetitive auth checks

## Acceptance Criteria

- [ ] `withAuth()` HOC created that wraps components requiring authentication
- [ ] HOC redirects unauthenticated users to sign-in page with return URL
- [ ] HOC supports both client and server components via separate implementations
- [ ] Loading state displayed while authentication status is being determined
- [ ] Optional custom loading component can be passed to HOC
- [ ] HOC preserves TypeScript types of wrapped component props
- [ ] Works seamlessly with Clerk's middleware for consistent auth enforcement
- [ ] Package exports HOC for use in application pages and layouts

## Technical Requirements

### Files to Create

| Path                                     | Purpose                                          |
| ---------------------------------------- | ------------------------------------------------ |
| `packages/auth/src/hoc/with-auth.tsx`    | Client-side HOC for protecting client components |
| `packages/auth/src/hoc/with-auth-server.tsx` | Server-side helper for protecting server components |
| `packages/auth/src/hoc/types.ts`         | TypeScript types for HOC configuration          |
| `packages/auth/src/components/auth-loading.tsx` | Default loading component                        |

### Files to Modify

| Path                             | Changes                                |
| -------------------------------- | -------------------------------------- |
| `packages/auth/src/index.ts`     | Export `withAuth`, `withAuthServer`, and related types |
| `packages/auth/README.md`        | Add usage examples for route protection |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Required dependencies** (already installed in S1):
- `@clerk/nextjs` - For `useAuth()`, `auth()`, and `redirect()`
- `react` - For HOC implementation

No additional dependencies required.

### Configuration Details

> **Note**: For complete authentication patterns, reference [ADR-006: Clerk Authentication](/docs/2-technical/adr/006-clerk-authentication.md).
> This section describes configuration REQUIREMENTS for route protection.

| Setting              | Requirement                                                     | TAD Reference                                                                |
| -------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `redirectUrl`        | Default to `/sign-in` from env var `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | [ADR-006: Configuration](/docs/2-technical/adr/006-clerk-authentication.md) |
| `returnUrl`          | Capture current path and pass as query param to sign-in page    | [ADR-006: Usage Examples](/docs/2-technical/adr/006-clerk-authentication.md#protecting-routes) |
| `LoadingComponent`   | Accept optional custom component, fallback to built-in spinner | -                                                                            |
| Type preservation    | HOC must preserve all props and types of wrapped component      | [TAD: TypeScript Standards](/docs/2-technical/references/coding-standards.md) |

**Configuration Rationale**: The HOC provides a declarative way to protect routes, ensuring consistent authentication enforcement across the application. Separate implementations for client and server components respect Next.js App Router patterns while maintaining a unified API. The return URL mechanism ensures users are redirected back to their intended destination after authentication.

For complete authentication flow examples, see: [ADR-006: Protecting Routes](/docs/2-technical/adr/006-clerk-authentication.md#protecting-routes)

## Test Requirements

### Manual Verification

- [ ] **Redirect Unauthenticated**: Navigate to protected route while signed out - verify redirect to sign-in with return URL
- [ ] **Allow Authenticated**: Navigate to protected route while signed in - verify component renders normally
- [ ] **Return URL Flow**: Sign out, visit protected route, sign in - verify redirect back to original route
- [ ] **Loading State**: Protected route shows loading indicator briefly before auth check completes
- [ ] **Custom Loading**: Pass custom loading component to HOC - verify it displays during auth check

### Automated Tests

- [ ] Unit: `with-auth.test.tsx` - HOC redirects when `userId` is null
- [ ] Unit: `with-auth.test.tsx` - HOC renders wrapped component when `userId` exists
- [ ] Unit: `with-auth.test.tsx` - HOC shows loading state while `isLoaded` is false
- [ ] Unit: `with-auth.test.tsx` - HOC preserves component props and types
- [ ] Unit: `with-auth-server.test.tsx` - Server helper redirects unauthenticated requests
- [ ] Unit: `with-auth-server.test.tsx` - Server helper returns user ID for authenticated requests

### Integration Tests

- [ ] Next.js app with protected page using `withAuth()` - verify redirect flow end-to-end
- [ ] Server component using `withAuthServer()` - verify auth check and redirect on server side
- [ ] Protected route with custom loading component - verify custom component displays

### Verification Commands

```bash
# Run unit tests for HOC
pnpm --filter @repo/auth test with-auth

# Build package to verify TypeScript compilation
pnpm --filter @repo/auth build

# Type-check to ensure HOC preserves wrapped component types
pnpm --filter @repo/auth type-check

# Run integration tests in sample app
pnpm --filter web test:integration
```

## Implementation Notes

### Implementation Sequence

1. **Create Default Loading Component**
   - Simple spinner or skeleton UI
   - Accessible and responsive design
   - Exported for use as fallback

2. **Implement Client-Side HOC (`withAuth`)**
   - Use `useAuth()` hook from Clerk
   - Check `isLoaded` and `userId` states
   - Handle redirect with `useRouter()` and return URL
   - Render loading component while `isLoaded === false`
   - Render wrapped component when authenticated

3. **Implement Server-Side Helper (`withAuthServer`)**
   - Use `auth()` helper from Clerk in server components
   - Return early with redirect if `userId` is null
   - Pass `userId` to wrapped component as prop
   - Handle redirect with Next.js `redirect()` function

4. **Add TypeScript Types**
   - Generic type parameters for component props
   - Configuration options interface
   - Inferred return types

5. **Update Package Exports**
   - Export both HOCs from main index
   - Export configuration types
   - Update README with examples

### Key Concepts

- **Higher-Order Component (HOC)**: Function that takes a component and returns a new component with additional behavior (authentication check)
- **Return URL**: Captures the user's intended destination to redirect them after authentication completes
- **Loading State**: Displays while Clerk SDK initializes and authentication status is being determined
- **Server vs Client Components**: Different implementations needed due to different execution contexts in Next.js App Router

### Common Patterns

> **Note**: For implementation code examples, reference [ADR-006: Clerk Authentication](/docs/2-technical/adr/006-clerk-authentication.md#protecting-routes).
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the ADR for implementation patterns:

- [ADR-006: Protecting Routes](/docs/2-technical/adr/006-clerk-authentication.md#protecting-routes) - Example using `auth()` helper in server components
- [ADR-006: Usage Examples](/docs/2-technical/adr/006-clerk-authentication.md#usage-examples) - Client component auth patterns

Key pattern notes for this story:

- Use `useAuth()` hook for client components (provides reactive auth state)
- Use `auth()` helper for server components (synchronous auth check)
- Always check `isLoaded` before checking `userId` to avoid flash of unauthenticated state
- Preserve return URL in query params for post-auth redirect: `?redirect_url=${encodeURIComponent(pathname)}`

### Troubleshooting

| Issue                                      | Cause                                      | Solution                                         |
| ------------------------------------------ | ------------------------------------------ | ------------------------------------------------ |
| Flash of unauthenticated content           | Not checking `isLoaded` before rendering   | Show loading state while `isLoaded === false`    |
| Type errors on wrapped component           | Generic types not properly propagated      | Use `ComponentType<P>` and preserve props        |
| Redirect loop between protected route and sign-in | Sign-in page is also protected           | Ensure sign-in route is public in middleware     |
| Return URL not working after sign-in       | Query param not passed or not consumed     | Verify redirect URL includes query param and Clerk config uses `afterSignInUrl` |

### Reference Materials

- [Clerk Next.js Quickstart](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Protecting Routes](https://clerk.com/docs/references/nextjs/auth)
- [React HOC Patterns](https://react.dev/reference/react/Component#alternatives)

## Estimated Effort

**Size**: S (3h)

**Breakdown**:

- Loading component: 0.5h
- Client HOC implementation: 1h
- Server helper implementation: 0.5h
- TypeScript types and exports: 0.5h
- Tests and documentation: 0.5h

## Architecture Decisions

> **Consolidation Rule**: Only document story-specific decisions here.
> Cross-cutting decisions should be added to TAD first, then linked from this section.
> See [Architecture Decision Format](../../0-process/references/story-details-template.md#architecture-decision-format) for consolidation guidelines.

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [ADR-006: Clerk for Authentication](/docs/2-technical/adr/006-clerk-authentication.md) - Authentication provider choice affects HOC implementation (use Clerk SDK helpers)
- [TAD: Security Architecture - Authorization Model](/docs/2-technical/2-tad-security-architecture.md#authorization-model) - This story implements generic auth only; role-based protection deferred to Epic 2B.7

### Story-Specific Decisions

#### AD-2A.7.S4.1: Separate Client and Server HOC Implementations

**Scope**: Story-specific (isolated to route protection utilities)

**Decision**: Provide two separate exports: `withAuth()` for client components and `withAuthServer()` for server components, rather than a single unified HOC.

**Rationale**:

- Next.js App Router has fundamentally different execution contexts for client and server components
- Client components use hooks (`useAuth()`, `useRouter()`) which are not available in server context
- Server components use async helpers (`auth()`, `redirect()`) which don't work with React hooks
- TypeScript cannot infer context (client vs server) at compile time
- Explicit separate functions provide better type safety and clearer API

**Consequences**:

- Developers must choose the correct HOC for their component context
- More explicit and type-safe than a single "magic" HOC
- Slight duplication of logic, but clearer separation of concerns
- Better developer experience with clearer error messages when used incorrectly

**Alternatives Considered**:

- **Unified HOC**: Single `withAuth()` that detects context at runtime - Rejected because runtime context detection is fragile and loses type safety
- **Directive-based**: Use `"use client"` directive to determine implementation - Rejected because directives don't affect function behavior, only component boundaries

## Out of Scope

The following items are explicitly NOT part of this story:

- **Role-based route protection** (e.g., `withAuth({ role: 'internal' })`) - Deferred to Epic 2B.7 (Product Auth Roles & Permissions)
- **Organization-specific route protection** (e.g., `withAuth({ requireOrg: true })`) - Deferred to Epic 2B.7
- **Permission-based protection** (e.g., `withAuth({ permissions: ['content.write'] })`) - Deferred to Epic 2B.7
- **Custom redirect logic** (beyond sign-in redirect) - Not required for this story's acceptance criteria
- **Route protection via middleware** - Handled by Clerk's middleware in Epic 2A.6
- **Sign-in/sign-up page components** - Application-level concern, not package responsibility

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S2: ClerkProvider Wrapper and Auth Context** - Provides the Clerk provider and auth context that the HOC depends on for auth state

### Enables (Unblocks These Stories)

- **S7: Auth Error Boundary and Token Refresh** - Error boundary needs protected routes to test error handling in auth context

## References

### Epic & TAD References

- [EPIC.md: Auth Infrastructure](./EPIC.md)
- [TAD: Security Architecture - Authentication Flow](/docs/2-technical/2-tad-security-architecture.md#authentication-flow)
- [TAD: Security Architecture - Authorization Model](/docs/2-technical/2-tad-security-architecture.md#authorization-model)

### ADR References

- [ADR-006: Clerk for Authentication](/docs/2-technical/adr/006-clerk-authentication.md)
- [ADR-003: Next.js as Framework](/docs/2-technical/adr/003-nextjs-framework.md) - App Router patterns affect HOC implementation

### External Documentation

- [Clerk Next.js Reference](https://clerk.com/docs/references/nextjs/overview)
- [Clerk Route Protection](https://clerk.com/docs/references/nextjs/auth)
- [Next.js App Router Authentication](https://nextjs.org/docs/app/building-your-application/authentication)

## Verification Checklist

### Pre-Verification

- [ ] S2 (ClerkProvider Wrapper) completed
- [ ] Local environment has Clerk keys configured
- [ ] Test application available for integration testing

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors
- [ ] TypeScript compiles without errors
- [ ] Generic types properly preserve wrapped component props
- [ ] Tests written and passing (≥80% coverage)

### Documentation

- [ ] JSDoc comments on HOC functions explaining usage
- [ ] README updated with route protection examples
- [ ] TypeScript types exported and documented
- [ ] Common troubleshooting scenarios documented

### Git Hygiene

- [ ] Conventional commit message: `feat(auth): add protected route HOC`
- [ ] No unrelated changes included
- [ ] PR description includes before/after examples

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
