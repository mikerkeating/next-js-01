# Epic 2A.2: Database Infrastructure

> **To create stories for this epic:** Define the epic scope and acceptance criteria first, then break down into stories following the [story template](../../0-process/references/story-details-template.md). Each story should be independently implementable and testable.

## Context

- **PRD Reference**: [PRD: Feature M.5 - Content API & Data Layer](/docs/1-product/1-prd.md#feature-m5-content-api--data-layer)
- **TAD Reference**: [TAD: Database & ORM](/docs/2-technical/2-tad.md#database--orm)
- **Phase**: 2A - Core Platform Packages
- **Type**: Foundation

## Dependencies

### Requires (Must Complete First)

| Epic | Title                                                   | Reason                                                           |
| ---- | ------------------------------------------------------- | ---------------------------------------------------------------- |
| 2A.1 | [Configuration Package](../2A.1-config-package/EPIC.md) | Shared TypeScript and ESLint configs needed for database package |
| 1A.5 | [Basic CI/CD Pipeline](../1A.5-basic-cicd/EPIC.md)      | CI pipeline needed to validate database migrations and tests     |

### Blocks (Enables These Epics)

| Epic | Title                                                        | What This Provides                                      |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------- |
| 2A.3 | [Observability Package](../2A.3-observability/EPIC.md)       | Database health check utilities                         |
| 2A.7 | [Auth Infrastructure](../2A.7-auth-infra/EPIC.md)            | User table and sync capabilities                        |
| 2B.1 | [Product Database Schema](../2B.1-product-schema/EPIC.md)    | Generic database infrastructure and migration framework |
| 2B.2 | [Multi-Tenant Organization Model](../2B.2-org-model/EPIC.md) | Organization-scoped query utilities                     |

### Can Run in Parallel With

| Epic | Title                                                       | Notes                                                              |
| ---- | ----------------------------------------------------------- | ------------------------------------------------------------------ |
| 2A.3 | [Observability Package](../2A.3-observability/EPIC.md)      | No data dependencies; can develop independently once 2A.1 complete |
| 2A.4 | [Analytics Infrastructure](../2A.4-analytics-infra/EPIC.md) | Independent infrastructure; no shared code until integration       |
| 2A.5 | [UI Component Library](../2A.5-ui-components/EPIC.md)       | Completely independent frontend vs backend concerns                |

## Overview

This epic establishes the database infrastructure layer using Drizzle ORM with PostgreSQL (via Neon or Supabase). It provides the generic, reusable foundation for all database operations including connection management, migration infrastructure, and utility functions. This is platform-level infrastructure that does not include product-specific schemas.

**Key Deliverables:**

- `@repo/database` package with Drizzle ORM configured
- Neon serverless PostgreSQL connection with pooling (production/staging)
- Local Docker PostgreSQL for offline development
- Migration infrastructure with up/down support
- Seed script framework for development and testing
- Generic utility functions: `createId()`, `timestamps()`, `softDelete()`
- Row-Level Security (RLS) helper patterns (generic, not product-specific)
- Environment-based connection string management with auto-driver selection

## Acceptance Criteria

> **Note**: Epic acceptance criteria should be high-level outcomes. Story-level criteria provide the detailed verification.

- [x] Developers can import `@repo/database` and execute type-safe queries against PostgreSQL
- [x] Database migrations can be generated, applied, and rolled back via CLI commands
- [x] Connection pooling maintains <100ms connection times under normal load
- [x] Environment-specific database URLs work correctly (dev, staging, production)
- [x] Generic utility functions are available and documented for use in product schemas
- [x] Seed scripts can populate test data in any environment
- [x] Test suite achieves 80% coverage for database utilities
- [x] All stories complete and verified
- [x] Documentation updated with usage examples

## Stories

| ID  | Title                                                                                | Size | Status | Depends On | Blocks   |
| --- | ------------------------------------------------------------------------------------ | ---- | ------ | ---------- | -------- |
| S1  | [Create @repo/database Package Structure](./S1-package-structure.md)                 | S    | ✅     | -          | S2, S3   |
| S2  | [Configure Drizzle ORM and Client](./S2-drizzle-config.md)                           | M    | ✅     | S1         | S3-S5,S9 |
| S3  | [Implement Connection Utilities](./S3-connection-utilities.md)                       | M    | ✅     | S1, S2     | S4-S6    |
| S4  | [Set Up Migration Infrastructure](./S4-migration-infrastructure.md)                  | M    | ✅     | S2, S3     | S6       |
| S5  | [Create Seed Script Framework](./S5-seed-framework.md)                               | S    | ✅     | S2, S3     | S6, S7   |
| S6  | [Implement Generic Utility Functions](./S6-utility-functions.md)                     | M    | ✅     | S3, S4, S5 | S7, S8   |
| S7  | [Write Tests for Database Package](./S7-tests.md)                                    | M    | ✅     | S5, S6     | S8, S10  |
| S8  | [Create Documentation and Examples](./S8-documentation.md)                           | S    | ✅     | S6, S7     | -        |
| S9  | [Local Docker Database for Development](./S9-local-docker-database.md)               | S    | ✅     | S2         | S10      |
| S10 | [Database Integration Tests and Connection Verification](./S10-integration-tests.md) | M    | ✅     | S7, S9     | -        |

**Status Legend**: ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Blocked

## Story Dependency Graph

```
S1 (Package structure)
 └──→ S2 (Drizzle config)
       ├──→ S3 (Connection utilities)
       │     ├──→ S4 (Migration infrastructure)
       │     │     ↓
       │     ├──→ S5 (Seed framework)
       │     │     ↓
       │     └──→ S6 (Utility functions) ←─┘
       │           ↓
       │     ┌────→ S7 (Tests) ←───────────┘
       │     │       ↓
       │     └─────→ S8 (Documentation)
       │             ↓
       │           S10 (Integration tests) ←─┐
       │                                     │
       └──→ S9 (Local Docker database) ──────┘
```

**Parallel Execution Notes:**

- S4 and S5 can run in parallel after S3 completes
- S9 can run in parallel with S3, S4, S5 after S2 completes (independent Docker setup)
- S7 depends on S5 and S6 (needs utilities and seed data for testing)
- S8 can begin documentation structure after S6, but final review needs S7
- S10 depends on both S7 (test infrastructure) and S9 (Docker setup) for live database testing

## Technical Constraints

### Required Patterns

- **Type-Safe Schema**: All schemas must use Drizzle's TypeScript-first approach with inferred types per [ADR-005](/docs/2-technical/adr/005-drizzle-orm.md)
- **Serverless Connection**: Must use Neon HTTP driver for edge compatibility per [TAD: Database & ORM](/docs/2-technical/2-tad.md#database--orm)
- **Organization Scoping**: All query helpers must support Organization-scoped filtering for multi-tenancy per [ADR-007](/docs/2-technical/adr/007-multi-tenant-model.md)
- **Monorepo Package**: Package must follow `@repo/*` naming convention per [ADR-001](/docs/2-technical/adr/001-monorepo-turborepo.md)

### Technology Decisions

| Decision               | Choice              | Reference                                                                           |
| ---------------------- | ------------------- | ----------------------------------------------------------------------------------- |
| ORM Selection          | Drizzle ORM         | [ADR-005: Drizzle as ORM](/docs/2-technical/adr/005-drizzle-orm.md)                 |
| Database Host          | Neon/Supabase       | [TAD: Database & ORM](/docs/2-technical/2-tad.md#database--orm)                     |
| PostgreSQL Version     | 16+                 | [Canonical Versions](/docs/2-technical/references/canonical-versions.md)            |
| Multi-Tenancy Approach | RLS + Query Filters | [ADR-007: Multi-tenant Data Model](/docs/2-technical/adr/007-multi-tenant-model.md) |

### Constraints

- **No Product Schemas**: This epic covers infrastructure only; product-specific tables (users, Organizations, content) are defined in Epic 2B.1
- **No Product RLS Policies**: Generic RLS helper patterns only; product-specific policies deferred to Epic 2B.1
- **Edge Compatibility**: All utilities must work in Vercel Edge Functions
- **Version Consistency**: Drizzle version must match canonical-versions.md (^0.29.0)

## Out of Scope

The following items are explicitly NOT part of this epic:

- **Product-specific tables** (users, Organizations, content, analytics_events) - Deferred to Epic 2B.1
- **Product-specific RLS policies** - Deferred to Epic 2B.1
- **Product-specific seed data** - Deferred to Epic 2B.1
- **Real-time subscriptions/WebSocket connections** - Not required for MVP
- **Database backups/restore automation** - Handled by Neon/Supabase platform
- **Read replicas or sharding** - Over-engineered for current scale requirements

## Actions or Decisions Required

> **Note**: Flag decisions that need resolution before or during implementation.

| Decision                    | Options                | Impact                                          | Status       |
| --------------------------- | ---------------------- | ----------------------------------------------- | ------------ |
| Database Provider           | Neon vs Supabase       | Connection string format, RLS approach, tooling | ✅ Neon      |
| Connection Pooling Strategy | Neon HTTP vs WebSocket | Performance characteristics, edge compatibility | ✅ Neon HTTP |

**Decision Notes:**

- **Database Provider**: Neon selected for serverless PostgreSQL. Provides edge-compatible HTTP driver, generous free tier, and excellent Drizzle ORM integration.
- **Connection Pooling Strategy**: Neon HTTP driver selected for universal edge compatibility and simpler serverless configuration. HTTP driver provides lower latency for single queries and meets MVP performance requirements (<100ms). See [AD-2A.2.S2.1](./S2-drizzle-config.md#ad-2a2s21-neon-http-driver-over-websocket-driver) for full rationale.

## Risks and Mitigations

| Risk                              | Likelihood | Impact | Mitigation                                                |
| --------------------------------- | ---------- | ------ | --------------------------------------------------------- |
| Drizzle API changes               | Low        | Medium | Pin to specific version, monitor changelog                |
| Neon/Supabase connectivity issues | Low        | High   | Implement connection retry logic with exponential backoff |
| Migration conflicts in team       | Medium     | Medium | Document migration workflow, require review before apply  |
| Edge runtime limitations          | Low        | Medium | Test all utilities in Edge environment early              |

## Estimated Effort

| Metric          | Value    |
| --------------- | -------- |
| Total Stories   | 10       |
| Total Hours     | 43-62h   |
| Calendar Days   | 5-6 days |
| Parallel Tracks | 3        |

### Story Breakdown

| Size      | Count | Hours  |
| --------- | ----- | ------ |
| XS (1-2h) | 0     | 0h     |
| S (2-4h)  | 4     | 8-16h  |
| M (4-8h)  | 6     | 24-48h |
| L (8-16h) | 0     | 0h     |

## References

### Internal Documentation

- [PRD: Feature M.5 - Content API & Data Layer](/docs/1-product/1-prd.md#feature-m5-content-api--data-layer)
- [TAD: Database & ORM](/docs/2-technical/2-tad.md#database--orm)
- [TAD: Multi-Tenant Data Access](/docs/2-technical/2-tad.md#multi-tenant-data-access)
- [Roadmap: Phase 2A](/docs/1-product/3-roadmap.md#phase-2a-core-platform-packages-week-2)
- [Canonical Technology Versions](/docs/2-technical/references/canonical-versions.md)

### ADRs

- [ADR-005: Drizzle as ORM](/docs/2-technical/adr/005-drizzle-orm.md)
- [ADR-007: Multi-tenant Data Model](/docs/2-technical/adr/007-multi-tenant-model.md)
- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)

### External Documentation

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Drizzle Kit Documentation](https://orm.drizzle.team/kit-docs/overview)
- [Drizzle with Neon](https://orm.drizzle.team/docs/get-started-postgresql#neon)
- [Drizzle with Supabase](https://orm.drizzle.team/docs/get-started-postgresql#supabase)
- [Neon Serverless Driver](https://neon.tech/docs/serverless/serverless-driver)

## Status

- **State**: Complete
- **Started**: 2025-12-01
- **Completed**: 2025-12-02
- **Stories Complete**: 10/10

**Note**: All stories complete with unit tests (199 tests, 98%+ coverage) and integration tests (45 tests). CI/CD workflows (ci.yml and pr.yml) include PostgreSQL 16 service containers for automated integration testing.
