# Epic 2A.7: Auth Infrastructure

> **To create stories for this epic:** Define the epic scope and acceptance criteria first, then break down into stories following the [story template](../../0-process/references/story-details-template.md). Each story should be independently implementable and testable.

## Context

- **PRD Reference**: [PRD: Feature M.4 - Authentication & Authorization](/docs/1-product/1-prd.md#feature-m4-authentication--authorization)
- **TAD Reference**: [TAD: Security Architecture](/docs/2-technical/2-tad.md#security-architecture)
- **Phase**: 2A - Core Platform Packages
- **Type**: Foundation

## Dependencies

### Requires (Must Complete First)

| Epic | Title                                                     | Reason                                                                          |
| ---- | --------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 2A.2 | [Database Infrastructure](../2A.2-database-infra/EPIC.md) | Generic user table structure and database utilities needed for user sync        |
| 2A.6 | [Middleware Package](../2A.6-middleware/EPIC.md)          | Middleware composition and route protection patterns needed for auth middleware |

### Blocks (Enables These Epics)

| Epic | Title                            | What This Provides                                                |
| ---- | -------------------------------- | ----------------------------------------------------------------- |
| 2A.8 | API Client Package               | Authentication token injection for authenticated API requests     |
| 2B.7 | Product Auth Roles & Permissions | Generic auth context and hooks that product-specific roles extend |
| 3A.2 | Routing Application Shell        | Auth protection patterns for route-level security                 |

### Can Run in Parallel With

| Epic | Title                                                       | Notes                                                                           |
| ---- | ----------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 2A.3 | [Observability Package](../2A.3-observability/EPIC.md)      | Independent package; can develop concurrently once shared dependencies complete |
| 2A.4 | [Analytics Infrastructure](../2A.4-analytics-infra/EPIC.md) | Independent package with no shared dependencies                                 |
| 2A.5 | [UI Component Library](../2A.5-ui-components/EPIC.md)       | Independent UI concerns; can develop concurrently                               |

## Overview

Create the `@repo/auth` package providing generic Clerk authentication integration for Next.js applications. This package establishes the foundation for user authentication, session management, and webhook handling without product-specific roles or permissions. It provides reusable auth utilities that work with the middleware package for route protection.

**Key Deliverables:**

- `@repo/auth` package with Clerk SDK integration
- ClerkProvider wrapper component for application root
- Generic auth context providing `user`, `isLoaded`, `isSignedIn` state
- Generic auth hooks: `useAuth()`, `useUser()`, `useClerk()`
- Protected route HOC for generic authentication (without role checks)
- Clerk webhook handler framework with signature verification
- User sync to database (generic user table only)
- Token refresh handling and session management
- Auth error boundaries with user-friendly fallback UI

## Acceptance Criteria

> **Note**: Epic acceptance criteria should be high-level outcomes. Story-level criteria provide the detailed verification.

- [ ] `@repo/auth` package is published and can be imported by applications
- [ ] ClerkProvider wrapper correctly initialises Clerk SDK in application root
- [ ] `useAuth()` hook returns authentication state (userId, isLoaded, isSignedIn) in client components
- [ ] `useUser()` hook returns current user data in client components
- [ ] `auth()` helper returns authentication state in server components and API routes
- [ ] Protected route HOC redirects unauthenticated users to sign-in page
- [ ] Webhook handler validates Clerk signatures and rejects invalid requests
- [ ] User creation webhook successfully syncs user data to database
- [ ] User update webhook successfully updates user data in database
- [ ] Auth error boundary catches authentication errors and displays fallback UI
- [ ] Token refresh happens automatically without user intervention
- [ ] Package has ≥80% test coverage
- [ ] All stories complete and verified
- [ ] Documentation updated (README, inline JSDoc, usage examples)

## Stories

| ID  | Title                                                             | Size | Status | Depends On | Blocks             |
| --- | ----------------------------------------------------------------- | ---- | ------ | ---------- | ------------------ |
| S1  | [Package Setup and Clerk SDK Installation](./S1-package-setup.md) | S    | ⬜     | -          | S2, S3, S4, S5, S6 |
| S2  | [ClerkProvider Wrapper and Auth Context](./S2-clerk-provider.md)  | M    | ⬜     | S1         | S3, S4, S7         |
| S3  | [Auth Hooks Implementation](./S3-auth-hooks.md)                   | M    | ⬜     | S1, S2     | S5, S7             |
| S4  | [Protected Route HOC](./S4-protected-route.md)                    | S    | ⬜     | S2         | S7                 |
| S5  | [Webhook Handler Framework](./S5-webhook-handler.md)              | M    | ⬜     | S1, S3     | S6, S7             |
| S6  | [User Database Sync](./S6-user-sync.md)                           | M    | ⬜     | S5         | S7                 |
| S7  | [Auth Error Boundary and Token Refresh](./S7-error-boundary.md)   | S    | ⬜     | S3, S4     | S8                 |
| S8  | [Integration Tests and Documentation](./S8-integration-tests.md)  | M    | ⬜     | S6, S7     | -                  |

**Status Legend**: ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Blocked

## Story Dependency Graph

```
S1 (Package setup & Clerk SDK)
 ├──→ S2 (ClerkProvider & auth context)
 │     ├──→ S3 (Auth hooks)
 │     │     ├──→ S5 (Webhook handler framework)
 │     │     │     ↓
 │     │     │    S6 (User database sync)
 │     │     │     ↓
 │     │     └──→ S7 (Error boundary & token refresh)
 │     │           ↓
 │     └──→ S4 (Protected route HOC)
 │           ↓
 └─────────→ S8 (Integration tests & documentation)
```

**Parallel Execution Notes:**

- S3 and S4 can run in parallel after S2 completes
- S5 requires S3 for auth utilities used in webhook handlers
- S6 requires S5 for webhook framework structure
- S7 requires both S3 (hooks) and S4 (protected routes) for error handling
- S8 requires S6 and S7 to complete for comprehensive integration testing

## Technical Constraints

### Required Patterns

- **Clerk SDK Integration**: Use `@clerk/nextjs` for Next.js App Router with server and client component support - [ADR-006](/docs/2-technical/adr/006-clerk-authentication.md)
- **Webhook Signature Verification**: All webhooks must verify Svix signatures before processing - [ADR-006: Webhook Handler](/docs/2-technical/adr/006-clerk-authentication.md#webhook-handler)
- **Monorepo Package**: Package must follow `@repo/*` naming convention - [ADR-001](/docs/2-technical/adr/001-monorepo-turborepo.md)
- **Middleware Composition**: Auth middleware must integrate with `@repo/middleware` composition pattern - [TAD: Edge Middleware Architecture](/docs/2-technical/2-tad-edge-middleware.md)

### Technology Decisions

| Decision             | Choice  | Reference                                                                                     |
| -------------------- | ------- | --------------------------------------------------------------------------------------------- |
| Auth Provider        | Clerk   | [ADR-006: Clerk for Authentication](/docs/2-technical/adr/006-clerk-authentication.md)        |
| Webhook Verification | Svix    | [ADR-006: Webhook Handler](/docs/2-technical/adr/006-clerk-authentication.md#webhook-handler) |
| Database ORM         | Drizzle | [ADR-005: Drizzle as ORM](/docs/2-technical/adr/005-drizzle-orm.md)                           |
| Hosting Platform     | Vercel  | [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md)            |

### Constraints

- **No Product-Specific Roles**: This epic covers generic auth only; roles (internal, product-seller, agency-seller, client) are defined in Epic 2B.7
- **No Organisation Context**: Organisation-aware authentication deferred to Epic 2B.7
- **Edge Runtime Compatibility**: Auth middleware must work within Vercel Edge runtime constraints
- **Generic User Table Only**: Webhook sync uses generic user fields; product-specific user fields deferred to Epic 2B.1
- **Session Cookie Only**: Use Clerk's httpOnly secure cookies; no custom token storage

## Out of Scope

The following items are explicitly NOT part of this epic:

- **Product-specific roles** (Internal, Product-Seller, Agency-Seller, Client) - Deferred to Epic 2B.7
- **Organisation context in auth** - Deferred to Epic 2B.7 (Product Auth Roles & Permissions)
- **Role-based permission utilities** (`canAccess()`, `usePermissions()`) - Deferred to Epic 2B.7
- **Product-specific webhook handlers** (organisation membership changes) - Deferred to Epic 2B.7
- **Sign-in/Sign-up UI pages** - Handled in application layer, not package
- **Custom OAuth provider configuration** - Use Clerk dashboard configuration
- **CSRF protection middleware** - Handled by `@repo/middleware` package (Epic 2A.6)
- **MFA/2FA configuration** - Configurable via Clerk dashboard, not code

## Actions or Decisions Required

> **Note**: Flag decisions that need resolution before or during implementation.

| Decision                          | Options                                             | Impact                                   | Status                                             |
| --------------------------------- | --------------------------------------------------- | ---------------------------------------- | -------------------------------------------------- |
| Clerk environment variable naming | `CLERK_*` vs `NEXT_PUBLIC_CLERK_*`                  | Affects which vars are client-accessible | ✅ Resolved: Use standard Clerk naming per ADR-006 |
| Webhook retry handling            | Queue vs synchronous                                | Affects user sync reliability            | ⬜ Open                                            |
| User table schema                 | Minimal (clerkId, email) vs extended (name, avatar) | Affects initial sync implementation      | ✅ Resolved: Extended per ADR-006 webhook example  |

## Risks and Mitigations

| Risk                                            | Likelihood | Impact | Mitigation                                                            |
| ----------------------------------------------- | ---------- | ------ | --------------------------------------------------------------------- |
| Clerk SDK version compatibility with Next.js 16 | Low        | High   | Pin to stable version, test during setup story                        |
| Webhook delivery failures                       | Low        | Medium | Implement idempotent handlers, log failures for retry                 |
| Token refresh race conditions                   | Low        | Medium | Use Clerk's built-in token management, don't implement custom refresh |
| Edge runtime limitations with Clerk SDK         | Low        | Medium | Use `@clerk/nextjs` which is edge-compatible                          |

## Estimated Effort

| Metric          | Value                 |
| --------------- | --------------------- |
| Total Stories   | 8                     |
| Total Hours     | 34h                   |
| Calendar Days   | 3-4 days              |
| Parallel Tracks | 3 (S3/S4, then S5/S7) |

### Story Breakdown

| Size      | Count | Hours |
| --------- | ----- | ----- |
| XS (1-2h) | 0     | 0h    |
| S (2-4h)  | 3     | 10h   |
| M (4-8h)  | 5     | 24h   |
| L (8-16h) | 0     | 0h    |

## References

### Internal Documentation

- [PRD: Feature M.4 - Authentication & Authorization](/docs/1-product/1-prd.md#feature-m4-authentication--authorization)
- [TAD: Security Architecture](/docs/2-technical/2-tad.md#security-architecture)
- [TAD: Authentication Flow](/docs/2-technical/2-tad.md#authentication-flow)
- [TAD: Security Architecture (Detailed)](/docs/2-technical/2-tad-security-architecture.md)
- [Roadmap: Phase 2A](/docs/1-product/3-roadmap.md#phase-2a-core-platform-packages-week-2)

### ADRs

- [ADR-006: Clerk for Authentication](/docs/2-technical/adr/006-clerk-authentication.md)
- [ADR-005: Drizzle as ORM](/docs/2-technical/adr/005-drizzle-orm.md)
- [ADR-007: Multi-tenant Data Model](/docs/2-technical/adr/007-multi-tenant-model.md)

### External Documentation

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Next.js Quickstart](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Webhooks](https://clerk.com/docs/integrations/webhooks)
- [Clerk Organisations](https://clerk.com/docs/Organisations/overview)
- [Svix Webhook Verification](https://docs.svix.com/receiving/verifying-payloads/how)

## Status

- **State**: Not Started
- **Started**: -
- **Completed**: -
- **Stories Complete**: 0/8
