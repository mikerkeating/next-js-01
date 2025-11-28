# Epic Delivery Roadmap v2.2

## Overview

This roadmap separates **Platform Foundation** (generic, reusable for any Next.js project) from **Product Implementation** (specific to this application). The Platform Foundation could be extracted as a starter kit or template repository.

---

## Roadmap Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                      PLANNING & DESIGN                              │
│                    (Pre-Development)                                │
├─────────────────────────────────────────────────────────────────────┤
│  Phase P: Planning & Architecture (Week 0)                          │
│    - P.1: PRD                                                       │
│    - P.2: TAD (Technical Architecture Document)                     │
│    - P.3: Epic Specifications (CLAUDE.md files)                     │
├─────────────────────────────────────────────────────────────────────┤
│                      PLATFORM FOUNDATION                            │
│                    (Generic / Reusable)                             │
├─────────────────────────────────────────────────────────────────────┤
│  Phase 0A: Steel Thread (Day 1-2)                                   │
│  Phase 1A: Foundation & Infrastructure (Days 3-7)                   │
│  Phase 2A: Core Platform Packages (Week 2)                          │
│  Phase 3A: Platform Applications (Week 4)                           │
├─────────────────────────────────────────────────────────────────────┤
│                     PRODUCT IMPLEMENTATION                          │
│                    (Project-Specific)                               │
├─────────────────────────────────────────────────────────────────────┤
│  Phase 2B: Product Domain Packages (Weeks 2-4)                      │
│  Phase 3B: Product Applications (Weeks 4-7)                         │
├─────────────────────────────────────────────────────────────────────┤
│                      PRODUCTION READINESS                           │
│                    (Generic + Product)                              │
├─────────────────────────────────────────────────────────────────────┤
│  Phase 4A: Quality Enhancement (Weeks 6-7)                          │
│  Phase 5A: DevOps Enhancement (Weeks 7-8)                           │
│  Phase 6A: Security & Performance (Weeks 8-9)                       │
│  Phase 7A: Documentation & Training (Weeks 9-10)                    │
│  Phase 8A: Launch Preparation (Week 10)                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Work Breakdown Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                    WORK BREAKDOWN HIERARCHY                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ROADMAP (this document)                                            │
│       │                                                             │
│       ▼                                                             │
│  ┌─────────┐                                                        │
│  │  EPIC   │  Large feature area (1-2 weeks)                        │
│  │  2A.2   │  e.g., "Database Infrastructure"                       │
│  └────┬────┘  Defined in: Roadmap + CLAUDE.md                       │
│       │                                                             │
│       ▼                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                              │
│  │ STORY 1 │  │ STORY 2 │  │ STORY 3 │  Implementable unit (2-8h)   │
│  │ 2A.2.S1 │  │ 2A.2.S2 │  │ 2A.2.S3 │  e.g., "Configure Drizzle"   │
│  └────┬────┘  └─────────┘  └─────────┘  Defined in: CLAUDE.md       │
│       │                                                             │
│       ▼                                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐                                         │
│  │ TASK │ │ TASK │ │ TASK │  Atomic action (15min-2h)               │
│  └──────┘ └──────┘ └──────┘  e.g., "Install drizzle-orm package"    │
│                              Defined in: Story or by Claude Code    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Definitions

| Level     | Scope                      | Duration  | Owner             | Definition Location                    |
| --------- | -------------------------- | --------- | ----------------- | -------------------------------------- |
| **Epic**  | Feature area or capability | 1-2 weeks | Tech Lead         | Roadmap + `/docs/3-epics/{id}/EPIC.md` |
| **Story** | Single implementable unit  | 2-8 hours | Claude Code Agent | `/docs/3-epics/{id}/S{N}-{slug}.md`    |
| **Task**  | Atomic action              | 15min-2h  | Claude Code Agent | Generated during implementation        |

### File Structure

Epic and Story files will be stored as per [file-structure.md](docs/1-product/references/file-structure.md)

### EPIC.md Template

Each epic has an `EPIC.md` file that provides overview and links to stories:

See [epic-details-template.md](/docs/0-process/references/epic-details-template.md)

### Story File Template (S{N}-{slug}.md)

Each story has its own file with everything Claude Code needs:

See [story-details-template.md](/docs/0-process/references/story-details-sizing.md)

### Story Sizing

See [story-details-sizing.md](/docs/0-process/references/story-details-sizing.md

### Claude Code Agent Workflow

See [0-process.md](/docs/0-process/0-process.md)

### Story Dependencies

Stories within an epic should be ordered by dependency:

```
Story Dependency Example (Epic 2A.2):

S1 (Drizzle setup)
 ↓
S2 (Connection utilities) ← depends on S1
 ↓
S3 (Migrations) ← depends on S2
S4 (Seed framework) ← depends on S2
S5 (Connection pooling) ← depends on S2
 ↓
S6 (Helper utilities) ← depends on S3
 ↓
S7 (Tests) ← depends on S1-S6
S8 (Documentation) ← depends on S1-S6
```

### PR Strategy

| Approach            | When to Use                              | Example             |
| ------------------- | ---------------------------------------- | ------------------- |
| **1 PR per Story**  | Complex stories, need review checkpoints | Auth implementation |
| **1 PR per Epic**   | Small epics, fast iteration              | Config package      |
| **Batched Stories** | Related stories, efficient review        | S1+S2+S3 together   |

Recommended default: **1 PR per Story** for traceability and easier rollback.

---

## Summary

### PLANNING & DESIGN (Pre-Development)

#### Phase P: Planning & Architecture (Week 0)

- P.1: Product Requirements Document (PRD)
- P.2: Technical Architecture Document (TAD)
- P.3: Epic & Story Specifications (EPIC.md + Story files)

---

### PLATFORM FOUNDATION (Generic)

#### Phase 0A: Steel Thread (Day 1-2)

- 0A.1: Steel Thread Deployment

#### Phase 1A: Foundation & Infrastructure (Days 3-7)

- 1A.1: Monorepo Foundation
- 1A.2: Package Management & Quality Gates
- 1A.3: Testing Foundation
- 1A.4: Documentation Foundation
- 1A.5: Basic CI/CD Pipeline

#### Phase 2A: Core Platform Packages (Week 2)

- 2A.1: Configuration Package
- 2A.2: Database Infrastructure (generic schema patterns)
- 2A.3: Observability Package
- 2A.4: Analytics Infrastructure (generic event system)
- 2A.5: UI Component Library (generic components only)
- 2A.6: Middleware Package (generic patterns)
- 2A.7: Auth Infrastructure (generic Clerk setup)
- 2A.8: API Client Package

#### Phase 3A: Platform Applications (Week 4)

- 3A.1: CDN & Asset Management Application
- 3A.2: Routing Application Shell

---

### PRODUCT IMPLEMENTATION (Project-Specific)

#### Phase 2B: Product Domain Packages (Weeks 2-4)

- 2B.1: Product Database Schema
- 2B.2: Multi-Tenant Organization Model
- 2B.3: Product Analytics Events & Taxonomy
- 2B.4: Product Content Schema & Reader
- 2B.5: Product UI Components (Org Switcher, etc.)
- 2B.6: Product Middleware (org/role checks)
- 2B.7: Product Auth Roles & Permissions

#### Phase 3B: Product Applications (Weeks 4-7)

- 3B.1: API Application (product endpoints)
- 3B.2: Content Migration (JSON → Database)
- 3B.3: Routing Configuration (product routes)
- 3B.4: Documentation Application
- 3B.5: Demo & Marketing Application
- 3B.6: Authenticated Tools Application
- 3B.7: Landing Page Builder Application

#### Phase 3B (Post-MVP Backlog)

- 3B.8: Reporting & Automation (deferred)
- 3B.9: Webhooks & Integrations (deferred)

---

### PRODUCTION READINESS (Generic + Product)

#### Phase 4A: Quality Enhancement (Weeks 6-7)

- 4A.1: Advanced Testing Infrastructure
- 4A.2: Storybook Enhancement
- 4A.3: Accessibility Audit & Remediation

#### Phase 5A: DevOps Enhancement (Weeks 7-8)

- 5A.1: Advanced CI/CD Pipeline
- 5A.2: Vercel Production Configuration

#### Phase 6A: Security & Performance (Weeks 8-9)

- 6A.1: Security Hardening
- 6A.2: Performance Optimisation
- 6A.3: Compliance Implementation

#### Phase 7A: Documentation & Training (Weeks 9-10)

- 7A.1: Developer Documentation Enhancement
- 7A.2: Operational Documentation

#### Phase 8A: Launch Preparation (Week 10)

- 8A.1: Pre-Launch Validation
- 8A.2: Launch Readiness

---

## Dependency Graph

```
                    PLATFORM FOUNDATION
                    ───────────────────
                         ┌──────┐
                         │ 0A.1 │ Steel Thread
                         └──┬───┘
                            │
                         ┌──▼───┐
                         │ 1A.1 │ Monorepo
                         └──┬───┘
                            │
                         ┌──▼───┐
                         │ 1A.2 │ Package Mgmt
                         └──┬───┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
           ┌──▼───┐      ┌──▼───┐      ┌──▼───┐
           │ 1A.3 │      │ 1A.4 │      │ 1A.5 │
           └──────┘      └──────┘      └──┬───┘
           Testing        Docs         CI/CD
                                          │
                         ┌────────────────┴────────────────┐
                         │                                 │
                      ┌──▼───┐                          ┌──▼───┐
                      │ 2A.1 │ Config                   │ 2A.2 │ DB Infra
                      └──┬───┘                          └──┬───┘
                         │                                 │
                         └────────────────┬────────────────┘
                                          │
              ┌───────────────────────────┼───────────────────────────┐
              │                           │                           │
           ┌──▼───┐                    ┌──▼───┐                    ┌──▼───┐
           │ 2A.3 │ Observability      │ 2A.4 │ Analytics Infra    │ 2A.5 │ UI (generic)
           └──┬───┘                    └──┬───┘                    └──┬───┘
              │                           │                           │
              └───────────────────────────┼───────────────────────────┘
                                          │
                                       ┌──▼───┐
                                       │ 2A.6 │ Middleware (generic)
                                       └──┬───┘
                                          │
                                       ┌──▼───┐
                                       │ 2A.7 │ Auth Infra
                                       └──┬───┘
                                          │
                                       ┌──▼───┐
                                       │ 2A.8 │ API Client
                                       └──┬───┘
                                          │
              ┌───────────────────────────┴───────────────────────────┐
              │                                                       │
           ┌──▼───┐                                                ┌──▼───┐
           │ 3A.1 │ CDN                                            │ 3A.2 │ Routing Shell
           └──────┘                                                └──────┘


                    PRODUCT IMPLEMENTATION
                    ──────────────────────
                    (Builds on Platform Foundation)

           ┌───────────────────────────┬───────────────────────────┐
           │                           │                           │
        ┌──▼───┐                    ┌──▼───┐                    ┌──▼───┐
        │ 2B.1 │ Product Schema     │ 2B.2 │ Org Model          │ 2B.3 │ Product Events
        └──┬───┘                    └──┬───┘                    └──┬───┘
           │                           │                           │
           │                           │                           │
        ┌──▼───┐                    ┌──▼───┐                    ┌──▼───┐
        │ 2B.4 │ Content Schema     │ 2B.5 │ Product UI         │ 2B.6 │ Product Middleware
        └──┬───┘                    └──┬───┘                    └──┬───┘
           │                           │                           │
           └───────────────────────────┼───────────────────────────┘
                                       │
                                    ┌──▼───┐
                                    │ 2B.7 │ Product Auth Roles
                                    └──┬───┘
                                       │
                                    ┌──▼───┐
                                    │ 3B.1 │ API (product endpoints)
                                    └──┬───┘
                                       │
           ┌───────────────────────────┼───────────────────────────┐
           │                           │                           │
        ┌──▼───┐                    ┌──▼───┐                    ┌──▼───┐
        │ 3B.2 │ Migration          │ 3B.3 │ Routes Config      │ 3B.4 │ Docs App
        └──────┘                    └──────┘                    └──┬───┘
                                                                   │
                                                                ┌──▼───┐
                                                                │ 3B.5 │ Demo/Marketing
                                                                └──┬───┘
                                                                   │
                                                                ┌──▼───┐
                                                                │ 3B.6 │ Tools App
                                                                └──┬───┘
                                                                   │
                                                                ┌──▼───┐
                                                                │ 3B.7 │ Landing Builder
                                                                └──────┘
```

---

# PLANNING & DESIGN (Pre-Development)

These artefacts must exist before any code is written. They inform all subsequent development.

---

## Phase P: Planning & Architecture (Week 0)

### Epic P.1: Product Requirements Document (PRD)

**Type**: Product-Specific

**Goal**: Define what we're building and why

**Owner**: Product Manager / Stakeholders

**Acceptance Criteria**:

- [ ] Problem statement defined
- [ ] Target users identified
- [ ] User personas documented
- [ ] Core features listed with priorities (MoSCoW)
- [ ] Success metrics defined (KPIs)
- [ ] Non-functional requirements captured (performance, security, compliance)
- [ ] Constraints and assumptions documented
- [ ] Out of scope items explicitly listed
- [ ] Stakeholder sign-off obtained

**Output**: `/docs/1-product/1-prd.md`

---

### Epic P.2: Technical Architecture Document (TAD)

**Type**: Mixed (generic patterns + product decisions)

**Goal**: Define how we're building it — technology choices, system design, and architectural decisions

**Owner**: Technical Lead / Architect

**Dependencies**: Epic P.1 (PRD)

**Acceptance Criteria**:

**Technology Stack**:

- [ ] Framework selection documented (Next.js 16, React 19)
- [ ] Language and runtime (TypeScript, Node.js version)
- [ ] Database selection (PostgreSQL via Neon/Supabase)
- [ ] ORM selection (Drizzle)
- [ ] Authentication provider (Clerk)
- [ ] Hosting platform (Vercel)
- [ ] CDN strategy
- [ ] Analytics providers (PostHog, GA4, Vercel Analytics)

**System Architecture**:

- [ ] High-level system diagram
- [ ] Application architecture (monorepo structure)
- [ ] Data flow diagrams
- [ ] API design principles (REST, versioning strategy)
- [ ] Database schema overview (ER diagram)
- [ ] Multi-tenancy approach documented

**Infrastructure**:

- [ ] Deployment architecture
- [ ] Environment strategy (dev, staging, production)
- [ ] CI/CD approach
- [ ] Monitoring and observability strategy
- [ ] Backup and disaster recovery approach

**Security Architecture**:

- [ ] Authentication flow
- [ ] Authorisation model (roles, permissions)
- [ ] Data protection approach
- [ ] Compliance requirements (GDPR, CCPA)

**Integration Points**:

- [ ] Third-party services listed
- [ ] API contracts defined (or approach documented)
- [ ] Webhook strategies

**Performance Targets**:

- [ ] Core Web Vitals targets
- [ ] API response time targets
- [ ] Scalability requirements

**Architecture Decision Record - ADRs Created**:

- [ ] ADR-001: Monorepo with Turborepo
- [ ] ADR-002: pnpm as package manager
- [ ] ADR-003: Next.js 16 as framework
- [ ] ADR-004: Vercel as hosting platform
- [ ] ADR-005: Drizzle as ORM
- [ ] ADR-006: Clerk for authentication
- [ ] ADR-007: Multi-tenant data model

**Output**: `/docs/2-technical/2-tad.md`, `/docs/2-technical/adr/`

---

### Epic P.3: Epic & Story Specifications

**Type**: Mixed

**Goal**: Create detailed specifications for each epic and story that Claude Code agents can execute against

**Owner**: Technical Lead

**Dependencies**: Epic P.1 (PRD), Epic P.2 (TAD)

**Acceptance Criteria**:

- [x] EPIC.md template finalised - [epic-details-template.md](/docs/0-process/references/epic-details-template.md)
- [x] Story file template (S{N}-{slug}.md) finalised - [story-details-template.md](/docs/0-process/references/story-details-sizing.md)
- [x] All Phase 0A-1A epics have EPIC.md files - see files in docs/3-epics subfolders
- [x] All Phase 0A stories have individual story files - see files within epic folders
- [x] Phase 1A epics have EPIC.md files (stories can be stubs) - see files in docs/3-epics subfolders
- [x] Phase 2A epics have EPIC.md files (stories can be stubs) - see files in docs/3-epics subfolders
- [ ] Each EPIC.md includes:
  - [ ] Context and references to PRD/TAD
  - [ ] Acceptance criteria (from roadmap)
  - [ ] Story index table with status tracking
  - [ ] Story dependency graph
  - [ ] Technical decisions
  - [ ] Technical constraints
- [ ] Each Story file includes:
  - [ ] User story format
  - [ ] Acceptance criteria
  - [ ] Files to create/modify
  - [ ] Test requirements
  - [ ] Verification checklist

**Output**: `/docs/3-epics/{epic-id}/EPIC.md` + `/docs/3-epics/{epic-id}/S{N}-{slug}.md`

---

# PLATFORM FOUNDATION (Generic)

These epics can be extracted as a reusable Next.js monorepo starter kit.

---

## Phase 0A: Steel Thread (Day 1-2)

### Epic 0A.1: Steel Thread Deployment

**Type**: Generic / Reusable

**Goal**: Establish working end-to-end deployment pipeline before any feature development

**Claude Code Agent Instructions**:

```
Read: CLAUDE.md for Epic 0A.1
Execute: Create minimal Next.js app, configure Vercel, establish GitHub integration
Verify: Preview URL returns 200 OK, auto-deploy on push works
```

**Delivers**: Production-ready deployment infrastructure from Day 1

**Acceptance Criteria**:

- [ ] GitHub repository created with main branch protection
- [ ] Minimal Next.js 16 app with "Hello World" page
- [ ] Vercel project linked to GitHub
- [ ] Auto-deploy on push to `development` branch
- [ ] Preview deployments on PR creation
- [ ] SSL certificate provisioned
- [ ] Environment variables configured
- [ ] Health check endpoint (`/api/health`)
- [ ] Playwright smoke test validates deployment
- [ ] README documents deployment process

**Reusability**: 100% — No changes needed for any project

**EPIC.md Location**: `/docs/3-epics/0A.1-steel-thread/EPIC.md`

---

## Phase 1A: Foundation & Infrastructure (Days 3-7)

### Epic 1A.1: Monorepo Foundation

**Type**: Generic / Reusable

**Goal**: Establish monorepo structure with Turborepo and workspace configuration

**Dependencies**: Epic 0A.1

**Acceptance Criteria**:

- [ ] Turborepo installed with `turbo.json`
- [ ] Root `package.json` defines workspaces
- [ ] Directory structure: `/apps`, `/packages`, `/docs`, `/scripts`
- [ ] Turborepo pipeline: `build`, `dev`, `lint`, `test`, `type-check`, `clean`
- [ ] Remote caching configured for Vercel
- [ ] Task dependencies defined
- [ ] `.gitignore` configured
- [ ] Root README with architecture overview
- [ ] Vercel deployment succeeds

**Reusability**: 100% — Standard monorepo pattern

**EPIC.md Location**: `/docs/3-epics/1A.1-monorepo/EPIC.md`

---

### Epic 1A.2: Package Management & Quality Gates

**Type**: Generic / Reusable

**Goal**: Configure pnpm, environment management, quality gates, markdown linting, dependency automation, and AI code review

**Dependencies**: Epic 1A.1

**Acceptance Criteria**:

**Package Management**:

- [ ] pnpm configured with `.npmrc`
- [ ] `pnpm-workspace.yaml` defines workspaces
- [ ] Lock file committed
- [ ] Node.js version in `.nvmrc`

**Environment Configuration**:

- [ ] `.env.example` template
- [ ] Environment validation with `@t3-oss/env-nextjs`
- [ ] Validation fails build on missing vars

**Quality Gates**:

- [ ] Husky pre-commit hooks
- [ ] lint-staged for ESLint + Prettier
- [ ] Commitlint with conventional commits
- [ ] Failed checks prevent commits

**Markdown & Documentation Linting**:

- [ ] markdownlint installed and configured
- [ ] `.markdownlint.json` with project rules
- [ ] Markdown files included in lint-staged
- [ ] Documentation style consistency enforced

**Automated Dependency Management**:

- [ ] `.github/dependabot.yml` configured
- [ ] Weekly update schedule for npm dependencies
- [ ] Weekly update schedule for GitHub Actions
- [ ] Auto-merge enabled for patch updates
- [ ] Security updates prioritised (daily check)
- [ ] Grouped updates for related packages (e.g., all ESLint plugins)

**AI Code Review**:

- [ ] `.coderabbit.yaml` configured at repository root
- [ ] Review profile set (e.g., assertive, balanced)
- [ ] Path-based review rules defined
- [ ] Auto-review enabled for PRs
- [ ] Language set to English
- [ ] Summary generation enabled
- [ ] Knowledge base integration configured (if available)

**Reusability**: 100% — Universal quality patterns

**EPIC.md Location**: `/docs/3-epics/1A.2-package-management/EPIC.md`

---

### Epic 1A.3: Testing Foundation

**Type**: Generic / Reusable

**Goal**: Establish test infrastructure for TDD

**Dependencies**: Epic 1A.2

**Acceptance Criteria**:

**Unit Testing**:

- [ ] Vitest installed and configured
- [ ] Shared config in `@repo/config`
- [ ] Coverage thresholds: 80%
- [ ] React Testing Library support
- [ ] Mock utilities (fetch, timers)

**E2E Testing**:

- [ ] Playwright with Chrome, Firefox, Safari
- [ ] Base URL configurable for previews
- [ ] Screenshot/video on failure
- [ ] Smoke test validates health endpoint

**Testing Utilities**:

- [ ] `@repo/testing` package
- [ ] `renderWithProviders`, mock factories
- [ ] MSW for API mocking

**CI Integration**:

- [ ] `turbo run test` and `turbo run test:e2e`
- [ ] Coverage reports in PR comments

**Reusability**: 100% — Standard testing setup

**EPIC.md Location**: `/docs/3-epics/1A.3-testing-foundation/EPIC.md`

---

### Epic 1A.4: Documentation Foundation

**Type**: Generic / Reusable

**Goal**: Establish documentation-as-code practices

**Dependencies**: Epic 1A.2

**Acceptance Criteria**:

- [ ] `/docs` directory: `/adr`, `/architecture`, `/api`, `/guides`, `/epics`
- [ ] Documentation site framework (Nextra/Docusaurus)
- [ ] ADR template and first decisions
- [ ] Root README, CONTRIBUTING.md, SECURITY.md
- [ ] CLAUDE.md template for epics

**Reusability**: 100% — Universal documentation patterns

**EPIC.md Location**: `/docs/3-epics/1A.4-documentation-foundation/EPIC.md`

---

### Epic 1A.5: Basic CI/CD Pipeline

**Type**: Generic / Reusable

**Goal**: Automated pipeline for every PR

**Dependencies**: Epic 1A.3, Epic 1A.4

**Acceptance Criteria**:

**PR Workflow**:

- [ ] Triggers on pull_request
- [ ] Jobs: lint, type-check, test, build
- [ ] Turborepo filtering (affected only)
- [ ] Coverage report in PR
- [ ] Preview deployment + URL in PR
- [ ] E2E smoke test on preview
- [ ] All checks required for merge

**Main Workflow**:

- [ ] Triggers on push to development
- [ ] Full test suite
- [ ] Deploy to staging
- [ ] Failure notifications

**Security**:

- [ ] Dependabot configured
- [ ] `pnpm audit` in CI

**Reusability**: 100% — Standard CI/CD pattern

**EPIC.md Location**: `/docs/3-epics/1A.5-basic-cicd/EPIC.md`

---

## Phase 2A: Core Platform Packages (Week 2)

### Epic 2A.1: Configuration Package

**Type**: Generic / Reusable

**Goal**: Centralised TypeScript, ESLint, Prettier, Tailwind configs

**Dependencies**: Epic 1A.5

**Acceptance Criteria**:

- [ ] `@repo/config` package
- [ ] TypeScript base config exportable
- [ ] ESLint for Next.js, React, TypeScript
- [ ] Prettier formatting standards
- [ ] Tailwind CSS v4 base with theme tokens
- [ ] All packages extend configs
- [ ] 80% test coverage

**Reusability**: 100% — Configs are project-agnostic

**EPIC.md Location**: `/docs/3-epics/2A.1-config-package/EPIC.md`

---

### Epic 2A.2: Database Infrastructure

**Type**: Generic / Reusable (schema is product-specific)

**Goal**: Database setup with Drizzle ORM — generic patterns only

**Dependencies**: Epic 2A.1

**Acceptance Criteria**:

- [ ] `@repo/database` package
- [ ] Drizzle ORM configured
- [ ] Neon (or Supabase) connection
- [ ] Connection pooling
- [ ] Migration infrastructure (up/down)
- [ ] Seed script framework
- [ ] Environment-based connection strings
- [ ] Generic utilities: `createId()`, `timestamps()`, `softDelete()`
- [ ] RLS helper patterns (not product-specific policies)
- [ ] 80% test coverage

**What's NOT included** (see 2B.1):

- Product-specific tables
- Product-specific RLS policies
- Product-specific seed data

**Reusability**: 90% — Infrastructure generic, schema separate

**EPIC.md Location**: `/docs/3-epics/2A.2-database-infra/EPIC.md`

---

### Epic 2A.3: Observability Package

**Type**: Generic / Reusable

**Goal**: Logging, error tracking, health checks

**Dependencies**: Epic 2A.1

**Acceptance Criteria**:

- [ ] `@repo/observability` package
- [ ] Structured JSON logging
- [ ] Log levels: debug, info, warn, error, fatal
- [ ] React Error Boundary component
- [ ] User-friendly fallback UI
- [ ] Sentry SDK integration (configurable)
- [ ] Web Vitals tracking utilities
- [ ] Health check utilities
- [ ] 80% test coverage

**Reusability**: 100% — Universal observability patterns

**EPIC.md Location**: `/docs/3-epics/2A.3-observability/EPIC.md`

---

### Epic 2A.4: Analytics Infrastructure

**Type**: Generic / Reusable (events are product-specific)

**Goal**: Event tracking system — generic infrastructure only

**Dependencies**: Epic 2A.3

**Acceptance Criteria**:

- [ ] `@repo/analytics` package
- [ ] `trackEvent(name, properties)` function
- [ ] Event validation with Zod (generic schema)
- [ ] `data-component-id` tracking utilities
- [ ] `useComponentTracking()` hook
- [ ] Provider integrations: PostHog, GA4, Vercel Analytics
- [ ] Consent management system
- [ ] Events blocked until consent
- [ ] Feature flag utilities (Edge Config/LaunchDarkly ready)
- [ ] Multi-destination routing
- [ ] 80% test coverage

**What's NOT included** (see 2B.3):

- Product-specific event taxonomy
- Product-specific event schemas
- Product-specific A/B tests

**Reusability**: 90% — Infrastructure generic, events separate

**EPIC.md Location**: `/docs/3-epics/2A.4-analytics-infra/EPIC.md`

---

### Epic 2A.5: UI Component Library (Generic)

**Type**: Generic / Reusable

**Goal**: Base UI components with shadcn/ui — generic only

**Dependencies**: Epic 2A.3, Epic 2A.4

**Acceptance Criteria**:

- [ ] `@repo/ui` package
- [ ] shadcn/ui CLI configured
- [ ] Tailwind theme tokens
- [ ] Error boundary integration
- [ ] Component tracking integration

**Generic Components**:

- [ ] Button (all variants)
- [ ] Input (with validation states)
- [ ] Select (single/multi)
- [ ] Card (header/content/footer)
- [ ] Dialog (with focus trap)
- [ ] Dropdown Menu
- [ ] Tabs
- [ ] Toast (with provider)
- [ ] Avatar
- [ ] Badge
- [ ] Skeleton
- [ ] Spinner/Loading

**Standards**:

- [ ] `data-component-id` props on all
- [ ] Accessible (ARIA, keyboard, focus)
- [ ] axe-core tests pass
- [ ] Storybook story for each
- [ ] 80% test coverage

**What's NOT included** (see 2B.5):

- Organization Switcher
- Role-based components
- Product-specific composite components

**Reusability**: 100% — Standard component library

**EPIC.md Location**: `/docs/3-epics/2A.5-ui-components/EPIC.md`

---

### Epic 2A.6: Middleware Package (Generic)

**Type**: Generic / Reusable

**Goal**: Reusable Next.js middleware — generic patterns only

**Dependencies**: Epic 2A.3

**Acceptance Criteria**:

- [ ] `@repo/middleware` package
- [ ] Request logging middleware
- [ ] Rate limiting utilities
- [ ] Security headers (CSP, HSTS, X-Frame-Options)
- [ ] CORS configuration
- [ ] Middleware chain composition
- [ ] Route matcher utilities
- [ ] Edge runtime compatible
- [ ] 80% test coverage

**What's NOT included** (see 2B.6):

- Organization context middleware
- Role-based access middleware
- Product-specific route protection

**Reusability**: 100% — Standard middleware patterns

**EPIC.md Location**: `/docs/3-epics/2A.6-middleware/EPIC.md`

---

### Epic 2A.7: Auth Infrastructure

**Type**: Generic / Reusable (roles are product-specific)

**Goal**: Clerk integration — generic setup only

**Dependencies**: Epic 2A.2, Epic 2A.6

**Acceptance Criteria**:

- [ ] `@repo/auth` package
- [ ] Clerk SDK installed
- [ ] `ClerkProvider` wrapper
- [ ] Generic auth context: `user`, `isLoaded`, `isSignedIn`
- [ ] Generic hooks: `useAuth()`, `useUser()`
- [ ] Protected route HOC (generic)
- [ ] Clerk webhook handler framework
- [ ] User sync to database (generic user table)
- [ ] Token refresh handling
- [ ] Auth error boundaries
- [ ] 80% test coverage

**What's NOT included** (see 2B.7):

- Product-specific roles (Internal, Product-Seller, etc.)
- Organization context in auth
- Role-based permission utilities
- Product-specific webhook handlers

**Reusability**: 90% — Auth infra generic, roles separate

**EPIC.md Location**: `/docs/3-epics/2A.7-auth-infra/EPIC.md`

---

### Epic 2A.8: API Client Package

**Type**: Generic / Reusable

**Goal**: Type-safe API communication layer

**Dependencies**: Epic 2A.6, Epic 2A.7

**Acceptance Criteria**:

- [ ] `@repo/api-client` package
- [ ] Base client wraps fetch
- [ ] Request interceptor for auth token
- [ ] Response interceptor for errors (401, 403, 404, 500)
- [ ] Retry with exponential backoff
- [ ] Request caching utilities
- [ ] TypeScript generic types
- [ ] File upload support
- [ ] Server and client component support
- [ ] 80% test coverage

**Reusability**: 100% — Standard API client pattern

**EPIC.md Location**: `/docs/3-epics/2A.8-api-client/EPIC.md`

---

## Phase 3A: Platform Applications (Week 4)

### Epic 3A.1: CDN & Asset Management Application

**Type**: Generic / Reusable

**Goal**: Static asset delivery with optimisation

**Dependencies**: Epic 2A.8

**Acceptance Criteria**:

- [ ] CDN app at `/apps/cdn`
- [ ] Image optimisation (WebP/AVIF)
- [ ] Image transformation query params
- [ ] Long-term caching headers
- [ ] Content-hash URLs
- [ ] Vercel Edge distribution
- [ ] DDoS protection
- [ ] File upload utilities
- [ ] Latency < 100ms (p95)

**Reusability**: 100% — Standard CDN pattern

**EPIC.md Location**: `/docs/3-epics/3A.1-cdn/EPIC.md`

---

### Epic 3A.2: Routing Application Shell

**Type**: Generic / Reusable (routes are product-specific)

**Goal**: Main routing layer shell — generic patterns only

**Dependencies**: Epic 3A.1

**Acceptance Criteria**:

- [ ] Routing app at `/apps/routing`
- [ ] Next.js 16 app router
- [ ] Rewrite configuration framework
- [ ] SEO utilities (meta tags, sitemap, robots)
- [ ] Analytics integration
- [ ] CDN asset references
- [ ] Lighthouse SEO > 90
- [ ] Mobile responsive shell

**What's NOT included** (see 3B.3):

- Product-specific routes
- Product-specific rewrites
- Product-specific pages

**Reusability**: 90% — Shell generic, routes separate

**EPIC.md Location**: `/docs/3-epics/3A.2-routing-shell/EPIC.md`

---

# PRODUCT IMPLEMENTATION (Project-Specific)

These epics contain business logic specific to this product.

---

## Phase 2B: Product Domain Packages (Weeks 2-4)

> **Note**: These epics build on Platform Foundation packages

### Epic 2B.1: Product Database Schema

**Type**: Product-Specific

**Goal**: Product-specific database tables and relationships

**Dependencies**: Epic 2A.2 (Database Infrastructure)

**Acceptance Criteria**:

**Core Tables**:

- [ ] `users` table (extends generic with product fields)
- [ ] `Organizations` table with settings JSONB
- [ ] `user_Organizations` join table
- [ ] `user_Organizations.role` enum: internal, product-seller, agency-seller, client
- [ ] `content` table with Organization scoping
- [ ] `analytics_events` table
- [ ] All foreign key indexes
- [ ] `created_at`, `updated_at` timestamps

**Multi-Tenancy**:

- [ ] RLS policies for Organization isolation
- [ ] RLS tests validate cross-org blocked

**Seed Data**:

- [ ] Test Organizations
- [ ] Test users with various roles
- [ ] Sample content per org

**Documentation**:

- [ ] ER diagram
- [ ] Schema reference

**EPIC.md Location**: `/docs/3-epics/2B.1-product-schema/EPIC.md`

---

### Epic 2B.2: Multi-Tenant Organization Model

**Type**: Product-Specific

**Goal**: Organization context, switching, and data isolation

**Dependencies**: Epic 2B.1

**Acceptance Criteria**:

- [ ] `@repo/org` package
- [ ] Organization context provider
- [ ] `useOrganization()` hook: currentOrg, switchOrganization(), userOrganizations[]
- [ ] Organization data fetching
- [ ] Org-scoped query utilities
- [ ] Default org selection logic
- [ ] Org slug validation
- [ ] 80% test coverage

**EPIC.md Location**: `/docs/3-epics/2B.2-org-model/EPIC.md`

---

### Epic 2B.3: Product Analytics Events & Taxonomy

**Type**: Product-Specific

**Goal**: Product-specific event definitions and schemas

**Dependencies**: Epic 2A.4 (Analytics Infrastructure)

**Acceptance Criteria**:

- [ ] Event taxonomy document
- [ ] Zod schemas for each event type:
  - [ ] `page_view` with product-specific properties
  - [ ] `content_created`, `content_updated`, `content_deleted`
  - [ ] `demo_started`, `demo_completed`
  - [ ] `landing_page_published`
  - [ ] `form_submitted`
  - [ ] `resource_downloaded`
- [ ] A/B test definitions
- [ ] Conversion event definitions
- [ ] Event validation tests

**EPIC.md Location**: `/docs/3-epics/2B.3-product-events/EPIC.md`

---

### Epic 2B.4: Product Content Schema & Reader

**Type**: Product-Specific

**Goal**: Product-specific content types and JSON structure

**Dependencies**: Epic 2B.2

**Acceptance Criteria**:

**Content Structure**:

- [ ] `/content` directory
- [ ] Content index at `/content/content-index.json`
- [ ] Org directories under `/content/{org-id}/`

**Content Types**:

- [ ] Marketing pages (hero, features, testimonials)
- [ ] Documentation references
- [ ] Demo configurations
- [ ] Landing page templates

**Content Loader**:

- [ ] `loadContentIndex()`
- [ ] `getOrgContent(orgId, contentType)`
- [ ] `queryContent(orgId, filters)`
- [ ] Memory caching
- [ ] Org-scoped access control
- [ ] Role-based visibility

**EPIC.md Location**: `/docs/3-epics/2B.4-product-content/EPIC.md`

---

### Epic 2B.5: Product UI Components

**Type**: Product-Specific

**Goal**: Product-specific composite components

**Dependencies**: Epic 2A.5 (Generic UI), Epic 2B.2 (Org Model)

**Acceptance Criteria**:

**Components**:

- [ ] Organization Switcher
- [ ] Role Badge
- [ ] Content Card (with org context)
- [ ] Permission Gate component
- [ ] Org-scoped Search
- [ ] User Role Selector
- [ ] Radar chart component for maturity models
- [ ] Timeline/progress visualization
- [ ] Advanced search with faceted filtering
- [ ] Saved searches

**Standards**:

- [ ] Storybook stories
- [ ] Accessibility tests
- [ ] 80% coverage

**EPIC.md Location**: `/docs/3-epics/2B.5-product-ui/EPIC.md`

---

### Epic 2B.6: Product Middleware

**Type**: Product-Specific

**Goal**: Organization and role-based middleware

**Dependencies**: Epic 2A.6 (Generic Middleware), Epic 2B.2 (Org Model)

**Acceptance Criteria**:

- [ ] Organization context middleware
- [ ] Org validation middleware (user belongs to org)
- [ ] Role-based access middleware
- [ ] Minimum role requirement checks
- [ ] Route protection by role
- [ ] Org ID injection into requests
- [ ] 80% test coverage

**EPIC.md Location**: `/docs/3-epics/2B.6-product-middleware/EPIC.md`

---

### Epic 2B.7: Product Auth Roles & Permissions

**Type**: Product-Specific

**Goal**: Product-specific role definitions and permissions

**Dependencies**: Epic 2A.7 (Auth Infrastructure), Epic 2B.2 (Org Model), Epic 2B.6 (Product Middleware)

**Acceptance Criteria**:

**Roles**:

- [ ] Internal (full access)
- [ ] Product-Seller (org admin)
- [ ] Agency-Seller (limited admin)
- [ ] Client (read + limited write)

**Permissions**:

- [ ] Permission matrix defined
- [ ] `canAccess(resource, action)` utility
- [ ] `usePermissions()` hook with role context
- [ ] Role hierarchy utilities

**Webhook Handlers**:

- [ ] User created → sync to DB with org
- [ ] User updated → sync changes
- [ ] User deleted → cascade handling
- [ ] Org membership changes

**EPIC.md Location**: `/docs/3-epics/2B.7-product-auth/EPIC.md`

---

## Phase 3B: Product Applications (Weeks 4-7)

### Epic 3B.1: API Application (Product Endpoints)

**Type**: Product-Specific

**Goal**: Product-specific REST API endpoints

**Dependencies**: Epic 2B.1, Epic 2B.2, Epic 2B.7

**Acceptance Criteria**:

**Infrastructure**:

- [ ] API app at `/apps/api`
- [ ] OpenAPI 3.1 spec (design-first)
- [ ] Deployed to `api.example.com`
- [ ] Versioned under `/v1`

**Endpoints**:

- [ ] Users: CRUD `/v1/users`
- [ ] Organizations: CRUD `/v1/Organizations`
- [ ] Organization Members: `/v1/Organizations/:id/members`
- [ ] Content: CRUD `/v1/content`
- [ ] Analytics: POST `/v1/events`
- [ ] Metadata: GET `/v1/metadata/config`, `/v1/metadata/features`
- [ ] File upload: multipart/form-data

**Security**:

- [ ] Clerk JWT validation
- [ ] Org context extraction
- [ ] Role-based authorization
- [ ] Rate limiting

**Documentation**:

- [ ] Swagger UI at `/v1/docs`

**EPIC.md Location**: `/docs/3-epics/3B.1-api/EPIC.md`

---

### Epic 3B.2: Content Migration (JSON → Database)

**Type**: Product-Specific

**Goal**: Migrate JSON content to database

**Dependencies**: Epic 2B.4, Epic 3B.1

**Acceptance Criteria**:

- [ ] Migration script via API
- [ ] Validation before migration
- [ ] Validation after migration
- [ ] Preserves all metadata
- [ ] Handles duplicates/conflicts
- [ ] Rollback to JSON export
- [ ] Round-trip test passes
- [ ] Dry-run mode
- [ ] Progress reporting

**EPIC.md Location**: `/docs/3-epics/3B.2-content-migration/EPIC.md`

---

### Epic 3B.3: Routing Configuration (Product Routes)

**Type**: Product-Specific

**Goal**: Product-specific routes and rewrites

**Dependencies**: Epic 3A.2 (Routing Shell), Epic 3B.1 (API)

**Acceptance Criteria**:

**Routes**:

- [ ] `/` → Homepage
- [ ] `/docs/*` → Documentation app
- [ ] `/demo/*` → Demo app
- [ ] `/tools/*` → Tools app (authenticated)
- [ ] `/content/*` → Content app (authenticated)
- [ ] `/landing/*` → Landing pages

**Rewrites**:

- [ ] API proxy rules
- [ ] CDN asset rules
- [ ] App delegation rules

**Pages**:

- [ ] Homepage with product content
- [ ] Marketing pages
- [ ] SEO configuration per route

**EPIC.md Location**: `/docs/3-epics/3B.3-routing-config/EPIC.md`

---

### Epic 3B.4: Documentation Application

**Type**: Product-Specific

**Goal**: Product documentation site

**Dependencies**: Epic 3B.1, Epic 3B.3

**Acceptance Criteria**:

- [ ] Docs app at `/apps/docs`
- [ ] MDX rendering with syntax highlighting
- [ ] Product documentation structure
- [ ] Search functionality
- [ ] API reference from OpenAPI
- [ ] Auth-gated enterprise docs
- [ ] Version selector
- [ ] Dark mode

**EPIC.md Location**: `/docs/3-epics/3B.4-docs-app/EPIC.md`

---

### Epic 3B.5: Demo & Marketing Application

**Type**: Product-Specific

**Goal**: Product demos and marketing content

**Dependencies**: Epic 3B.1, Epic 2B.3

**Acceptance Criteria**:

- [ ] Demo app at `/apps/demo`
- [ ] Marketing app at `/apps/marketing`
- [ ] Public demo pages
- [ ] Authenticated demo features
- [ ] Demo sandbox
- [ ] Guided tours
- [ ] Resource library
- [ ] Lead capture forms
- [ ] Analytics tracking

**EPIC.md Location**: `/docs/3-epics/3B.5-demo-marketing/EPIC.md`

---

### Epic 3B.6: Authenticated Tools Application

**Type**: Product-Specific

**Goal**: Core business tools and content management

**Dependencies**: Epic 3B.1, Epic 3B.5

**Acceptance Criteria**:

- [ ] Tools app at `/apps/tools`
- [ ] Content app at `/apps/content`
- [ ] All routes authenticated
- [ ] Org context throughout
- [ ] Content CRUD
- [ ] File uploads
- [ ] Role-based features
- [ ] Real-time updates
- [ ] Content versioning
- [ ] Comments and annotations system
- [ ] Approval workflows (draft → review → published)
- [ ] Activity feed per Organization
- [ ] Third-party API integration framework

**EPIC.md Location**: `/docs/3-epics/3B.6-tools/EPIC.md`

---

### Epic 3B.7: Landing Page Builder Application

**Type**: Product-Specific

**Goal**: Landing page creation with A/B testing

**Dependencies**: Epic 3B.1, Epic 3B.6, Epic 2B.3

**Acceptance Criteria**:

- [ ] Landing app at `/apps/landing`
- [ ] Drag-and-drop builder
- [ ] 5+ templates
- [ ] Form builder
- [ ] A/B test configuration
- [ ] Traffic splitting
- [ ] Conversion tracking
- [ ] Lead capture workflows
- [ ] SEO per page

**EPIC.md Location**: `/docs/3-epics/3B.7-landing-builder/EPIC.md`

---

### Epic 3B.8: Reporting & Automation (Post-MVP)

**Type**: Product-Specific

**Goal**: Scheduled reports and automated exports of transformation data

**Dependencies**: Epic 3B.4, Epic 3B.6

**Acceptance Criteria**:

**Report Generation**:

- [ ] Configurable report templates
- [ ] Scheduled delivery (daily, weekly, monthly)
- [ ] Multiple export formats (PDF, Excel, PowerPoint)
- [ ] Custom branding per Organization
- [ ] Distribution lists and notifications

**Automation**:

- [ ] Report scheduling infrastructure
- [ ] Email delivery system
- [ ] Report history and versioning
- [ ] Template library management
- [ ] Export queue processing

**Standards**:

- [ ] 80% test coverage
- [ ] Performance: < 30s for complex reports
- [ ] Email delivery < 5 minutes after generation

**EPIC.md Location**: `/docs/3-epics/3B.8-reporting-automation/EPIC.md`

**Status**: DEFERRED to post-MVP (Could Have feature C.3 from PRD)

---

### Epic 3B.9: Webhooks & Integrations (Post-MVP)

**Type**: Product-Specific

**Goal**: Webhook system for real-time event notifications to external systems

**Dependencies**: Epic 3B.1

**Acceptance Criteria**:

**Webhook Infrastructure**:

- [ ] Configurable webhook endpoints per Organization
- [ ] Event filtering and routing
- [ ] Retry logic with exponential backoff
- [ ] Webhook signature verification (HMAC)
- [ ] Activity log for webhook deliveries

**Event System**:

- [ ] Webhook event catalog
- [ ] Payload versioning
- [ ] Event replay capability
- [ ] Dead letter queue for failed deliveries

**Management UI**:

- [ ] Webhook configuration interface
- [ ] Delivery status monitoring
- [ ] Test webhook functionality
- [ ] Event payload inspector

**Standards**:

- [ ] 80% test coverage
- [ ] Delivery SLA: 99.9% within 30 seconds
- [ ] Rate limiting per Organization

**EPIC.md Location**: `/docs/3-epics/3B.9-webhooks-integrations/EPIC.md`

**Status**: DEFERRED to post-MVP (Could Have feature C.5 from PRD)

---

# PRODUCTION READINESS (Generic + Product)

These phases apply to both platform and product.

---

## Phase 4A: Quality Enhancement (Weeks 6-7)

### Epic 4A.1: Advanced Testing Infrastructure

**Type**: Generic (with product test cases)

**Acceptance Criteria**:

- [ ] k6/Artillery load testing
- [ ] 1000+ concurrent users
- [ ] API < 200ms (p95) under load
- [ ] Chromatic visual regression
- [ ] API contract tests
- [ ] Performance budgets in CI
- [ ] Lighthouse tracking

**EPIC.md Location**: `/docs/3-epics/4A.1-advanced-testing/EPIC.md`

---

### Epic 4A.2: Storybook Enhancement

**Type**: Generic

**Acceptance Criteria**:

- [ ] Interaction testing
- [ ] Docs addon
- [ ] Design tokens display
- [ ] Component composition examples

**EPIC.md Location**: `/docs/3-epics/4A.2-storybook/EPIC.md`

---

### Epic 4A.3: Accessibility Audit & Remediation

**Type**: Generic (audits product)

**Acceptance Criteria**:

- [ ] axe-core + Pa11y on all pages
- [ ] Zero critical violations
- [ ] Manual audit (NVDA, JAWS, VoiceOver)
- [ ] WCAG 2.1 AA compliance

**EPIC.md Location**: `/docs/3-epics/4A.3-accessibility/EPIC.md`

---

## Phase 5A: DevOps Enhancement (Weeks 7-8)

### Epic 5A.1: Advanced CI/CD Pipeline

**Type**: Generic

**Acceptance Criteria**:

- [ ] OWASP ZAP scanning
- [ ] Snyk vulnerability scanning
- [ ] License compliance
- [ ] Automated changelog
- [ ] Semantic versioning
- [ ] Rollback < 5 minutes

**EPIC.md Location**: `/docs/3-epics/5A.1-advanced-cicd/EPIC.md`

---

### Epic 5A.2: Vercel Production Configuration

**Type**: Generic (with product domains)

**Acceptance Criteria**:

- [ ] Production domains (www, api, cdn)
- [ ] Multi-region deployment
- [ ] Edge caching
- [ ] Global load < 2s

**EPIC.md Location**: `/docs/3-epics/5A.2-vercel-production/EPIC.md`

---

## Phase 6A: Security & Performance (Weeks 8-9)

### Epic 6A.1: Security Hardening

**Type**: Generic

**Acceptance Criteria**:

- [ ] CSP, HSTS, X-Frame-Options
- [ ] CSRF protection
- [ ] Input validation
- [ ] OWASP Top 10 audit
- [ ] Patch management

**EPIC.md Location**: `/docs/3-epics/6A.1-security/EPIC.md`

---

### Epic 6A.2: Performance Optimisation

**Type**: Generic

**Acceptance Criteria**:

- [ ] JS < 200KB, CSS < 50KB
- [ ] Code splitting
- [ ] Image optimisation
- [ ] Core Web Vitals targets
- [ ] Lighthouse > 90

**EPIC.md Location**: `/docs/3-epics/6A.2-performance/EPIC.md`

---

### Epic 6A.3: Compliance Implementation

**Type**: Product-Specific (GDPR/CCPA for this product)

**Acceptance Criteria**:

- [ ] Cookie consent
- [ ] Data export
- [ ] Data deletion
- [ ] Privacy policy
- [ ] Audit trail
- [ ] User rights portal

**EPIC.md Location**: `/docs/3-epics/6A.3-compliance/EPIC.md`

---

## Phase 7A: Documentation & Training (Weeks 9-10)

### Epic 7A.1: Developer Documentation Enhancement

**Type**: Mixed (generic patterns + product specifics)

**Acceptance Criteria**:

- [ ] Architecture docs
- [ ] API reference
- [ ] Component guides
- [ ] Setup/deployment guides

**EPIC.md Location**: `/docs/3-epics/7A.1-dev-docs/EPIC.md`

---

### Epic 7A.2: Operational Documentation

**Type**: Mixed

**Acceptance Criteria**:

- [ ] Runbooks
- [ ] Incident playbook
- [ ] Monitoring dashboards
- [ ] DR plan

**EPIC.md Location**: `/docs/3-epics/7A.2-ops-docs/EPIC.md`

---

## Phase 8A: Launch Preparation (Week 10)

### Epic 8A.1: Pre-Launch Validation

**Type**: Mixed

**Acceptance Criteria**:

- [ ] Penetration test
- [ ] Load test (10,000 concurrent)
- [ ] Compliance checklists
- [ ] Accessibility confirmed
- [ ] Stakeholder sign-off

**EPIC.md Location**: `/docs/3-epics/8A.1-pre-launch/EPIC.md`

---

### Epic 8A.2: Launch Readiness

**Type**: Product-Specific

**Acceptance Criteria**:

- [ ] Smoke tests pass
- [ ] Team trained
- [ ] Rollback tested
- [ ] Go-live checklist
- [ ] Launch executed

**EPIC.md Location**: `/docs/3-epics/8A.2-launch/EPIC.md`

---

## Epic Count Summary

| Section                     | Epic Count | Type               |
| --------------------------- | ---------- | ------------------ |
| **Planning & Design**       |            |                    |
| Phase P: Planning           | 3          | Mixed              |
| **Subtotal Planning**       | **3**      | **Pre-Dev**        |
|                             |            |                    |
| **Platform Foundation**     |            |                    |
| Phase 0A: Steel Thread      | 1          | Generic            |
| Phase 1A: Foundation        | 5          | Generic            |
| Phase 2A: Platform Packages | 8          | Generic            |
| Phase 3A: Platform Apps     | 2          | Generic            |
| **Subtotal Platform**       | **16**     | **Generic**        |
|                             |            |                    |
| **Product Implementation**  |            |                    |
| Phase 2B: Product Packages  | 7          | Product            |
| Phase 3B: Product Apps      | 7          | Product            |
| Phase 3B: Post-MVP Backlog  | 2          | Product (Deferred) |
| **Subtotal Product**        | **16**     | **Product**        |
|                             |            |                    |
| **Production Readiness**    |            |                    |
| Phase 4A: Quality           | 3          | Mixed              |
| Phase 5A: DevOps            | 2          | Mixed              |
| Phase 6A: Security          | 3          | Mixed              |
| Phase 7A: Documentation     | 2          | Mixed              |
| Phase 8A: Launch            | 2          | Mixed              |
| **Subtotal Readiness**      | **12**     | **Mixed**          |
|                             |            |                    |
| **TOTAL (MVP)**             | **45**     |                    |
| **TOTAL (with Post-MVP)**   | **47**     |                    |

---

## Reusability Summary

```
┌─────────────────────────────────────────────────────────────────────┐
│                    STARTER KIT POTENTIAL                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  PLATFORM FOUNDATION (16 epics)                              │   │
│  │  100% Reusable — Extract as Next.js Monorepo Starter Kit    │   │
│  │                                                              │   │
│  │  • Steel Thread deployment                                   │   │
│  │  • Monorepo + pnpm + Turborepo                              │   │
│  │  • Testing (Vitest + Playwright)                            │   │
│  │  • CI/CD (GitHub Actions + Vercel)                          │   │
│  │  • Quality gates (Husky, commitlint)                        │   │
│  │  • Shared configs (TS, ESLint, Prettier, Tailwind)          │   │
│  │  • Database infrastructure (Drizzle + Neon)                 │   │
│  │  • Observability (logging, errors, health)                  │   │
│  │  • Analytics infrastructure                                  │   │
│  │  • Generic UI components (shadcn/ui)                        │   │
│  │  • Middleware patterns                                       │   │
│  │  • Auth infrastructure (Clerk)                              │   │
│  │  • API client                                                │   │
│  │  • CDN app                                                   │   │
│  │  • Routing shell                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              ↓                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  PRODUCT IMPLEMENTATION (14 epics)                          │   │
│  │  Project-Specific — Your business logic goes here           │   │
│  │                                                              │   │
│  │  • Product database schema                                   │   │
│  │  • Multi-tenant org model                                    │   │
│  │  • Product analytics events                                  │   │
│  │  • Product content schemas                                   │   │
│  │  • Product UI components                                     │   │
│  │  • Product middleware                                        │   │
│  │  • Product auth roles                                        │   │
│  │  • Product API endpoints                                     │   │
│  │  • Product applications                                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              ↓                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  PRODUCTION READINESS (12 epics)                            │   │
│  │  Mostly Generic — Some product-specific testing             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Parallel Execution Model

With this separation, two workstreams can operate in parallel after Phase 1:

```
Week 1      Week 2           Week 3           Week 4           Week 5+
──────      ──────           ──────           ──────           ──────

Phase 0-1   ┌─────────────────────────────────────────────────────────┐
(Serial)    │ PLATFORM STREAM                                         │
     │      │ 2A.1 → 2A.2 → 2A.3/4/5 → 2A.6 → 2A.7 → 2A.8 → 3A.1/2   │
     │      └─────────────────────────────────────────────────────────┘
     │                ↓ (dependencies satisfied)
     │      ┌─────────────────────────────────────────────────────────┐
     │      │ PRODUCT STREAM                                          │
     └─────►│ 2B.1 → 2B.2 → 2B.3/4/5/6 → 2B.7 → 3B.1 → 3B.2-7        │
            └─────────────────────────────────────────────────────────┘
```

This allows:

- Platform team to build reusable infrastructure
- Product team to follow with business logic
- Clear handoff points between streams
- Platform can be stabilised while product iterates
