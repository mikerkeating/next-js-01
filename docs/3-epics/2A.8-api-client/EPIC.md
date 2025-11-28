# Epic 2A.8: API Client Package

> **To create stories for this epic:** Define the epic scope and acceptance criteria first, then break down into stories following the [story template](../../0-process/references/story-details-template.md). Each story should be independently implementable and testable.

## Context

- **PRD Reference**: [PRD: Technical Requirements](/docs/1-product/1-prd.md#technical-requirements)
- **TAD Reference**: [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture)
- **Detailed TAD**: [TAD: Package Architecture (Detailed)](/docs/2-technical/2-tad-package-architecture.md)
- **Phase**: 2A - Core Platform Packages
- **Type**: Foundation

## Dependencies

### Requires (Must Complete First)

| Epic | Title | Reason |
|------|-------|--------|
| 2A.6 | [Middleware Package](../2A.6-middleware/EPIC.md) | Provides request interceptor patterns and error handling utilities used by API client |
| 2A.7 | [Auth Infrastructure](../2A.7-auth-infra/EPIC.md) | Provides authentication token injection for authenticated API requests |

### Blocks (Enables These Epics)

| Epic | Title | What This Provides |
|------|-------|-------------------|
| 3A.1 | CDN & Asset Management Application | Type-safe client for CDN API interactions |
| 3A.2 | Routing Application Shell | API client for route configuration and data fetching |
| 3B.1 | API Application (Product Endpoints) | Base client infrastructure that product API endpoints use |

### Can Run in Parallel With

| Epic | Title | Notes |
|------|-------|-------|
| 2A.3 | [Observability Package](../2A.3-observability/EPIC.md) | Independent package with no shared dependencies |
| 2A.4 | [Analytics Infrastructure](../2A.4-analytics-infra/EPIC.md) | Independent package with no shared dependencies |
| 2A.5 | [UI Component Library](../2A.5-ui-components/EPIC.md) | Independent package with no shared dependencies |

## Overview

Create the `@repo/api-client` package providing a type-safe, feature-rich API communication layer for Next.js applications. This package wraps the native `fetch` API with interceptors, automatic retry logic, caching utilities, and TypeScript generics for type-safe request/response handling. It supports both server components and client components, with automatic authentication token injection via integration with `@repo/auth`.

**Key Deliverables:**

- `@repo/api-client` package with base client wrapping native fetch
- Request interceptors for authentication token injection
- Response interceptors for error handling (401, 403, 404, 500)
- Retry mechanism with exponential backoff for transient failures
- Request caching utilities with configurable TTL
- TypeScript generic types for type-safe API calls
- File upload support with progress tracking
- Server and client component compatibility
- Configurable base URL and default headers

## Acceptance Criteria

> **Note**: Epic acceptance criteria should be high-level outcomes. Story-level criteria provide the detailed verification.

- [ ] `@repo/api-client` package is published and can be imported by applications
- [ ] API client automatically injects authentication token from `@repo/auth` for authenticated requests
- [ ] Client handles 401 errors by redirecting to sign-in page (client-side) or returning appropriate error (server-side)
- [ ] Client handles 403, 404, and 500 errors with structured error responses
- [ ] Retry mechanism automatically retries failed requests with exponential backoff (max 3 retries)
- [ ] Request caching reduces duplicate requests and improves performance
- [ ] TypeScript generics provide full type inference for request body and response data
- [ ] File uploads work with progress callback and multipart/form-data encoding
- [ ] Client works seamlessly in both server components and client components
- [ ] Package has ≥80% test coverage
- [ ] All stories complete and verified
- [ ] Documentation updated (README, inline JSDoc, usage examples)

## Stories

| ID | Title | Size | Status | Depends On | Blocks |
|----|-------|------|--------|------------|--------|
| S1 | [Package Setup and Base Client](./S1-package-setup.md) | M | ⬜ | - | S2, S3, S4, S5, S6 |
| S2 | [Request Interceptors and Auth Integration](./S2-request-interceptors.md) | M | ⬜ | S1 | S7 |
| S3 | [Response Interceptors and Error Handling](./S3-response-interceptors.md) | M | ⬜ | S1 | S7 |
| S4 | [Retry Logic with Exponential Backoff](./S4-retry-logic.md) | S | ⬜ | S1 | S7 |
| S5 | [Request Caching Utilities](./S5-request-caching.md) | M | ⬜ | S1 | S7 |
| S6 | [File Upload Support](./S6-file-upload.md) | S | ⬜ | S1 | S7 |
| S7 | [Integration Tests and Documentation](./S7-integration-tests.md) | M | ⬜ | S2, S3, S4, S5, S6 | - |

**Status Legend**: ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Blocked

## Story Dependency Graph

```
S1 (Package setup & base client)
 ├──→ S2 (Request interceptors & auth)
 ├──→ S3 (Response interceptors & errors)
 ├──→ S4 (Retry logic)
 ├──→ S5 (Request caching)
 └──→ S6 (File upload)
       ↓
      S7 (Integration tests & documentation)
```

**Parallel Execution Notes:**

- S2, S3, S4, S5, and S6 can all run in parallel after S1 completes
- S7 requires all feature implementations (S2-S6) to complete before integration testing

## Technical Constraints

### Required Patterns

- **Native Fetch Wrapper**: Use native `fetch` API as foundation for maximum compatibility with server and client components - [TAD: Package Architecture](/docs/2-technical/2-tad-package-architecture.md)
- **TypeScript Generics**: All public methods must use generics for type-safe request/response handling - [TAD: API Design](/docs/2-technical/2-tad.md#api-design)
- **Monorepo Package**: Package must follow `@repo/*` naming convention - [ADR-001](/docs/2-technical/adr/001-monorepo-turborepo.md)
- **Auth Integration**: Authentication token must be obtained from `@repo/auth` package - [ADR-006](/docs/2-technical/adr/006-clerk-authentication.md)

### Technology Decisions

| Decision | Choice | Reference |
|----------|--------|-----------|
| HTTP Client | Native fetch (wrapped) | [TAD: Package Architecture](/docs/2-technical/2-tad-package-architecture.md) |
| Auth Provider | Clerk via @repo/auth | [ADR-006: Clerk for Authentication](/docs/2-technical/adr/006-clerk-authentication.md) |
| Type System | TypeScript generics | [TAD: API Design](/docs/2-technical/2-tad.md#api-design) |
| Monorepo Tool | Turborepo | [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md) |

### Constraints

- **No External HTTP Libraries**: Must use native `fetch` for Next.js server/client compatibility; avoid axios, ky, etc.
- **Server Component Compatibility**: All methods must work in React Server Components without client-only APIs
- **Edge Runtime Compatibility**: Core functionality must work in Vercel Edge runtime (no Node.js-specific APIs)
- **Retry Limits**: Maximum 3 retries with exponential backoff (1s, 2s, 4s delays)
- **Cache Size Limits**: In-memory cache limited to prevent memory leaks (configurable max entries)
- **File Upload Size**: Must support uploads up to 100MB (Vercel limit)

## Out of Scope

The following items are explicitly NOT part of this epic:

- **GraphQL Support** - REST-only in this epic; GraphQL deferred to future enhancement
- **WebSocket/Real-time** - Deferred to Epic 3B.6 (Authenticated Tools Application)
- **Request Queuing** - Not required for MVP; can be added later if needed
- **Offline Support** - PWA/offline capabilities deferred to post-MVP
- **API Response Transformation** - Consumer responsibility; client returns raw response data
- **Product-Specific API Methods** - Generic client only; product endpoints implemented in consuming apps
- **Rate Limiting (Client-Side)** - Server-side rate limiting handled by `@repo/middleware`

## Actions or Decisions Required

> **Note**: Flag decisions that need resolution before or during implementation.

| Decision | Options | Impact | Status |
|----------|---------|--------|--------|
| Cache storage backend | In-memory Map vs external cache (Vercel KV) | Affects cache persistence and memory usage | ✅ Resolved: In-memory for client, server uses Next.js cache |
| Retry trigger conditions | Network errors only vs include 5xx | Affects retry behaviour and server load | ⬜ Open |
| Token refresh handling | Client refreshes vs delegate to @repo/auth | Affects token lifecycle management | ✅ Resolved: Delegate to @repo/auth per ADR-006 |

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Server/client component incompatibility | Medium | High | Test all methods in both environments during development |
| Memory leaks from unbounded cache | Low | Medium | Implement LRU eviction with configurable max size |
| Auth token timing issues | Low | Medium | Use Clerk's built-in token management via @repo/auth |
| Large file upload failures | Low | Medium | Implement chunked uploads for files >50MB, progress callbacks for UX |

## Estimated Effort

| Metric | Value |
|--------|-------|
| Total Stories | 7 |
| Total Hours | 34h |
| Calendar Days | 3-4 days |
| Parallel Tracks | 5 (S2-S6 can run in parallel) |

### Story Breakdown

| Size | Count | Hours |
|------|-------|-------|
| XS (1-2h) | 0 | 0h |
| S (2-4h) | 2 | 8h |
| M (4-8h) | 5 | 26h |
| L (8-16h) | 0 | 0h |

## References

### Internal Documentation

- [PRD: Technical Requirements](/docs/1-product/1-prd.md#technical-requirements)
- [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture)
- [TAD: Package Architecture (Detailed)](/docs/2-technical/2-tad-package-architecture.md)
- [TAD: API Design](/docs/2-technical/2-tad.md#api-design)
- [Roadmap: Phase 2A](/docs/1-product/3-roadmap.md#phase-2a-core-platform-packages-week-2)

### ADRs

- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)
- [ADR-006: Clerk for Authentication](/docs/2-technical/adr/006-clerk-authentication.md)

### External Documentation

- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Fetch API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [TypeScript Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Exponential Backoff Pattern](https://cloud.google.com/memorystore/docs/redis/exponential-backoff)

## Status

- **State**: Not Started
- **Started**: -
- **Completed**: -
- **Stories Complete**: 0/7
