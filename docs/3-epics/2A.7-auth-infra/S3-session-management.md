# Story 2A.7.S3: Session Management and Auth Hooks

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Epic 2A.7: Auth Infrastructure](./EPIC.md)
- **Depends On**: [S1: Package Setup](./S1-package-setup.md), [S2: ClerkProvider Wrapper](./S2-clerk-provider.md)
- **Blocks**: [S5: Webhook Handler Framework](./S5-webhook-handler.md), [S7: Error Boundary and Token Refresh](./S7-error-boundary.md)
- **Runs in Parallel With**: [S4: Protected Route HOC](./S4-protected-route.md)

## User Story

**As a** developer building authenticated features
**I want** reusable auth hooks and session utilities
**So that** I can easily access authentication state, user data, and session information in both client and server components

## Acceptance Criteria

- [ ] `useAuth()` hook returns `{ userId, isLoaded, isSignedIn, orgId, orgRole }` in client components
- [ ] `useUser()` hook returns full user object with email, name, and avatar in client components
- [ ] `useClerk()` hook provides access to Clerk instance for sign-in/sign-out actions
- [ ] `auth()` server helper returns authentication state in server components and API routes
- [ ] `currentUser()` server helper returns full user data in server components
- [ ] Session state updates reactively when user signs in or out
- [ ] Hooks return loading states during hydration
- [ ] TypeScript types accurately reflect authentication state

## Technical Requirements

### Files to Create

| Path                                         | Purpose                                    |
| -------------------------------------------- | ------------------------------------------ |
| `packages/auth/src/hooks/use-auth.ts`        | Client-side auth state hook                |
| `packages/auth/src/hooks/use-user.ts`        | Client-side user data hook                 |
| `packages/auth/src/hooks/use-clerk.ts`       | Client-side Clerk instance hook            |
| `packages/auth/src/hooks/index.ts`           | Hook exports                               |
| `packages/auth/src/server/auth.ts`           | Server-side auth helpers                   |
| `packages/auth/src/server/index.ts`          | Server helper exports                      |
| `packages/auth/src/types/auth-state.ts`      | TypeScript interfaces for auth state       |
| `packages/auth/src/utils/session-helpers.ts` | Session utility functions                  |
| `packages/auth/README.md`                    | Usage documentation (update with examples) |

### Files to Modify

| Path                             | Changes                                             |
| -------------------------------- | --------------------------------------------------- |
| `packages/auth/src/index.ts`     | Export hooks, server helpers, and types             |
| `packages/auth/package.json`     | Verify `@clerk/nextjs` dependency from S1           |
| `packages/auth/tsconfig.json`    | Ensure proper React types for hooks                 |
| `packages/auth/vitest.config.ts` | Add test configuration for hooks (if not from S1)   |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

Dependencies should already be installed from S1 (Package Setup). If not:

```bash
# From packages/auth directory
pnpm add @clerk/nextjs
pnpm add -D @testing-library/react @testing-library/react-hooks vitest happy-dom
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting                         | Requirement                                                        | TAD Reference                                                                 |
| ------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| Hook exports                    | Export from `packages/auth/src/hooks/index.ts` for tree-shaking   | [TAD: Package Architecture](/docs/2-technical/2-tad-package-architecture.md)  |
| Server helpers location         | Must be in `src/server` to enable server-only imports             | [ADR-006: Clerk Authentication](/docs/2-technical/adr/006-clerk-authentication.md) |
| TypeScript `"use client"`       | Client hooks must include `"use client"` directive                | [ADR-003: Next.js Framework](/docs/2-technical/adr/003-nextjs-framework.md)   |
| Session cookie name             | Use Clerk's default `__session` cookie for session management     | [ADR-006: Webhook Handler](/docs/2-technical/adr/006-clerk-authentication.md) |

**Configuration Rationale**:
- Separating client hooks and server helpers enables Next.js to optimize bundle sizes by excluding server-only code from client bundles
- Using Clerk's standard hooks ensures compatibility with future Clerk SDK updates
- TypeScript interfaces provide type safety and autocomplete for auth state across the application

For complete hook implementation patterns, see: [ADR-006: Usage Examples](/docs/2-technical/adr/006-clerk-authentication.md#usage-examples)

## Test Requirements

### Manual Verification

- [ ] **Client Component Auth Hook**: Create a test component using `useAuth()` - verify it displays userId when signed in
- [ ] **User Data Hook**: Use `useUser()` in a component - verify it shows user email, name, and avatar
- [ ] **Server Component Auth**: Use `auth()` in a server component - verify it returns userId in server logs
- [ ] **Sign Out Flow**: Call `clerk.signOut()` from `useClerk()` - verify hooks update to signed-out state
- [ ] **Loading States**: Refresh page while signed in - verify `isLoaded: false` appears briefly before auth state loads
- [ ] **Organization Context**: Switch organizations - verify `orgId` and `orgRole` update in `useAuth()` return value

### Automated Tests

- [ ] Unit: `hooks/use-auth.test.ts` - Mock Clerk provider, verify hook returns correct auth state
- [ ] Unit: `hooks/use-user.test.ts` - Mock user data, verify hook returns user properties
- [ ] Unit: `server/auth.test.ts` - Mock Clerk server helpers, verify auth() returns userId
- [ ] Unit: `utils/session-helpers.test.ts` - Test session utility functions in isolation
- [ ] Integration: Test hooks with actual ClerkProvider wrapper - verify reactive updates

### Integration Tests

- [ ] Hooks update when user signs in via Clerk UI components
- [ ] `auth()` server helper correctly extracts userId from request context
- [ ] Session data persists across page navigation (client-side routing)
- [ ] Hooks handle organization switching without full page reload
- [ ] Server helpers work correctly in API route handlers

### Verification Commands

```bash
# Run unit tests for hooks
pnpm --filter @repo/auth test

# Run tests with coverage
pnpm --filter @repo/auth test:coverage

# Type-check the package
pnpm --filter @repo/auth typecheck

# Lint the code
pnpm --filter @repo/auth lint

# Build the package
pnpm --filter @repo/auth build

# Test in example app (if available)
pnpm --filter web dev
# Navigate to authenticated page and check console for auth state
```

## Implementation Notes

### Implementation Sequence

1. **Create TypeScript Types**
   - Define `AuthState` interface matching Clerk's return types
   - Define `UserData` interface for user profile information
   - Export types from `src/types/auth-state.ts`

2. **Implement Client Hooks**
   - Create `useAuth()` as a thin wrapper around `@clerk/nextjs useAuth()`
   - Create `useUser()` as a wrapper around `@clerk/nextjs useUser()`
   - Create `useClerk()` as a wrapper around `@clerk/nextjs useClerk()`
   - Add `"use client"` directive to all hook files

3. **Implement Server Helpers**
   - Create `auth()` wrapper around `@clerk/nextjs auth()`
   - Create `currentUser()` wrapper around `@clerk/nextjs currentUser()`
   - Export from `src/server/index.ts` (server-only exports)

4. **Add Session Utilities**
   - Create helper functions for session validation
   - Add utilities for extracting session metadata
   - Document common session operations

5. **Update Package Exports**
   - Export hooks from main `index.ts` for client usage
   - Export server helpers separately to prevent client bundling
   - Export TypeScript types for consuming applications

6. **Write Tests**
   - Mock Clerk SDK for unit tests
   - Test hook return values and loading states
   - Test server helper behavior with mock requests

7. **Update Documentation**
   - Add usage examples to README.md
   - Document common patterns (accessing user in client vs server)
   - Add troubleshooting section for hydration mismatches

### Key Concepts

- **Server vs Client Helpers**: Server helpers (`auth()`, `currentUser()`) use Next.js request context; client hooks use React context
- **Loading States**: `isLoaded: false` during SSR/hydration prevents hydration mismatches when auth state isn't available
- **Organization Context**: `orgId` and `orgRole` are available when user is in an organization context
- **Reactive Updates**: Clerk's React context ensures hooks re-render when authentication state changes

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the ADR for implementation patterns:

- [ADR-006: Accessing User Data (Client vs Server)](/docs/2-technical/adr/006-clerk-authentication.md#accessing-user-data)
- [ADR-006: Organization Context](/docs/2-technical/adr/006-clerk-authentication.md#organization-context)
- [ADR-006: API Route Protection](/docs/2-technical/adr/006-clerk-authentication.md#api-route-protection)

Key pattern notes for this story:

- Use `"use client"` directive for all hooks to enable client-side React context
- Server helpers must NOT be imported in client components (will cause build errors)
- Always check `isLoaded` before using `userId` to avoid hydration errors
- Organization context is optional - check `orgId` existence before using

### Troubleshooting

| Issue                                       | Cause                                          | Solution                                                          |
| ------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------- |
| Hydration mismatch with userId              | Using userId before isLoaded is true           | Check `isLoaded && userId` before rendering auth-dependent UI     |
| Server helpers don't work in client         | Imported server-only code in client component  | Import from `@repo/auth/server` only in server components         |
| Hooks return undefined in server components | Used client hooks in server component          | Use `auth()` and `currentUser()` server helpers instead           |
| Organization context missing                | User not in organization                       | Check `orgId` existence before using organization-specific logic  |
| Session state not updating after sign-in    | Missing ClerkProvider wrapper                  | Ensure ClerkProvider wraps app root (from S2)                     |

### Reference Materials

- [Clerk Next.js SDK Documentation](https://clerk.com/docs/references/nextjs/overview)
- [Clerk useAuth() Hook Reference](https://clerk.com/docs/references/react/use-auth)
- [Clerk useUser() Hook Reference](https://clerk.com/docs/references/react/use-user)
- [Clerk Server Helpers](https://clerk.com/docs/references/nextjs/auth)
- [Next.js App Router: Server and Client Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

## Estimated Effort

**Size**: M (6h)

**Breakdown**:

- Create TypeScript types: 0.5h
- Implement client hooks (useAuth, useUser, useClerk): 1.5h
- Implement server helpers (auth, currentUser): 1h
- Create session utilities: 1h
- Write unit tests: 1.5h
- Update documentation and examples: 0.5h

## Architecture Decisions

> **Consolidation Rule**: Only document story-specific decisions here.
> Cross-cutting decisions should be added to TAD first, then linked from this section.
> See [Architecture Decision Format](/docs/0-process/references/story-details-template.md#architecture-decision-format) for consolidation guidelines.

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [ADR-006: Clerk for Authentication](/docs/2-technical/adr/006-clerk-authentication.md) - Clerk SDK patterns for hooks and server helpers
- [ADR-003: Next.js Framework](/docs/2-technical/adr/003-nextjs-framework.md) - Server vs client component patterns
- [TAD: Package Architecture](/docs/2-technical/2-tad-package-architecture.md) - Package export structure

### Story-Specific Decisions

#### AD-2A.7.S3.1: Wrapper Hooks vs Direct Clerk Import

**Scope**: Story-specific (simplifies future migration if needed)

**Decision**: Provide wrapper hooks (`useAuth`, `useUser`, `useClerk`) in `@repo/auth` rather than having consumers import directly from `@clerk/nextjs`

**Rationale**:

- Provides single import point for auth functionality across all apps
- Allows adding custom logic or telemetry to hooks without changing consumers
- Enables potential auth provider migration with minimal code changes
- Maintains consistent API even if Clerk SDK changes
- Simplifies testing by providing mockable interfaces

**Consequences**:

- Extra maintenance to keep wrappers in sync with Clerk SDK updates
- Minimal performance overhead (one extra function call)
- Clearer dependency graph (consumers depend on `@repo/auth`, not Clerk directly)

**Alternatives Considered**:

- **Direct Clerk Imports**: Consumers import `@clerk/nextjs` directly - Rejected because it couples all apps to Clerk SDK changes
- **Re-export Only**: Just re-export Clerk hooks without wrapping - Rejected because it provides no abstraction for future customization

## Out of Scope

The following items are explicitly NOT part of this story:

- **Role-based permission checking** (`canAccess()`, `hasPermission()`) - Deferred to Epic 2B.7 (Product Auth Roles & Permissions)
- **Organization-aware hooks** (`useOrganization()`, `useOrganizationList()`) - Deferred to Epic 2B.7
- **Custom session claims** - Will be added in S6 (User Database Sync) when webhook handlers sync metadata
- **Token refresh logic** - Handled automatically by Clerk SDK; explicit handling in S7 (Error Boundary and Token Refresh)
- **Multi-factor authentication hooks** - Clerk handles MFA internally; no custom hooks needed
- **Sign-in/Sign-up UI components** - Provided by Clerk's prebuilt components; not part of `@repo/auth` package

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1: Package Setup** - Requires `@repo/auth` package structure and `@clerk/nextjs` dependency
- **S2: ClerkProvider Wrapper** - Hooks depend on ClerkProvider being available in React context

### Enables (Unblocks These Stories)

- **S5: Webhook Handler Framework** - Webhook handlers use server helpers to validate requests and extract user context
- **S7: Error Boundary and Token Refresh** - Error boundary uses hooks to detect auth errors and trigger re-authentication

## References

### Epic & TAD References

- [EPIC.md: Auth Infrastructure Overview](./EPIC.md#overview)
- [TAD: Security Architecture - Authentication Flow](/docs/2-technical/2-tad-security-architecture.md#authentication-flow)
- [TAD: Package Architecture](/docs/2-technical/2-tad-package-architecture.md)

### ADR References

- [ADR-006: Clerk for Authentication](/docs/2-technical/adr/006-clerk-authentication.md)
- [ADR-003: Next.js Framework (Server vs Client Components)](/docs/2-technical/adr/003-nextjs-framework.md)

### External Documentation

- [Clerk Next.js Documentation](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk useAuth Hook](https://clerk.com/docs/references/react/use-auth)
- [Clerk Server Helpers](https://clerk.com/docs/references/nextjs/auth)
- [Next.js Server and Client Components](https://nextjs.org/docs/app/building-your-application/rendering)

## Verification Checklist

### Pre-Verification

- [ ] S1 (Package Setup) completed - `@repo/auth` package exists with dependencies
- [ ] S2 (ClerkProvider) completed - ClerkProvider wrapper available for testing
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] Clerk development instance configured with test user

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors (`pnpm --filter @repo/auth lint`)
- [ ] Types compile successfully (`pnpm --filter @repo/auth typecheck`)
- [ ] Tests written and passing (`pnpm --filter @repo/auth test`)
- [ ] Coverage > 80% for new hooks and helpers

### Documentation

- [ ] JSDoc comments on all exported hooks and helpers
- [ ] README.md updated with usage examples for client and server
- [ ] TypeScript types exported and documented
- [ ] Troubleshooting section addresses common hydration issues

### Git Hygiene

- [ ] Conventional commit message used (e.g., `feat(auth): add session management hooks`)
- [ ] No unrelated changes included
- [ ] PR description includes example usage of hooks

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
