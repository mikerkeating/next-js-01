# Story Resourcing: Epic 1A.1 - Monorepo Foundation

This document identifies the engineering roles required for each story in the Monorepo Foundation epic. Role assignments follow the evaluation criteria defined in the [Engineering Manager Agent](/docs/.claude/agents/engineering-manager.md).

## Role Legend

| Role              | Domain Focus                                                           |
| ----------------- | ---------------------------------------------------------------------- |
| **DevOps**        | CI/CD, deployment, environments, infrastructure, build tooling         |
| **Fullstack**     | Cross-domain work spanning frontend and backend with tight integration |
| **Frontend**      | UI/UX, React components, client-side concerns                          |
| **Documentation** | Technical writing, READMEs, architecture docs                          |

---

## Resourcing Table

| Story | Title                                   | Primary Role  | Secondary Role | Hand-off Required |
| ----- | --------------------------------------- | ------------- | -------------- | ----------------- |
| S1    | Install and Configure Turborepo         | DevOps        | —              | No                |
| S2    | Configure pnpm Workspaces               | DevOps        | —              | No                |
| S3    | Migrate Next.js App to Workspace        | Fullstack     | DevOps         | Yes               |
| S4    | Define Turborepo Pipeline Configuration | DevOps        | —              | No                |
| S5    | Configure Remote Caching                | DevOps        | —              | No                |
| S6    | Update Vercel Deployment Configuration  | DevOps        | Fullstack      | Yes               |
| S7    | Document Monorepo Architecture          | Documentation | DevOps         | Yes               |

---

## Role Assignment Rationale

### S1: Install and Configure Turborepo

**Pattern**: Single-Domain (Infrastructure)

- **Primary: DevOps** — Core competency in build tooling, CLI installation, and configuration file management. Tasks include installing Turborepo, creating `turbo.json`, and configuring root scripts.
- **No secondary role** — Pure infrastructure setup with no application code involvement.

### S2: Configure pnpm Workspaces

**Pattern**: Single-Domain (Infrastructure)

- **Primary: DevOps** — Package manager configuration and workspace setup falls within DevOps tooling expertise. Tasks include creating `pnpm-workspace.yaml`, `.npmrc`, `.nvmrc`, and directory structure.
- **No secondary role** — Configuration-only story with no cross-domain concerns.

### S3: Migrate Next.js App to Workspace

**Pattern**: Multi-Domain with Hand-off

- **Primary: Fullstack** — Migration touches both frontend application code and build infrastructure. Understanding of Next.js configuration (routing, Tailwind, TypeScript paths) is essential. Fullstack ensures application functionality is preserved during migration.
- **Secondary: DevOps** — Workspace package.json configuration and Turborepo integration may require DevOps input for correct workspace patterns.
- **Hand-off**: Fullstack completes file migration and app verification → DevOps reviews workspace configuration if integration issues arise.

### S4: Define Turborepo Pipeline Configuration

**Pattern**: Single-Domain (Infrastructure)

- **Primary: DevOps** — Task pipeline configuration is core DevOps expertise. Requires understanding of caching strategies, task dependencies, and build optimisation.
- **No secondary role** — Configuration-focused with clear domain ownership.

### S5: Configure Remote Caching

**Pattern**: Single-Domain (Infrastructure)

- **Primary: DevOps** — Remote cache configuration with Vercel integration is squarely within DevOps infrastructure responsibilities. Involves authentication, token management, and CI considerations.
- **No secondary role** — Infrastructure-only configuration.

### S6: Update Vercel Deployment Configuration

**Pattern**: Multi-Domain with Hand-off

- **Primary: DevOps** — Vercel dashboard configuration, build commands, and monorepo deployment settings are infrastructure concerns.
- **Secondary: Fullstack** — Verification that the deployed application functions correctly requires frontend/fullstack expertise to validate routing, rendering, and environment variable handling.
- **Hand-off**: DevOps completes deployment configuration → Fullstack verifies deployed application behaviour and functionality.

### S7: Document Monorepo Architecture

**Pattern**: Documentation with Review

- **Primary: Documentation** — Primary deliverable is README documentation. Requires technical writing skills to create clear quickstart guides, command references, and architecture diagrams.
- **Secondary: DevOps** — Review for technical accuracy of commands, caching instructions, and infrastructure details.
- **Hand-off**: Documentation drafts architecture content → DevOps reviews for technical accuracy before merge.

---

## Resource Summary by Role

| Role              | Primary Stories    | Secondary/Review Stories | Total Involvement |
| ----------------- | ------------------ | ------------------------ | ----------------- |
| **DevOps**        | S1, S2, S4, S5, S6 | S3, S7                   | 7 stories         |
| **Fullstack**     | S3                 | S6                       | 2 stories         |
| **Documentation** | S7                 | —                        | 1 story           |

---

## Hand-off Summary

| From          | To        | Story | Hand-off Point                                        |
| ------------- | --------- | ----- | ----------------------------------------------------- |
| Fullstack     | DevOps    | S3    | After file migration, if workspace integration issues |
| DevOps        | Fullstack | S6    | After deployment configuration, for app verification  |
| Documentation | DevOps    | S7    | Draft completion for technical accuracy review        |

---

## Notes

- **DevOps-heavy epic**: This epic is predominantly infrastructure/tooling work, reflected in DevOps being primary on 5 of 7 stories.
- **S3 as transition point**: The app migration story bridges infrastructure setup (S1-S2) with application concerns, making Fullstack appropriate as primary.
- **S5 and S6 can run in parallel**: Per the story dependencies, these stories have no mutual dependencies and can be worked concurrently by DevOps (with Fullstack available for S6 verification).
