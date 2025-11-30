# Epic 1A.4: Documentation Foundation

> **To create stories for this epic:** Define the epic scope and acceptance criteria first, then break down into stories following the [story template](../../0-process/references/story-details-template.md). Each story should be independently implementable and testable.

## Context

- **PRD Reference**: [PRD: Technical Requirements](/docs/1-product/1-prd.md#6-technical-requirements)
- **TAD Reference**: [TAD: Documentation Architecture](/docs/2-technical/2-tad-documentation.md)
- **Phase**: 1A - Foundation & Infrastructure (Days 3-7)
- **Type**: Foundation

## Dependencies

### Requires (Must Complete First)

| Epic | Title                                                                    | Reason                                                                                                             |
| ---- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| 1A.2 | [Package Management & Quality Gates](../1A.2-package-management/EPIC.md) | Markdown linting configuration (markdownlint), pre-commit hooks for documentation files, and quality gate patterns |

### Blocks (Enables These Epics)

| Epic | Title                                                           | What This Provides                                                                                        |
| ---- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 1A.5 | [Basic CI/CD Pipeline](../1A.5-basic-cicd/EPIC.md)              | Documentation quality checks for CI pipeline, ADR template for pipeline decisions                         |
| 2A.x | All Phase 2A Package Epics                                      | README template structure, ARCHITECTURE.md and CONTRIBUTING.md patterns for packages                      |
| 3B.4 | [Documentation Application](../3B.4-docs-app/EPIC.md)           | Documentation site framework selection (Nextra/Docusaurus), directory structure, and content Organization |
| 7A.1 | [Developer Documentation Enhancement](../7A.1-dev-docs/EPIC.md) | Foundation documentation structure to expand upon, ADR catalog to complete                                |

### Can Run in Parallel With

| Epic | Title                                                    | Notes                                                      |
| ---- | -------------------------------------------------------- | ---------------------------------------------------------- |
| 1A.3 | [Testing Foundation](../1A.3-testing-foundation/EPIC.md) | No resource conflicts; different tooling and file patterns |

## Overview

Documentation Foundation establishes documentation-as-code practices for the monorepo, ensuring all code is accompanied by appropriate documentation from day one. This epic creates the `/docs` directory structure, sets up documentation site infrastructure, establishes the Architecture Decision Record (ADR) process, and creates essential root documentation files. The foundation ensures developers have templates and patterns for consistent documentation across all packages and applications.

**Key Deliverables:**

- `/docs` directory structure: `/adr`, `/architecture`, `/api`, `/guides`, `/3-epics`
- Documentation site framework configured (Nextra or Docusaurus)
- ADR template and initial architectural decisions documented (ADR-001 through ADR-007)
- Root documentation: README.md, CONTRIBUTING.md, SECURITY.md
- CLAUDE.md template for AI-assisted epic implementation
- Package documentation templates (README.md structure, ARCHITECTURE.md, CONTRIBUTING.md)
- Documentation quality gates integrated with pre-commit hooks
- Build script to aggregate package READMEs into `/docs/packages/` and app READMEs into `/docs/apps/` for unified documentation

## Acceptance Criteria

> **Note**: Epic acceptance criteria should be high-level outcomes. Story-level criteria provide the detailed verification.

- [ ] Developers can navigate to `/docs` and find organised documentation with clear hierarchy
- [ ] The documentation site builds successfully and deploys to preview (Nextra or Docusaurus)
- [ ] All existing ADRs (001-007) are documented using the standard template format
- [ ] Creating a new ADR is straightforward using the template at `docs/0-process/references/adr-template.md`
- [ ] Root README.md provides clear project overview, quick start, and links to detailed documentation
- [ ] CONTRIBUTING.md explains the development workflow, PR process, and documentation requirements
- [ ] SECURITY.md provides vulnerability reporting instructions and security contact information
- [ ] Package README template guides developers on documenting packages for both maintainers and consumers
- [ ] Documentation files pass markdown linting on pre-commit (integrated with Epic 1A.2)
- [ ] Package READMEs are automatically aggregated into `/docs/packages/` and appear on the docs site
- [ ] App READMEs are automatically aggregated into `/docs/apps/` and appear on the docs site
- [ ] All stories complete and verified
- [ ] Documentation updated

## Stories

| ID  | Title                                                                   | Size | Status | Depends On         | Blocks         |
| --- | ----------------------------------------------------------------------- | ---- | ------ | ------------------ | -------------- |
| S1  | [Create Documentation Directory Structure](./S1-docs-structure.md)      | S    | ⬜     | -                  | S2, S3, S4, S5 |
| S2  | [Configure Documentation Site Framework](./S2-docs-site.md)             | M    | ⬜     | S1                 | S7             |
| S3  | [Create ADR Template and Document Initial Decisions](./S3-adr-setup.md) | M    | ⬜     | S1                 | S7             |
| S4  | [Create Root Documentation Files](./S4-root-docs.md)                    | M    | ⬜     | S1                 | S6, S7         |
| S5  | [Create Package Documentation Templates](./S5-package-templates.md)     | S    | ⬜     | S1                 | S7             |
| S6  | [Create CLAUDE.md Epic Template](./S6-claude-template.md)               | S    | ⬜     | S4                 | S7             |
| S7  | [Integrate Documentation Quality Gates](./S7-docs-quality-gates.md)     | S    | ⬜     | S2, S3, S4, S5, S6 | -              |
| S8  | [Document Documentation Foundation Setup](./S8-docs-readme.md)          | S    | ⬜     | S2, S7             | -              |
| S9  | [Protect Documentation App with Basic Auth](./S9-basic-auth.md)         | S    | ⬜     | S10                | -              |
| S10 | [Deploy Documentation App to Vercel](./S10-vercel-deploy.md)            | S    | ⬜     | S2                 | S9             |
| S11 | [Package Documentation Aggregation](./S11-package-docs-aggregation.md)  | S    | ⬜     | S2                 | S12            |
| S12 | [App Documentation Aggregation](./S12-app-docs-aggregation.md)          | S    | ⬜     | S2, S11            | -              |

**Status Legend**: ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Blocked

## Story Dependency Graph

```
S1 (Documentation Structure)
 ├──→ S2 (Documentation Site Framework)
 │     ├──→ S10 (Deploy to Vercel)
 │     │     ↓
 │     │     └──→ S9 (Basic Auth Protection)
 │     │
 │     ├──→ S11 (Package Documentation Aggregation)
 │     │     ↓
 │     │     └──→ S12 (App Documentation Aggregation)
 │     │
 │     └──→ S7 (Documentation Quality Gates) ←── S3, S4, S5, S6
 │           ↓
 │           └──→ S8 (Document Documentation Foundation Setup)
 │
 ├──→ S3 (ADR Template & Initial ADRs)
 │
 ├──→ S4 (Root Documentation Files)
 │     ↓
 │     └──→ S6 (CLAUDE.md Template)
 │
 └──→ S5 (Package Documentation Templates)
```

**Parallel Execution Notes:**

- S2, S3, S4, and S5 can all start immediately after S1 completes
- S6 (CLAUDE.md Template) depends on S4 for root documentation patterns
- S7 (Quality Gates) is the convergence point requiring all templates complete
- S10 (Vercel Deploy) can start after S2, runs in parallel with S7/S8
- S9 (Basic Auth) is the final story after S10 deployment is configured
- S11 (Package Docs Aggregation) can start after S2, runs in parallel with S7-S10
- S12 (App Docs Aggregation) depends on S11, extends the aggregation script for apps

## Technical Constraints

### Required Patterns

- **Documentation Pyramid**: Four layers (WHY/WHAT/HOW/CONTEXT) per [TAD: Documentation Architecture](/docs/2-technical/2-tad-documentation.md#documentation-layers)
- **Two Audiences Strategy**: Package documentation must serve both maintainers and consumers per [TAD: Two Audiences Strategy](/docs/2-technical/2-tad-documentation.md#two-audiences-strategy)
- **ADR Format**: Follow the ADR template structure with Status, Context, Decision, Alternatives, Consequences per [TAD: Architecture Decision Records](/docs/2-technical/2-tad.md#architecture-decision-records)
- **Living Documentation**: Documentation updated with every code change per [TAD: Maintenance Strategy](/docs/2-technical/2-tad-documentation.md#maintenance-strategy)

### Technology Decisions

| Decision                     | Choice                    | Reference                                                                                              |
| ---------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------ |
| Documentation Site Framework | Nextra or Docusaurus      | [TAD: Delivery Formats](/docs/2-technical/2-tad-documentation.md#delivery-formats)                     |
| Markdown Linting             | markdownlint-cli2         | [Epic 1A.2: Markdown Linting](/docs/3-epics/1A.2-package-management/EPIC.md)                           |
| API Documentation            | TypeDoc + OpenAPI/Swagger | [TAD: Generation vs Hand-Written](/docs/2-technical/2-tad-documentation.md#generation-vs-hand-written) |
| Diagram Format               | Mermaid (in Markdown)     | [TAD: Hand-Written Documentation](/docs/2-technical/2-tad-documentation.md#hand-written-documentation) |

### Constraints

- **Versions**: Documentation site framework version per [Canonical Versions](/docs/2-technical/references/canonical-versions.md)
- **Build Integration**: Documentation site must build as part of Turborepo pipeline
- **Preview Deployments**: Documentation changes must deploy to Vercel preview for review
- **No Stale Docs**: Quality gates prevent merging PRs with broken markdown links
- **Accessibility**: Documentation site must meet WCAG 2.1 Level AA for readability
- **Search**: Documentation site must include full-text search capability

## Out of Scope

The following items are explicitly NOT part of this epic:

- **API Reference Generation (TypeDoc)** - Deferred until packages have public APIs (Epic 2A.x package epics)
- **OpenAPI/Swagger Documentation** - Deferred to Epic 3B.1 (API Application) when API endpoints exist
- **Storybook Component Documentation** - Deferred to Epic 2A.5 (UI Component Library)
- **Operational Runbooks** - Deferred to Epic 7A.2 (Operational Documentation)
- **User-Facing Documentation** - Deferred to Epic 3B.4 (Documentation Application)
- **Advanced Search Configuration** - Basic search only; advanced faceted search deferred
- **Multi-Language/i18n Support** - English only initially; internationalisation deferred
- **Documentation Analytics** - Page view tracking deferred to production launch

## Actions or Decisions Required

> **Note**: Flag decisions that need resolution before or during implementation.

| Decision                      | Options                                        | Impact                                                | Status                       |
| ----------------------------- | ---------------------------------------------- | ----------------------------------------------------- | ---------------------------- |
| Documentation site framework  | Nextra vs Docusaurus                           | Affects build configuration, theming, and feature set | ⬜ Open                      |
| ADR numbering scheme          | Sequential (001, 002) vs date-based (2025-001) | Affects ADR file naming and Organization              | ✅ Resolved: Sequential      |
| Root README length            | Comprehensive vs minimal (link to docs)        | Affects first impression and maintenance burden       | ⬜ Open                      |
| Diagram tooling               | Mermaid only vs Mermaid + Excalidraw           | Affects diagram creation workflow                     | ✅ Resolved: Mermaid in docs |
| Documentation site deployment | Subdomain (docs.example.com) vs path (/docs)   | Affects routing configuration and SEO                 | ⬜ Open                      |

## Risks and Mitigations

| Risk                                                  | Likelihood | Impact | Mitigation                                                                                   |
| ----------------------------------------------------- | ---------- | ------ | -------------------------------------------------------------------------------------------- |
| Documentation framework choice limits future features | Medium     | Medium | Choose mature framework (Nextra/Docusaurus) with active community; abstract where possible   |
| ADRs become stale or ignored                          | Medium     | High   | Include ADR review in quarterly audit; link ADRs from code comments; make creating ADRs easy |
| Package documentation templates too rigid             | Low        | Medium | Keep templates flexible with required and optional sections; iterate based on team feedback  |
| Documentation build slows down CI/CD                  | Low        | Medium | Build docs only on changes to /docs directory; use Turborepo caching                         |
| Documentation diverges from code                      | High       | High   | Enforce documentation checklist in PR template; block PRs with broken links                  |

## Estimated Effort

| Metric          | Value                       |
| --------------- | --------------------------- |
| Total Stories   | 12                          |
| Total Hours     | 39h                         |
| Calendar Days   | 3-4 days                    |
| Parallel Tracks | 4 (S2, S3, S4, S5 after S1) |

### Story Breakdown

| Size      | Count | Hours |
| --------- | ----- | ----- |
| XS (1-2h) | 0     | 0h    |
| S (2-4h)  | 9     | 25h   |
| M (4-8h)  | 3     | 14h   |
| L (8-16h) | 0     | 0h    |

**Note**: S-sized stories are mostly file creation and template setup. M-sized stories (Documentation Site, ADR Setup, Root Docs) require more configuration, content creation, and verification. S8 creates the README documenting how the documentation system works. S10 and S9 handle Vercel deployment and basic auth protection respectively. S11 creates build script to aggregate package READMEs into the docs site. S12 extends the aggregation script to include app READMEs.

## References

### Internal Documentation

- [PRD: Technical Requirements](/docs/1-product/1-prd.md#6-technical-requirements)
- [TAD: Documentation Architecture](/docs/2-technical/2-tad-documentation.md)
- [TAD: Overview](/docs/2-technical/2-tad.md#documentation-architecture)
- [Roadmap: Phase 1A](/docs/1-product/3-roadmap.md#phase-1a-foundation--infrastructure-days-3-7)
- [Canonical Versions](/docs/2-technical/references/canonical-versions.md)
- [File Structure Guide](/docs/1-product/references/file-structure.md)

### ADRs

- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)
- [ADR-002: pnpm as Package Manager](/docs/2-technical/adr/002-pnpm-package-manager.md)
- [ADR-003: Next.js 16 as Framework](/docs/2-technical/adr/003-nextjs-framework.md)
- [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md)
- [ADR-005: Drizzle as ORM](/docs/2-technical/adr/005-drizzle-orm.md)
- [ADR-006: Clerk for Authentication](/docs/2-technical/adr/006-clerk-authentication.md)
- [ADR-007: Multi-tenant Data Model](/docs/2-technical/adr/007-multi-tenant-model.md)

### External Documentation

- [Nextra Documentation](https://nextra.site/)
- [Docusaurus Documentation](https://docusaurus.io/)
- [ADR GitHub Organization](https://adr.github.io/)
- [Mermaid Documentation](https://mermaid.js.org/)
- [markdownlint Rules](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md)
- [Conventional Commits](https://www.conventionalcommits.org/)

## Status

- **State**: Not Started
- **Started**: -
- **Completed**: -
- **Stories Complete**: 0/12
