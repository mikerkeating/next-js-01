# Technical Architecture Document (TAD)

## Document Information

| Field            | Value                                                           |
| ---------------- | --------------------------------------------------------------- |
| **Version**      | 2.0                                                             |
| **Status**       | Draft                                                           |
| **Owner**        | Technical Lead / Architect                                      |
| **Last Updated** | 2025-11-24                                                      |
| **Dependencies** | [Product Requirements Document (PRD)](/docs/1-product/1-prd.md) |

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Steel Thread & Deployment Pipeline](#steel-thread--deployment-pipeline)
5. [Observability Architecture](#observability-architecture)
6. [Content Management Architecture](#content-management-architecture)
7. [Testing Architecture](#testing-architecture)
8. [Package Architecture](#package-architecture)
9. [Developer Experience](#developer-experience)
10. [Edge Middleware Architecture](#edge-middleware-architecture)
11. [CDN Architecture](#cdn-architecture)
12. [UI Components Architecture](#ui-components-architecture)
13. [Documentation Architecture](#documentation-architecture)
14. [Infrastructure](#infrastructure)
15. [Security Architecture](#security-architecture)
16. [Integration Points](#integration-points)
17. [Performance Targets](#performance-targets)
18. [Architecture Decision Records](#architecture-decision-records)
19. [Appendices](#appendices)

---

## Overview

### Purpose

This Technical Architecture Document (TAD) defines how we're building the system – covering technology choices, system design, architectural patterns, and key technical decisions.

### Scope

This document covers:

- Technology stack selection and rationale
- High-level system architecture
- Application structure and data flow
- Infrastructure and deployment strategy
- Security and authentication approach
- Integration patterns with third-party services
- Performance and scalability targets
- Key architectural decisions (ADRs)

### References

- [Product Requirements Document (PRD)](/docs/1-product/1-prd.md)
- [Epic Delivery Roadmap](/docs/1-product/3-roadmap.md)
- [Architecture Decision Records](adr/)

---

## Technology Stack

> **Canonical Reference**: For exact version constraints and package.json configurations, see [Canonical Technology Versions](/docs/2-technical/references/canonical-versions.md). The tables below provide rationale; the canonical file is the single source of truth for version numbers.

### Framework & Runtime

| Component           | Selection  | Version  | Rationale                                                                                   |
| ------------------- | ---------- | -------- | ------------------------------------------------------------------------------------------- |
| **Framework**       | Next.js    | 16       | Modern React framework with App Router, server components, and excellent Vercel integration |
| **Language**        | TypeScript | 5.x      | Type safety, better DX, industry standard                                                   |
| **Runtime**         | Node.js    | 24.x LTS | Stable LTS version with good performance                                                    |
| **Package Manager** | pnpm       | 9.x      | Fast, efficient, workspace support                                                          |
| **Monorepo Tool**   | Turborepo  | Latest   | Build caching, task orchestration, Vercel integration                                       |

**ADR Reference**: [ADR-001: Monorepo with Turborepo](adr/001-monorepo-turborepo.md), [ADR-002: pnpm as package manager](adr/002-pnpm-package-manager.md), [ADR-003: Next.js 16 as framework](adr/003-nextjs-framework.md)

### Database & ORM

| Component          | Selection       | Version | Rationale                                               |
| ------------------ | --------------- | ------- | ------------------------------------------------------- |
| **Database**       | PostgreSQL      | 16+     | Robust, ACID-compliant, excellent JSON support          |
| **Database Host**  | Neon / Supabase | Latest  | Serverless Postgres with excellent developer experience |
| **ORM**            | Drizzle         | Latest  | Type-safe, performant, excellent DX                     |
| **Migration Tool** | Drizzle Kit     | Latest  | Built-in migration support                              |

**ADR Reference**: [ADR-005: Drizzle as ORM](adr/005-drizzle-orm.md)

### Authentication & Authorization

| Component              | Selection           | Version | Rationale                                              |
| ---------------------- | ------------------- | ------- | ------------------------------------------------------ |
| **Auth Provider**      | Clerk               | Latest  | Modern, feature-rich, excellent UX, webhook support    |
| **Session Management** | Clerk               | Latest  | Built-in with Clerk                                    |
| **Multi-tenancy**      | Custom + Clerk Orgs | Latest  | Leverages Clerk Organizations with custom role mapping |

**ADR Reference**: [ADR-006: Clerk for authentication](adr/006-clerk-authentication.md), [ADR-007: Multi-tenant data model](adr/007-multi-tenant-model.md)

### Hosting & Deployment

| Component            | Selection             | Version | Rationale                                                      |
| -------------------- | --------------------- | ------- | -------------------------------------------------------------- |
| **Hosting Platform** | Vercel                | Latest  | First-class Next.js support, edge network, preview deployments |
| **CDN**              | Vercel Edge Network   | Latest  | Global edge distribution, automatic optimization               |
| **Edge Functions**   | Vercel Edge Functions | Latest  | Low-latency middleware execution                               |

**ADR Reference**: [ADR-004: Vercel as hosting platform](adr/004-vercel-hosting.md)

### Analytics & Observability

| Component             | Selection          | Purpose                                       |
| --------------------- | ------------------ | --------------------------------------------- |
| **Product Analytics** | PostHog            | Event tracking, feature flags, session replay |
| **Web Analytics**     | Google Analytics 4 | Marketing attribution, traffic analysis       |
| **Performance**       | Vercel Analytics   | Core Web Vitals, performance insights         |
| **Error Tracking**    | Sentry             | Error monitoring, performance tracing         |
| **Logging**           | Custom (JSON)      | Structured logging with Vercel integration    |

### UI & Styling

| Component         | Selection    | Version | Rationale                                       |
| ----------------- | ------------ | ------- | ----------------------------------------------- |
| **UI Components** | shadcn/ui    | Latest  | Accessible, customizable, copy-paste components |
| **Styling**       | Tailwind CSS | 4.x     | Utility-first, fast, excellent DX               |
| **Icons**         | Lucide React | Latest  | Consistent, tree-shakeable icon set             |

### Testing

| Component             | Selection             | Purpose                           |
| --------------------- | --------------------- | --------------------------------- |
| **Unit Testing**      | Vitest                | Fast, modern, ESM-native          |
| **Component Testing** | React Testing Library | Component testing with Vitest     |
| **E2E Testing**       | Playwright            | Cross-browser end-to-end testing  |
| **Load Testing**      | k6 / Artillery        | Performance and load testing      |
| **Visual Regression** | Chromatic             | Visual diff testing for Storybook |

### Development Tools

| Component             | Selection  | Purpose                                 |
| --------------------- | ---------- | --------------------------------------- |
| **Component Library** | Storybook  | Component development and documentation |
| **Linting**           | ESLint     | Code quality and consistency            |
| **Formatting**        | Prettier   | Code formatting                         |
| **Type Checking**     | TypeScript | Static type checking                    |
| **Git Hooks**         | Husky      | Pre-commit quality gates                |
| **Commit Linting**    | Commitlint | Conventional commit enforcement         |

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  Web Browser                                                    │
│  ↓                                                              │
│  Next.js Applications (React 19 + Server Components)           │
│  - Marketing Site                                               │
│  - Documentation                                                │
│  - Demo Application                                             │
│  - Authenticated Tools                                          │
│  - Landing Page Builder                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      EDGE MIDDLEWARE                            │
├─────────────────────────────────────────────────────────────────┤
│  Vercel Edge Functions                                          │
│  - Authentication (Clerk)                                       │
│  - Organization Context                                         │
│  - Rate Limiting                                                │
│  - Security Headers                                             │
│  - Logging                                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐   │
│  │ Routing   │  │ API       │  │ CDN       │  │ Tools     │   │
│  │ App       │  │ App       │  │ App       │  │ Apps      │   │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       SHARED PACKAGES                           │
├─────────────────────────────────────────────────────────────────┤
│  @repo/database  @repo/auth  @repo/ui  @repo/analytics         │
│  @repo/config    @repo/middleware    @repo/observability       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DATA & SERVICES LAYER                      │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL (Neon/Supabase)  │  Clerk Auth  │  PostHog        │
│  Edge Config (Vercel)        │  Sentry      │  GA4            │
└─────────────────────────────────────────────────────────────────┘
```

### Monorepo Structure

```
next-js-2025-12-1/
├── apps/
│   ├── routing/          # Main routing layer
│   ├── api/              # REST API endpoints
│   ├── cdn/              # Static asset delivery
│   ├── docs/             # Documentation site
│   ├── demo/             # Demo application
│   ├── marketing/        # Marketing content
│   ├── tools/            # Authenticated tools
│   ├── content/          # Content management
│   └── landing/          # Landing page builder
├── packages/
│   ├── config/           # Shared configs (TS, ESLint, Tailwind)
│   ├── database/         # Database schema & utilities
│   ├── auth/             # Authentication utilities
│   ├── ui/               # UI component library
│   ├── analytics/        # Analytics infrastructure
│   ├── observability/    # Logging & error tracking
│   ├── middleware/       # Shared middleware
│   ├── api-client/       # Type-safe API client
│   ├── org/              # Organization context
│   └── testing/          # Testing utilities
├── docs/
│   ├── 0-product/        # Product documentation (PRD, TAD, roadmap)
│   ├── 3-epics/          # Epic & story specifications
│   ├── 3-references/     # Templates & guides
│   └── adr/              # Architecture Decision Records
├── scripts/              # Build & deployment scripts
├── .github/              # GitHub Actions workflows
├── turbo.json           # Turborepo configuration
├── pnpm-workspace.yaml  # pnpm workspace configuration
└── package.json         # Root package.json
```

**ADR Reference**: [ADR-001: Monorepo with Turborepo](adr/001-monorepo-turborepo.md)

### Data Flow Diagrams

#### Request Flow

```
User Request
    ↓
Vercel Edge Network
    ↓
Edge Middleware (Auth, Org Context, Rate Limiting)
    ↓
Next.js App Router
    ↓
Server Component (Data Fetching)
    ↓
API Client (@repo/api-client)
    ↓
API Route Handler (apps/api)
    ↓
Database Query (Drizzle ORM)
    ↓
PostgreSQL (Neon/Supabase)
    ↓
Response (JSON/HTML)
    ↓
Client Hydration (if interactive)
```

#### Authentication Flow

```
User Login Request
    ↓
Clerk Hosted UI
    ↓
OAuth Provider / Email Magic Link
    ↓
Clerk Webhook → API (/api/webhooks/clerk)
    ↓
User Sync to Database (@repo/database)
    ↓
Session Token (JWT)
    ↓
Stored in Cookie (httpOnly, secure)
    ↓
Middleware validates token on each request
    ↓
User context available in app
```

#### Multi-Tenant Data Access

```
Request with Org Context
    ↓
Middleware extracts org_id from session/header
    ↓
Inject org_id into request context
    ↓
Database query with org_id filter
    ↓
Row-Level Security (RLS) policy enforcement
    ↓
Only org-scoped data returned
```

### API Design

#### Versioning Strategy

- **URL Versioning**: `/v1/resource`, `/v2/resource`
- **Major versions only**: Breaking changes require new version
- **Deprecation Policy**: 6 months notice before removal

#### REST Conventions

| Method | Endpoint        | Purpose         |
| ------ | --------------- | --------------- |
| GET    | `/v1/users`     | List users      |
| GET    | `/v1/users/:id` | Get single user |
| POST   | `/v1/users`     | Create user     |
| PATCH  | `/v1/users/:id` | Update user     |
| DELETE | `/v1/users/:id` | Delete user     |

#### Response Format

All API responses follow a consistent structure with success/error indicators, data payload, and optional metadata for pagination.

#### Error Format

Errors include a success flag, error code, human-readable message, and field-level validation details where applicable.

### Database Schema Overview

Our database follows a multi-tenant architecture with strict Organization-level data isolation. The schema supports:

- **User Management**: Users with soft deletion and privacy compliance fields
- **Organization Multi-tenancy**: Organizations with user-role associations (internal, product-seller, agency-seller, client)
- **Content Management**: Flexible JSONB-based content storage with Organization scoping
- **Audit Trail**: Comprehensive audit logging for compliance (GDPR/CCPA)
- **Privacy & Compliance**: Deletion requests, data export requests, user consents, and privacy preferences
- **Analytics**: Event tracking with Organization and user context

**Key Design Principles**:

- All tenant-scoped tables include `Organization_id` for row-level security
- Soft deletion with grace periods for GDPR "right to be forgotten"
- JSONB fields for flexible schema evolution
- Comprehensive audit logging for all mutations

**Entity Relationships**:

- Users ↔ Organizations (many-to-many through user_Organizations)
- Content, Analytics Events scoped to Organizations
- Deletion/Export Requests linked to Users

**ADR Reference**: [ADR-007: Multi-tenant data model](adr/007-multi-tenant-model.md)

---

## Steel Thread & Deployment Pipeline

Our deployment pipeline establishes automated, repeatable deployments from developer laptop to production. The steel thread proves that code can flow through all environments with proper quality gates.

**Key Components**:

- **Health Check Endpoint**: `/api/health` with database, auth, and cache validation
- **GitHub Actions CI/CD**: Automated lint, type-check, test, build, and E2E smoke tests
- **Vercel Integration**: Automatic preview deployments for PRs, production deploys on merge
- **Environment Management**: Development, Preview, Staging, Production with proper variable isolation
- **Rollback Procedures**: Instant rollback via Vercel, database rollback via migrations
- **SSL Management**: Automatic certificate provisioning and renewal via Vercel

**Quality Gates**:

- Pre-commit: Lint, format, type-check
- PR: Full test suite, build verification, E2E smoke tests
- Production: Staging smoke tests, health checks, monitoring validation

📄 **Detailed Implementation**: [Steel Thread & Deployment Pipeline](2-tad-steel-thread-deployment.md)

---

## Observability Architecture

Comprehensive observability ensures the application is monitored, debuggable, and maintainable through structured logging, error tracking, and health monitoring.

**Key Principles**:

- **Structured Logging**: JSON format with 5 log levels (debug, info, warn, error, fatal)
- **Error Boundaries**: React error boundaries with automatic Sentry reporting
- **Real-time Monitoring**: Health checks, Core Web Vitals tracking
- **Privacy-First**: No PII in logs or error reports (user IDs are hashed)
- **Performance Tracking**: Custom metrics, database query performance, API response times

**Components**:

- **Logger Package** (`@repo/logger`): Structured JSON logging with environment-aware formatting
- **Sentry Integration**: Error tracking with source maps, breadcrumbs, and user context
- **React Error Boundary**: Graceful error handling with fallback UI
- **API Error Middleware**: Consistent error handling and logging across all endpoints
- **Web Vitals Tracking**: LCP, FID, CLS monitoring with Vercel Analytics
- **PostHog Integration**: Product analytics with feature flags and session replay

**Log Retention**:

- Debug: 7 days
- Info: 30 days
- Warn: 90 days
- Error: 180 days
- Fatal: 365 days

📄 **Detailed Implementation**: [Observability Architecture](2-tad-observability.md)

---

## Content Management Architecture

Type-safe, versioned content management system with multi-tenant isolation supporting various content types (landing pages, blog posts, documentation, product templates).

**Key Features**:

- **Type-Safe Schemas**: Zod validation for all content types with TypeScript inference
- **Version Control**: Full version history with diff tracking and rollback capability
- **Multi-Tenant Isolation**: Organization-scoped content with RBAC
- **Draft/Published Workflow**: Content lifecycle management with approval workflows
- **Migration System**: Legacy content importer for smooth transitions

**Content Types**:

- Landing Pages (hero, features, CTA sections)
- Blog Posts (markdown with frontmatter)
- Documentation Pages (hierarchical navigation)
- Product Templates (reusable product configurations)

**Storage Strategy**:

- Metadata in PostgreSQL for queryability
- Full content in JSONB for flexibility
- Version snapshots for history tracking
- Indexed fields for performance

📄 **Detailed Implementation**: [Content Management Architecture](2-tad-content-management.md)

---

## Testing Architecture

Comprehensive testing strategy following the testing pyramid: more unit tests, fewer integration tests, minimal E2E tests.

**Testing Philosophy**:

- **Test Early**: Fast tests in development, comprehensive tests in CI
- **Test Realistically**: Real database for integration tests, real browser for E2E
- **Test Coverage**: Minimum 80% overall, 95% for critical paths
- **Test Isolation**: Independent tests that can run in parallel

**Testing Layers**:

1. **Unit Tests (60%)**: Component logic, utilities, helpers with Vitest
2. **Integration Tests (30%)**: API routes, database queries, auth flows
3. **E2E Tests (10%)**: Critical user journeys with Playwright
4. **Load Tests**: k6 for performance testing (p95 < 500ms, p99 < 1s, <1% error rate)
5. **Visual Regression**: Chromatic for UI component testing
6. **Accessibility Tests**: axe-core/Playwright for WCAG 2.1 Level AA compliance

**Test Infrastructure**:

- Dedicated test database with automatic seeding
- Test fixtures and factories for consistent test data
- Parallel test execution with worker isolation
- CI/CD integration with coverage reporting

📄 **Detailed Implementation**: [Testing Architecture](2-tad-testing.md)

---

## Package Architecture

Monorepo with 12 shared packages providing reusable functionality across all applications following a layered architecture.

**Package Layers** (Foundation → Data → Service → Application → Testing):

**Foundation Layer**:

- `@repo/config`: Shared configurations (TypeScript, ESLint, Tailwind)
- `@repo/logger`: Structured JSON logging
- `@repo/validation`: Zod validation schemas

**Data Layer**:

- `@repo/database`: Drizzle ORM schema, queries, migrations

**Service Layer**:

- `@repo/auth`: Clerk integration with RBAC
- `@repo/org`: Multi-tenant Organization context
- `@repo/api-client`: Type-safe API client
- `@repo/analytics`: PostHog/GA4 event tracking
- `@repo/observability`: Sentry/logging/health checks

**Application Layer**:

- `@repo/ui`: shadcn/ui component library
- `@repo/middleware`: Next.js middleware composition

**Testing Layer**:

- `@repo/testing`: Test fixtures, helpers, mocks

**Dependency Rules**:

- Packages can only depend on packages in lower layers
- Circular dependencies are prevented
- Public API contracts are strictly enforced
- Version synchronization via workspace protocol

📄 **Detailed Implementation**: [Package Architecture](2-tad-package-architecture.md)

---

## Developer Experience

Comprehensive developer experience strategy covering local setup, quality gates, and PR workflows to maximize productivity.

**Quality Gates**:

**Pre-commit Hooks** (Husky/lint-staged):

- ESLint auto-fix
- Prettier formatting
- TypeScript type checking (changed files only)

**CI/CD Pipeline Gates**:

1. ESLint validation
2. TypeScript type checking (full codebase)
3. Vitest (80% coverage minimum)
4. Build verification
5. E2E smoke tests
6. Bundle size limits (≤200KB)
7. Security audit (pnpm audit)
8. Accessibility checks (axe-core)

**Local Development Setup**:

- Prerequisites: Node.js 24.x, pnpm 10.x, Docker (optional for local DB)
- First-time setup guide (6 steps from clone to running server)
- VS Code configuration with 15 recommended extensions
- Common development tasks (testing, database, building, linting)

**PR Workflow**:

- Branch naming conventions (feature/_, fix/_, epic/_, hotfix/_)
- Conventional commits (feat, fix, docs, style, refactor, test, chore)
- PR template with checklist
- Squash-and-merge strategy for clean git history
- Development workflow: branch → develop → test → commit → push → PR → review → merge → deploy

📄 **Detailed Implementation**: [Developer Experience](2-tad-developer-experience.md)

---

## Edge Middleware Architecture

Composable middleware chain executing at the edge for authentication, Organization context, rate limiting, and security headers.

**Middleware Chain Composition**:

- Composable middleware with context passing
- Short-circuit support for early returns
- Conditional execution based on path patterns
- Error handling wrapper for graceful failures

**Middleware Components**:

1. **Logging Middleware**: Structured request/response logging with trace IDs
2. **Security Headers**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
3. **Organization Context Extraction**: 5 methods (header, subdomain, path, query, cookie)
4. **Authentication**: Clerk session verification with redirect handling
5. **CSRF Protection**: Token validation on mutations (POST, PUT, DELETE, PATCH)
6. **Rate Limiting**: 100/min per user, 1000/min per org, 20/min anonymous (Vercel KV)
7. **Role-Based Route Protection**: requireRole and requirePermission helpers

**Performance Targets**:

- Cold start: < 30ms target, 50ms max
- Warm execution: < 5ms target, 10ms max
- Total chain: < 20ms target, 50ms max

**Optimization Techniques**:

- Edge Config for fast lookups
- Lazy loading of non-critical middleware
- Request coalescing for parallel checks
- Early returns to skip unnecessary processing

📄 **Detailed Implementation**: [Edge Middleware Architecture](2-tad-edge-middleware.md)

---

## CDN Architecture

Global content delivery network strategy for optimal performance, efficient caching, and reduced latency across all geographic regions.

**Core Strategy**:

- **Vercel Edge Network**: 40+ global edge locations with automatic geographic routing
- **Multi-Layer Caching**: Edge cache, CDN cache, browser cache with intelligent invalidation
- **Asset Optimization**: Automatic image optimization, compression, and format conversion
- **Cache-First Delivery**: Static assets served from edge with <50ms latency globally

**Caching Layers**:

1. **Browser Cache**: Client-side caching with cache-control headers
   - Static assets: 1 year (immutable with hashed filenames)
   - HTML pages: No cache (dynamic content)
   - API responses: No cache (fresh data)

2. **Edge Cache** (Vercel Edge Network):
   - Static assets: Cached until deployment
   - ISR pages: Stale-while-revalidate with configurable TTL
   - API routes: Selective caching with cache tags

3. **Application Cache** (Next.js):
   - Server component cache
   - Data cache with fetch memoization
   - Full route cache for static routes

**Asset Delivery**:

- **Images**: Next.js Image Optimization with WebP/AVIF conversion, lazy loading, responsive sizes
- **JavaScript/CSS**: Minification, tree-shaking, code splitting with Turbopack
- **Fonts**: Self-hosted with font-display: swap, preload hints
- **Static Files**: Immutable with content-hash filenames, 1-year cache headers

**Cache Invalidation Strategies**:

- **On-demand**: Manual purge via Vercel API or webhook triggers
- **Deployment-based**: Automatic purge on new deployment
- **Tag-based**: Granular cache invalidation using Next.js cache tags
- **Time-based**: ISR revalidation at configured intervals

**Geographic Distribution**:

- Primary region: US-EAST-1 (application/database)
- Edge POPs: Global distribution across 6 continents
- Smart routing: Automatic failover and load balancing
- Regional optimization: Asset pre-warming in high-traffic regions

**Performance Targets**:

- Edge cache hit ratio: >90%
- TTFB from edge: <50ms (p95)
- Static asset delivery: <100ms globally (p95)
- Cache invalidation propagation: <60 seconds globally

**CDN Features**:

- **DDoS Protection**: Automatic traffic filtering and rate limiting at edge
- **SSL/TLS**: Automatic certificate provisioning and renewal
- **Compression**: Brotli/Gzip compression for text assets
- **HTTP/3 Support**: QUIC protocol for improved performance
- **Bandwidth Optimization**: Smart compression and efficient encoding

📄 **Detailed Implementation**: [CDN Architecture](2-tad-cdn.md)

---

## UI Components Architecture

Reusable UI component library powering the product interface with consistent UX, proper permission controls, and data visualization.

**Core Components**:

1. **Role Badge**: Visual role indicators (internal, product-seller, agency-seller, client)
2. **Content Card**: Content display with Organization context and permission-gated actions
3. **Permission Gate**: Conditional rendering based on user permissions
4. **User Role Selector**: Role assignment interface for administrators
5. **Radar Chart**: Multi-dimensional maturity model visualization
6. **Timeline/Progress**: Temporal progression and milestone visualization
7. **Advanced Search**: Faceted filtering with real-time results

**Component Standards**:

- Built on shadcn/ui foundation
- Styled with Tailwind CSS
- WCAG 2.1 Level AA compliant
- 90%+ test coverage
- Full Storybook documentation
- Visual regression testing with Chromatic

**Testing Requirements**:

- Vitest unit tests for all variants
- React Testing Library for behavior testing
- jest-axe for accessibility validation
- Storybook stories for all states
- Chromatic for visual regression

📄 **Detailed Implementation**: See UI component specifications in System Architecture section above

---

## Documentation Architecture

Comprehensive documentation strategy treating documentation as a first-class product deliverable, created alongside code with two distinct audiences for every package.

**Core Principle**: Documentation is not an afterthought but a product deliverable. Every package, application, and decision must have documentation created concurrently with code implementation.

**Documentation Pyramid** (4 Layers):

1. **WHY Layer (Strategic)**: PRD, TAD, ADRs explaining strategic decisions
2. **WHAT Layer (Product)**: User documentation, API reference, feature guides
3. **HOW Layer (Implementation)**: Package docs, inline comments, runbooks
4. **CONTEXT Layer (Development)**: Epic/story specs, READMEs, contributing guides

**Two Audiences Per Package**:

- **Package Maintainer**: Internal developers who build and maintain the package
  - Documentation: ARCHITECTURE.md, CONTRIBUTING.md, TESTING.md, inline code comments
  - Focus: How the package works internally, how to add features, testing strategy

- **Package Consumer**: Developers who use the package in applications
  - Documentation: README.md (top section), generated API docs, usage examples, Storybook
  - Focus: How to install, configure, and use the package effectively

**Documentation Generation**:

- **Auto-generated**: API reference (TypeDoc), component library (Storybook), OpenAPI specs, database schema
- **Hand-written**: Architecture diagrams (Mermaid), guides, ADRs, runbooks, operational procedures

**Quality Gates**:

- CI/CD enforces documentation completeness
- All packages must have README.md
- All public functions require JSDoc
- All API endpoints in OpenAPI spec
- Markdown link validation
- Documentation review as part of PR process

**Documentation Formats**:

- Developers: Static site (Nextra/Docusaurus)
- API Consumers: Interactive docs (Swagger UI)
- Component Users: Storybook (deployed)
- Operations: Runbooks in repo + wiki

**Maintenance Strategy**:

- Living documentation updated with every code change
- Quarterly documentation audits for accuracy
- User feedback loop tracking most-viewed docs
- Documentation degradation prevention

📄 **Detailed Implementation**: [Documentation Architecture](2-tad-documentation.md)

---

## Infrastructure

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      VERCEL GLOBAL NETWORK                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  US-EAST    │  │  EU-WEST    │  │  ASIA-PAC   │             │
│  │  Edge POP   │  │  Edge POP   │  │  Edge POP   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│         │                │                │                     │
│         └────────────────┴────────────────┘                     │
│                          ↓                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         Vercel Serverless Functions (US-EAST-1)        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ↓                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         PostgreSQL (Neon/Supabase - Primary Region)    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Environment Strategy

| Environment     | Purpose                | URL Pattern           | Deployment Trigger       |
| --------------- | ---------------------- | --------------------- | ------------------------ |
| **Development** | Local development      | `localhost:3000`      | Manual (local)           |
| **Preview**     | PR review              | `*.vercel.app`        | PR creation/update       |
| **Staging**     | Pre-production testing | `staging.example.com` | Push to `staging` branch |
| **Production**  | Live application       | `example.com`         | Push to `main` branch    |

### Environment Variables

| Variable                  | Description                  | Required In         |
| ------------------------- | ---------------------------- | ------------------- |
| `DATABASE_URL`            | PostgreSQL connection string | All                 |
| `CLERK_SECRET_KEY`        | Clerk API secret             | All                 |
| `CLERK_PUBLISHABLE_KEY`   | Clerk public key             | All                 |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project key          | Production, Staging |
| `SENTRY_DSN`              | Sentry error tracking        | Production, Staging |
| `NEXT_PUBLIC_API_URL`     | API base URL                 | All                 |

### CI/CD Approach

#### Pull Request Workflow

```yaml
Trigger: pull_request
Jobs:
  - Install dependencies (pnpm install)
  - Lint (turbo run lint)
  - Type check (turbo run type-check)
  - Run tests (turbo run test)
  - Build all apps (turbo run build)
  - E2E smoke tests on preview deployment
  - Coverage report to PR comment
```

#### Main Branch Workflow

```yaml
Trigger: push to development
Jobs:
  - Install dependencies
  - Full test suite
  - Build production
  - Deploy to staging
  - Smoke tests on staging
  - Deploy to production
  - Notify team (Slack/Discord)
```

### Monitoring & Observability

#### Metrics to Track

| Category           | Metrics                                   | Tool             |
| ------------------ | ----------------------------------------- | ---------------- |
| **Performance**    | Core Web Vitals (LCP, FID, CLS), TTFB     | Vercel Analytics |
| **Errors**         | Error rate, error types, stack traces     | Sentry           |
| **Usage**          | Page views, user journeys, feature usage  | PostHog, GA4     |
| **Infrastructure** | Function duration, cold starts, bandwidth | Vercel Dashboard |
| **Database**       | Query performance, connection pool usage  | Neon/Supabase    |

#### Alerting Strategy

| Alert Type               | Threshold        | Notification Channel |
| ------------------------ | ---------------- | -------------------- |
| Error rate spike         | >1% of requests  | Slack + PagerDuty    |
| High latency             | p95 > 2s         | Slack                |
| Database connection pool | >80% utilization | Email                |
| Failed deployment        | Any              | Slack + Email        |

### Backup & Disaster Recovery

#### Database Backups

- **Automated**: Daily full backups via Neon/Supabase
- **Retention**: 30 days for production, 7 days for staging
- **Point-in-Time Recovery**: Last 7 days

#### Recovery Objectives

- **RTO (Recovery Time Objective)**: 1 hour
- **RPO (Recovery Point Objective)**: 24 hours
- **Backup Testing**: Monthly restore drills

#### Rollback Strategy

- **Application**: Instant rollback via Vercel (previous deployment)
- **Database**: Restore from backup + replay migrations
- **Maximum Downtime**: 15 minutes for critical issues

---

## Security Architecture

Comprehensive security strategy covering authentication, authorization, data protection, and compliance (GDPR/CCPA).

**Authentication Flow**:

1. User initiates login via Clerk
2. Clerk handles OAuth/magic link/password flow
3. Clerk issues JWT token
4. Token stored in httpOnly, secure cookie
5. Middleware validates token on each request
6. User context injected into request

**Authorization Model**:

- **Roles**: Internal, Product-Seller, Agency-Seller, Client
- **RBAC**: Role-based access control with granular permissions
- **Resource-Level Permissions**: Organization-scoped data access

**Data Protection**:

- **In Transit**: TLS 1.3 (enforced by Vercel)
- **At Rest**: Database-level encryption (Neon/Supabase)
- **Sensitive Fields**: Application-level AES-256-GCM encryption for PII
- **Row-Level Security**: Database policies enforce Organization isolation

**Compliance**:

- **GDPR**: Right to access, right to deletion (30-day grace period), data export, consent management
- **CCPA**: "Do Not Sell" opt-out, data disclosure, privacy preferences
- **Audit Trail**: Comprehensive audit logging for all data mutations
- **Vendor Management**: DPA tracking, compliance verification

**Security Implementation**:

- **CSRF Protection**: HMAC-signed tokens for all mutations
- **Input Validation**: Zod schemas with SQL injection prevention
- **Rate Limiting**: 100/min per user, 1000/min per org
- **OWASP Top 10 Coverage**: Complete mitigation for all 2021 categories
- **Security Testing**: Automated ZAP scanning, security checklists

📄 **Detailed Implementation**: [Security Architecture](2-tad-security-architecture.md)

---

## Integration Points

Third-party service integrations with proper error handling, retry logic, and monitoring.

**Primary Integrations**:

1. **Clerk (Authentication)**
   - User management, session handling
   - Webhook integration for user sync
   - Organization management

2. **Neon/Supabase (Database)**
   - PostgreSQL hosting
   - Connection pooling
   - Automated backups

3. **PostHog (Product Analytics)**
   - Event tracking
   - Feature flags
   - Session replay

4. **Sentry (Error Tracking)**
   - Error monitoring
   - Performance tracing
   - Release tracking

5. **Google Analytics 4 (Marketing)**
   - Traffic analysis
   - Attribution tracking
   - Conversion tracking

6. **Vercel (Hosting/CDN)**
   - Edge network
   - Serverless functions
   - Edge Config
   - KV storage (rate limiting)

**Integration Patterns**:

- Webhook validation with signature verification
- Retry logic with exponential backoff
- Circuit breakers for failing services
- Graceful degradation when services unavailable
- Health checks for critical dependencies

📄 **Detailed Implementation**: [Integration Points](2-tad-integration-points.md)

---

## Performance Targets

### Core Web Vitals

| Metric                             | Target (p75) | Good    | Needs Improvement | Poor    |
| ---------------------------------- | ------------ | ------- | ----------------- | ------- |
| **LCP** (Largest Contentful Paint) | < 2.5s       | < 2.5s  | 2.5s - 4s         | > 4s    |
| **FID** (First Input Delay)        | < 100ms      | < 100ms | 100ms - 300ms     | > 300ms |
| **CLS** (Cumulative Layout Shift)  | < 0.1        | < 0.1   | 0.1 - 0.25        | > 0.25  |

### API Response Time Targets

| Endpoint Type       | Target (p95) | Target (p99) |
| ------------------- | ------------ | ------------ |
| GET (simple query)  | < 100ms      | < 200ms      |
| GET (complex query) | < 300ms      | < 500ms      |
| POST/PATCH          | < 200ms      | < 400ms      |
| File upload         | < 2s         | < 5s         |

### Scalability Requirements

| Metric                  | Current | 6 Months | 12 Months |
| ----------------------- | ------- | -------- | --------- |
| **Concurrent Users**    | 100     | 1,000    | 10,000    |
| **Requests per Second** | 50      | 500      | 5,000     |
| **Database Size**       | 1 GB    | 10 GB    | 100 GB    |
| **Storage**             | 10 GB   | 100 GB   | 1 TB      |

### Performance Budget

| Resource              | Budget   | Current | Status |
| --------------------- | -------- | ------- | ------ |
| **JavaScript**        | < 200 KB | TBD     | ⏳     |
| **CSS**               | < 50 KB  | TBD     | ⏳     |
| **Images (per page)** | < 1 MB   | TBD     | ⏳     |
| **Fonts**             | < 100 KB | TBD     | ⏳     |

---

## Architecture Decision Records

### ADR Index

| ADR                                        | Title                      | Status      | Date       |
| ------------------------------------------ | -------------------------- | ----------- | ---------- |
| [ADR-001](adr/001-monorepo-turborepo.md)   | Monorepo with Turborepo    | ✅ Accepted | 2025-11-24 |
| [ADR-002](adr/002-pnpm-package-manager.md) | pnpm as Package Manager    | ✅ Accepted | 2025-11-24 |
| [ADR-003](adr/003-nextjs-framework.md)     | Next.js 16 as Framework    | ✅ Accepted | 2025-11-24 |
| [ADR-004](adr/004-vercel-hosting.md)       | Vercel as Hosting Platform | ✅ Accepted | 2025-11-24 |
| [ADR-005](adr/005-drizzle-orm.md)          | Drizzle as ORM             | ✅ Accepted | 2025-11-24 |
| [ADR-006](adr/006-clerk-authentication.md) | Clerk for Authentication   | ✅ Accepted | 2025-11-24 |
| [ADR-007](adr/007-multi-tenant-model.md)   | Multi-tenant Data Model    | ✅ Accepted | 2025-11-24 |

### Creating New ADRs

When making significant architectural decisions, create a new ADR using the [ADR Template](/docs/0-process/references/adr-template.md). See the [ADR Catalog](/docs/2-technical/adr/README.md) for detailed instructions.

---

## Appendices

### Glossary

| Term              | Definition                                                                            |
| ----------------- | ------------------------------------------------------------------------------------- |
| **ADR**           | Architecture Decision Record - Document capturing an important architectural decision |
| **Edge Function** | Serverless function running at edge locations close to users                          |
| **Monorepo**      | Single repository containing multiple apps and packages                               |
| **ORM**           | Object-Relational Mapping - Database abstraction layer                                |
| **RLS**           | Row-Level Security - Database-level access control                                    |
| **SSR**           | Server-Side Rendering - Rendering React on the server                                 |

### Related Documents

- [Product Requirements Document (PRD)](/docs/1-product/1-prd.md)
- [Epic Delivery Roadmap](/docs/1-product/3-roadmap.md)
- [Process Documentation](/docs/0-process/0-process.md)
- [File Structure Guide](docs/1-product/references/file-structure.md)

### Detailed Implementation Documents

- [Steel Thread & Deployment Pipeline](2-tad-steel-thread-deployment.md)
- [Observability Architecture](2-tad-observability.md)
- [Content Management Architecture](2-tad-content-management.md)
- [Testing Architecture](2-tad-testing.md)
- [Package Architecture](2-tad-package-architecture.md)
- [Developer Experience](2-tad-developer-experience.md)
- [Edge Middleware Architecture](2-tad-edge-middleware.md)
- [CDN Architecture](2-tad-cdn.md)
- [Documentation Architecture](2-tad-documentation.md)
- [Security Architecture](2-tad-security-architecture.md)
- [Integration Points](2-tad-integration-points.md)

### Document History

| Version  | Date       | Author      | Changes                                                                                     |
| -------- | ---------- | ----------- | ------------------------------------------------------------------------------------------- |
| 1.0      | 2025-11-24 | Claude Code | Initial TAD structure created                                                               |
| 1.1-1.11 | 2025-11-24 | Claude Code | Progressive additions of detailed implementations                                           |
| 2.0      | 2025-11-24 | Claude Code | Restructured as high-level architecture document with links to detailed implementation docs |
| 2.1      | 2025-11-25 | Claude Code | Added Documentation Architecture section with link to detailed implementation               |

---

## Approval

| Role                | Name | Signature | Date |
| ------------------- | ---- | --------- | ---- |
| **Technical Lead**  |      |           |      |
| **Product Manager** |      |           |      |
| **Security Lead**   |      |           |      |

---

**Note**: This is a living document that will evolve as the project progresses. Refer to the [Epic Delivery Roadmap](/docs/1-product/3-roadmap.md) for the implementation plan based on this architecture.
