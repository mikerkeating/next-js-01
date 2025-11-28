# Documentation Architecture

**Parent Document**: [Technical Architecture Document (TAD)](2-tad.md)

**Version**: 1.0
**Last Updated**: 2025-11-25
**Status**: Draft

---

## Table of Contents

1. [Overview](#overview)
2. [Core Principles](#core-principles)
3. [Documentation Layers](#documentation-layers)
4. [Two Audiences Strategy](#two-audiences-strategy)
5. [Documentation Structure](#documentation-structure)
6. [Documentation Ownership](#documentation-ownership)
7. [Generation vs Hand-Written](#generation-vs-hand-written)
8. [Quality Gates](#quality-gates)
9. [Delivery Formats](#delivery-formats)
10. [Maintenance Strategy](#maintenance-strategy)
11. [Success Metrics](#success-metrics)
12. [Implementation Examples](#implementation-examples)
13. [Integration with Roadmap](#integration-with-roadmap)

---

## Overview

### Purpose

Documentation is treated as a **first-class product deliverable** in this project, not an afterthought. This document defines the comprehensive documentation strategy that ensures:

- Every package has documentation for both maintainers and consumers
- Documentation is created alongside code, not after
- Multiple audiences receive appropriate documentation types
- Documentation remains current through automated quality gates
- Knowledge is preserved and accessible

### Key Philosophy

> **Documentation degrades unless actively maintained.**

Therefore, we build documentation maintenance into our development workflow, CI/CD pipeline, and team culture.

---

## Core Principles

### 1. Documentation as a Product Deliverable

Documentation is not a "Phase 7" task but an ongoing practice embedded in every epic. When a feature is "done," its documentation is complete.

### 2. Two Audiences Per Package

Every package serves two distinct audiences with different needs:

- **Package Maintainer** (internal developer who builds/maintains)
- **Package Consumer** (developer who uses the package)

### 3. Generate When Possible, Write When Necessary

- Auto-generate: API reference, component catalogs, OpenAPI specs
- Hand-write: ADRs, guides, runbooks, architectural explanations

### 4. Quality Gates Enforce Completeness

CI/CD fails if:

- Packages lack README.md
- Public functions lack JSDoc
- API endpoints missing from OpenAPI spec
- Markdown links are broken

### 5. Living Documentation

Documentation is versioned with code and updated with every change:

- Code change → Update inline comments
- API change → Update OpenAPI spec and README
- Architecture change → Update TAD, create ADR
- New feature → Update user guides with examples

---

## Documentation Layers

The **Documentation Pyramid** organizes documentation into four layers from strategic to operational:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DOCUMENTATION PYRAMID                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Level 1: WHY (Strategic)                                           │
│  ├── PRD: What we're building and why                               │
│  ├── TAD: How we're building it (architecture)                      │
│  └── ADRs: Why we made specific decisions                           │
│                                                                     │
│  Level 2: WHAT (Product)                                            │
│  ├── User Documentation: How to use the applications                │
│  ├── API Reference: Endpoint documentation                          │
│  └── Feature Guides: How features work                              │
│                                                                     │
│  Level 3: HOW (Implementation)                                      │
│  ├── Package Documentation: How to use each package                 │
│  ├── Code Documentation: Inline comments, JSDoc                     │
│  └── Runbooks: How to operate the system                            │
│                                                                     │
│  Level 4: CONTEXT (Development)                                     │
│  ├── Epic/Story Specs: Implementation guidance                      │
│  ├── README files: Quick start per package/app                      │
│  └── CONTRIBUTING: Development workflow                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Level 1: WHY (Strategic)

**Purpose**: Explain strategic decisions and long-term architectural vision

**Documents**:

- `docs/1-product/1-prd.md` — Product Requirements Document
- `docs/2-technical/2-tad.md` — Technical Architecture Document
- `docs/2-technical/adr/*.md` — Architecture Decision Records

**Audience**: Technical leads, architects, senior engineers, stakeholders

**Maintenance**: Updated when major strategic or architectural changes occur

### Level 2: WHAT (Product)

**Purpose**: Explain what the product does and how users interact with it

**Documents**:

- `apps/*/README.md` — Application-level documentation
- `docs/guides/*.md` — User guides and tutorials
- Generated API documentation (OpenAPI/Swagger)

**Audience**: End users, API consumers, product managers

**Maintenance**: Updated with every feature release

### Level 3: HOW (Implementation)

**Purpose**: Explain how to implement, extend, and operate the system

**Documents**:

- `packages/*/README.md` — Package usage and maintenance
- `packages/*/docs/ARCHITECTURE.md` — Internal package structure
- `packages/*/docs/TESTING.md` — Testing strategies
- JSDoc comments in source code
- `docs/operations/runbooks/*.md` — Operational procedures

**Audience**: Developers (both maintainers and consumers), DevOps

**Maintenance**: Updated with every code change

### Level 4: CONTEXT (Development)

**Purpose**: Provide context for development workflow and onboarding

**Documents**:

- `docs/3-epics/*/EPIC.md` — Epic specifications
- `docs/3-epics/*/S*.md` — Story specifications
- `CONTRIBUTING.md` — Development workflow
- Root `README.md` — Project overview

**Audience**: New team members, contributors

**Maintenance**: Updated during epic planning and retrospectives

---

## Two Audiences Strategy

### Audience 1: Package Maintainer (Internal Developer)

**Who**: Developers who build and maintain the package itself

**Needs**:

- Understanding the package's internal architecture
- How to add features or fix bugs within the package
- Testing strategy and test location
- Build, release, and versioning process
- Design decisions and trade-offs

**Documentation Location**:

```
packages/{name}/
├── README.md                  # Includes "For Maintainers" section
├── docs/
│   ├── ARCHITECTURE.md        # Internal structure, design patterns
│   ├── CONTRIBUTING.md        # How to contribute to this package
│   ├── TESTING.md            # Testing approach and running tests
│   └── RELEASING.md          # Version management and publishing
└── src/
    └── *.ts (with JSDoc)     # Inline code documentation
```

**Example Content** (from `packages/auth/README.md`):

```markdown
## For Maintainers

### Architecture

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for internal structure.

### Development

1. Clone monorepo: `git clone ...`
2. Install dependencies: `pnpm install`
3. Run tests: `pnpm test`
4. Build: `pnpm build`

### Testing

See [docs/TESTING.md](./docs/TESTING.md) for testing strategy.

### Releasing

See [docs/RELEASING.md](./docs/RELEASING.md) for version management.
```

---

### Audience 2: Package Consumer (Other Developers)

**Who**: Developers who use the package in their applications

**Needs**:

- How to install and configure the package
- API reference (what functions/components are available)
- Usage examples and common patterns
- Troubleshooting common issues
- Migration guides when upgrading

**Documentation Location**:

```
packages/{name}/
├── README.md                  # Top section: installation, usage, examples
├── docs/
│   └── api/                   # Generated API documentation (TypeDoc)
└── .storybook/                # Component showcase (UI packages only)
```

**Example Content** (from `packages/auth/README.md`):

```markdown
# @repo/auth

Authentication and authorization package using Clerk.

## Installation

\`\`\`bash
pnpm add @repo/auth
\`\`\`

## Quick Start

\`\`\`typescript
import { requireAuth, requireRole } from '@repo/auth';

// Protect a route
export default requireAuth(MyPage);

// Require specific role
export default requireRole('internal')(AdminPage);
\`\`\`

## API Reference

[View full API documentation →](./docs/api/index.html)

## Usage Guides

- [Setting up protected routes](../../../docs/guides/protected-routes.md)
- [Role-based access control](../../../docs/guides/rbac.md)
- [Organization context](../../../docs/guides/org-context.md)

## Troubleshooting

**Issue**: "Session not found" error
**Solution**: Ensure middleware is configured in `middleware.ts`...
```

---

## Documentation Structure

Complete monorepo documentation Organization:

```
next-js-2025-12-1/
├── docs/                              # Central documentation hub
│   ├── 0-product/                     # Strategic documentation
│   │   ├── 0-process.md               # Development process
│   │   ├── 1-prd.md                   # Product requirements
│   │   ├── 2-tad.md                   # Technical architecture (this doc)
│   │   ├── 2-tad-*.md                 # Detailed TAD sections
│   │   ├── 3-roadmap.md               # Epic delivery roadmap
│   │   ├── 4-documentation-strategy.md # This strategy
│   │   └── adr/                       # Architecture Decision Records
│   │       ├── template.md
│   │       ├── 001-monorepo-turborepo.md
│   │       ├── 002-pnpm-package-manager.md
│   │       └── ...
│   │
│   ├── 3-epics/                       # Epic & story specifications
│   │   ├── 0A.1-steel-thread/
│   │   │   ├── EPIC.md                # Epic overview
│   │   │   ├── S1-create-app.md       # Story specification
│   │   │   └── S2-configure-vercel.md
│   │   ├── 1A.1-foundation/
│   │   └── ...
│   │
│   ├── 3-references/                  # Templates and reference guides
│   │   ├── adr-template.md            # ADR template
│   │   ├── epic-template.md           # Epic spec template
│   │   ├── story-details-template.md          # Story spec template
│   │   └── file-structure.md          # Project structure guide
│   │
│   ├── architecture/                  # Architecture documentation
│   │   ├── overview.md                # System overview
│   │   ├── data-model.md              # Database schema
│   │   ├── deployment.md              # Deployment architecture
│   │   └── diagrams/                  # Architecture diagrams
│   │
│   ├── guides/                        # Developer guides (consumers)
│   │   ├── getting-started.md         # Project setup
│   │   ├── using-auth-package.md      # Package usage
│   │   ├── creating-ui-components.md  # Component development
│   │   ├── database-migrations.md     # Database workflow
│   │   ├── testing-strategy.md        # Testing approach
│   │   └── deployment-guide.md        # Deployment procedures
│   │
│   ├── api/                           # API documentation
│   │   ├── overview.md                # API overview
│   │   ├── openapi.yaml               # Generated OpenAPI spec
│   │   └── endpoints/                 # Endpoint documentation
│   │
│   └── operations/                    # Operational documentation
│       ├── deployment.md              # Deployment procedures
│       ├── monitoring.md              # Monitoring setup
│       ├── incident-response.md       # Incident handling
│       └── runbooks/                  # Operational runbooks
│           ├── database-backup.md
│           ├── rollback.md
│           └── scaling.md
│
├── packages/                          # Package-specific documentation
│   ├── auth/
│   │   ├── README.md                  # Consumer (top) + Maintainer (bottom)
│   │   └── docs/
│   │       ├── ARCHITECTURE.md        # Internal structure (maintainer)
│   │       ├── CONTRIBUTING.md        # How to contribute (maintainer)
│   │       ├── TESTING.md             # Testing guide (maintainer)
│   │       └── api/                   # Generated API docs (consumer)
│   │
│   ├── ui/
│   │   ├── README.md
│   │   ├── .storybook/                # Component showcase (consumer)
│   │   └── docs/
│   │       ├── ARCHITECTURE.md
│   │       ├── DESIGN-SYSTEM.md       # Design principles (maintainer)
│   │       └── TESTING.md
│   │
│   ├── database/
│   │   ├── README.md
│   │   └── docs/
│   │       ├── SCHEMA.md              # Database schema (both audiences)
│   │       ├── MIGRATIONS.md          # Migration workflow (maintainer)
│   │       └── QUERIES.md             # Query patterns (consumer)
│   │
│   └── [other packages]/
│       └── ... (same structure)
│
├── apps/                              # Application-specific documentation
│   ├── routing/
│   │   └── README.md                  # Routes, env vars, deployment
│   │
│   ├── api/
│   │   └── README.md                  # API endpoints, auth, rate limits
│   │
│   └── [other apps]/
│       └── README.md
│
├── README.md                          # Project overview and quick start
├── CONTRIBUTING.md                    # Development workflow
└── CHANGELOG.md                       # Version history
```

---

## Documentation Ownership

Documentation ownership is distributed across epic phases to ensure documentation is created alongside implementation:

| Epic Phase               | Documentation Created                                            | Primary Owner       |
| ------------------------ | ---------------------------------------------------------------- | ------------------- |
| **P (Planning)**         | PRD, TAD, ADRs, Epic/Story specs                                 | Tech Lead + PM      |
| **0A-1A (Foundation)**   | README, CONTRIBUTING, architecture diagrams, monorepo structure  | Platform Team       |
| **2A (Shared Packages)** | Package READMEs (both audiences), ARCHITECTURE.md, API reference | Package Maintainers |
| **2B (Product Domain)**  | Product domain docs, data model documentation                    | Product Team        |
| **3A-3B (Applications)** | App READMEs, API docs (OpenAPI), user guides                     | App Teams           |
| **4A-8A (Features)**     | Feature guides, usage examples, troubleshooting                  | Feature Teams       |
| **7A (Documentation)**   | Documentation completeness audit, doc site                       | Documentation Team  |
| **8A (Operations)**      | Operational runbooks, incident procedures                        | DevOps + All Teams  |

### Continuous Ownership

While specific documentation is created during epic phases, **all teams own documentation maintenance** throughout the project lifecycle:

- Code change → Update inline comments and JSDoc
- API change → Update OpenAPI spec and package README
- Architecture change → Update TAD and create ADR
- Bug fix → Update troubleshooting section
- Incident → Update runbook with lessons learned

---

## Generation vs Hand-Written

### Auto-Generated Documentation

**Philosophy**: Generate documentation from code to ensure accuracy and reduce maintenance burden.

| Type                  | Generated From                 | Tool                        | Output Location                    |
| --------------------- | ------------------------------ | --------------------------- | ---------------------------------- |
| **API Reference**     | TypeScript source with JSDoc   | TypeDoc                     | `packages/*/docs/api/`             |
| **Component Library** | React components + stories     | Storybook                   | Deployed Storybook site            |
| **API Endpoints**     | Route handlers with decorators | OpenAPI/Swagger             | `docs/api/openapi.yaml`            |
| **Database Schema**   | Drizzle schema definitions     | Drizzle Kit + custom script | `packages/database/docs/SCHEMA.md` |
| **Type Definitions**  | TypeScript interfaces/types    | TypeDoc                     | Included in API reference          |

**CI/CD Integration**:

```yaml
# .github/workflows/docs.yml
- name: Generate API Documentation
  run: pnpm turbo run generate-docs

- name: Build Storybook
  run: pnpm turbo run build-storybook

- name: Generate OpenAPI Spec
  run: pnpm generate-openapi
```

**Benefits**:

- Always in sync with code
- No manual maintenance
- Type-safe documentation
- Automated testing of examples

---

### Hand-Written Documentation

**Philosophy**: Write documentation where human explanation, context, and decision-making are required.

| Type                      | Format               | Location                      | Purpose                          |
| ------------------------- | -------------------- | ----------------------------- | -------------------------------- |
| **Architecture Diagrams** | Mermaid / Excalidraw | `docs/architecture/diagrams/` | Visual system overview           |
| **ADRs**                  | Markdown (template)  | `docs/2-technical/adr/`       | Document architectural decisions |
| **User Guides**           | Markdown             | `docs/guides/`                | Step-by-step tutorials           |
| **Runbooks**              | Markdown             | `docs/operations/runbooks/`   | Operational procedures           |
| **Epic/Story Specs**      | Markdown (template)  | `docs/3-epics/`               | Implementation guidance          |
| **ARCHITECTURE.md**       | Markdown             | `packages/*/docs/`            | Package internal structure       |
| **Troubleshooting**       | Markdown             | Package READMEs               | Common issues and solutions      |

**Quality Standards**:

- Use templates (ADR, Epic, Story) for consistency
- Include examples and code snippets
- Link to related documentation
- Keep language clear and concise
- Update with code changes

---

## Quality Gates

### CI/CD Documentation Checks

Documentation quality is enforced through automated checks in the CI/CD pipeline:

```yaml
# GitHub Actions: Documentation Quality Gate
name: Documentation Quality

on: [pull_request]

jobs:
  docs-check:
    runs-on: ubuntu-latest
    steps:
      - name: Check Package READMEs
        run: |
          # Fail if any package lacks README.md
          for pkg in packages/*; do
            if [ ! -f "$pkg/README.md" ]; then
              echo "Missing README.md in $pkg"
              exit 1
            fi
          done

      - name: Check JSDoc Coverage
        run: |
          # Fail if public functions lack JSDoc
          pnpm turbo run check-jsdoc

      - name: Validate OpenAPI Spec
        run: |
          # Ensure all API endpoints are documented
          pnpm generate-openapi --validate

      - name: Check Markdown Links
        uses: gaurav-nelson/github-action-markdown-link-check@v1
        with:
          use-quiet-mode: "yes"

      - name: Spell Check (optional)
        run: |
          pnpm cspell "docs/**/*.md" "packages/**/README.md"
```

### Pre-Commit Hooks

```javascript
// .husky/pre-commit
npx lint-staged

// package.json
{
  "lint-staged": {
    "*.md": [
      "prettier --write",
      "markdown-link-check",
      "cspell"
    ],
    "packages/**/src/**/*.{ts,tsx}": [
      "eslint --rule 'require-jsdoc: error'"
    ]
  }
}
```

### Pull Request Checklist

Every PR template includes documentation requirements:

```markdown
## Documentation Checklist

- [ ] Updated package README if public API changed
- [ ] Added/updated JSDoc for new public functions
- [ ] Updated OpenAPI spec if API endpoints changed
- [ ] Created/updated ADR for architectural decisions
- [ ] Updated relevant user guides
- [ ] Added inline code comments explaining "why"
- [ ] Updated CHANGELOG.md
```

---

## Delivery Formats

Documentation is delivered in multiple formats optimized for different audiences:

### 1. Static Documentation Site (Developers)

**Tool**: Nextra or Docusaurus
**Content**: Architecture docs, guides, ADRs, API reference
**Deployment**: Vercel (public) or internal hosting
**URL**: `https://docs.example.com`

**Features**:

- Full-text search
- Version switcher
- Dark mode
- Mobile-responsive
- Auto-deployed on merge to main

---

### 2. Interactive API Documentation (API Consumers)

**Tool**: Swagger UI / Redoc
**Content**: Generated OpenAPI specification
**Deployment**: Vercel
**URL**: `https://api.example.com/docs`

**Features**:

- "Try it out" functionality
- Authentication testing
- Request/response examples
- Schema visualization
- Code generation in multiple languages

---

### 3. Component Showcase (UI Developers)

**Tool**: Storybook
**Content**: UI component library with interactive examples
**Deployment**: Chromatic / Vercel
**URL**: `https://storybook.example.com`

**Features**:

- Interactive component playground
- Props table documentation
- Accessibility checks
- Visual regression testing
- Component usage examples

---

### 4. Public Documentation (End Users)

**Tool**: Next.js application
**Content**: User guides, tutorials, getting started
**Deployment**: Vercel (same as main app)
**URL**: `https://example.com/docs`

**Features**:

- Integrated with marketing site
- Search functionality
- Feedback mechanism
- Analytics tracking
- Multi-language support (future)

---

### 5. Operational Wiki (DevOps/Support)

**Tool**: In-repo Markdown
**Content**: Runbooks, incident response, on-call procedures
**Location**: Private wiki + `docs/operations/`

**Features**:

- Quick access for on-call engineers
- Edit history and version control
- Alert integration
- Searchable incident history

---

## Maintenance Strategy

### Living Documentation Principle

> Documentation degrades unless actively maintained. We prevent degradation through automated triggers, review processes, and team culture.

---

### Maintenance Triggers

Documentation updates are triggered by specific events:

| Trigger Event           | Required Documentation Update         | Responsibility        |
| ----------------------- | ------------------------------------- | --------------------- |
| **Code Change**         | Update inline comments, JSDoc         | Developer (PR author) |
| **API Change**          | Update OpenAPI spec, package README   | Developer (PR author) |
| **Architecture Change** | Update TAD, create new ADR            | Tech Lead             |
| **New Feature**         | Update user guides, add examples      | Feature team          |
| **Bug Fix**             | Update troubleshooting section        | Developer (PR author) |
| **Incident**            | Update runbook with lessons learned   | On-call engineer      |
| **Onboarding Feedback** | Improve getting started guide         | Team lead             |
| **Deprecation**         | Add migration guide, update changelog | Package maintainer    |

---

### Review Process

**Code Review Includes Documentation Review**:

1. PR checklist enforces documentation requirements
2. Reviewer verifies documentation accuracy
3. Documentation changes reviewed with same rigor as code
4. Generated docs checked into repo (TypeDoc output)

**Quarterly Documentation Audit**:

```markdown
## Q1 2025 Documentation Audit

- [ ] Review all package READMEs for accuracy
- [ ] Check all ADRs are still relevant
- [ ] Update outdated architecture diagrams
- [ ] Verify all links resolve
- [ ] Check OpenAPI spec matches implementation
- [ ] Review user guides for clarity
- [ ] Update troubleshooting with recent issues
- [ ] Archive deprecated documentation
```

**User Feedback Loop**:

- Track most-viewed documentation pages (analytics)
- Monitor documentation-related support tickets
- Collect feedback via "Was this helpful?" buttons
- Review and act on documentation issues in GitHub

---

### Documentation Versioning

Documentation is versioned alongside code:

**Strategy**:

- Documentation lives in same repo as code (monorepo)
- Git tags include documentation at that version
- Documentation site has version switcher
- Breaking changes require migration guides

**Example**:

```
v1.0.0 → Documentation for v1.0.0 API
v2.0.0 → Documentation for v2.0.0 API + migration guide from v1 to v2
```

---

## Success Metrics

Documentation effectiveness is measured by:

### 1. Onboarding Time

**Target**: New developer productive in < 2 days

**Measurement**:

- Track time from "git clone" to first PR merged
- Survey new team members on documentation quality
- Identify gaps in onboarding documentation

---

### 2. Support Ticket Reduction

**Target**: Decrease "how do I..." questions by 50% after documentation improvements

**Measurement**:

- Track support tickets categorized as "documentation issue"
- Measure repeat questions (indicating documentation gap)
- Monitor Slack/Discord "help" channel volume

---

### 3. Self-Service Success

**Target**: 80% of developers find answers without asking teammates

**Measurement**:

- Survey developers monthly on documentation usefulness
- Track documentation site search queries
- Monitor "documentation not found" searches

---

### 4. Developer Confidence

**Target**: Developers understand _why_ things work, not just _how_

**Measurement**:

- Survey developers on understanding of architectural decisions
- Code review quality (fewer "why does this work?" questions)
- ADR adoption rate (team proactively creating ADRs)

---

### 5. Documentation Completeness

**Target**: 100% of packages have complete documentation (both audiences)

**Measurement**:

- Automated checks in CI/CD (must pass)
- JSDoc coverage percentage (aim for 90%+)
- Manual audit quarterly

---

### 6. Documentation Accuracy

**Target**: <5% of documentation is outdated or incorrect

**Measurement**:

- User-reported documentation issues
- Quarterly audit findings
- Automated link checking (0 broken links)

---

## Implementation Examples

### Example 1: @repo/auth Package Documentation

#### For Package Consumer (README.md - Top Section)

`````markdown
# @repo/auth

Authentication and authorization package using Clerk with multi-tenant support.

## Installation

\`\`\`bash
pnpm add @repo/auth
\`\`\`

## Quick Start

### Protect a Page

\`\`\`typescript
// app/dashboard/page.tsx
import { requireAuth } from '@repo/auth';

function DashboardPage() {
return <div>Protected Dashboard</div>;
}

export default requireAuth(DashboardPage);
\`\`\`

### Require Specific Role

\`\`\`typescript
import { requireRole } from '@repo/auth';

function AdminPage() {
return <div>Admin Panel</div>;
}

export default requireRole('internal')(AdminPage);
\`\`\`

### Access User Info

\`\`\`typescript
import { useAuth } from '@repo/auth';

function UserProfile() {
const { user, Organization } = useAuth();
return <div>Hello {user.name} from {Organization.name}</div>;
}
\`\`\`

## API Reference

Full API documentation: [View TypeDoc →](./docs/api/index.html)

### Key Functions

- `requireAuth(Component)` — HOC to protect routes
- `requireRole(role)(Component)` — HOC to require specific role
- `useAuth()` — Hook to access user and org context
- `checkPermission(permission)` — Check if user has permission

## Usage Guides

- [Setting up protected routes](../../../docs/guides/protected-routes.md)
- [Role-based access control (RBAC)](../../../docs/guides/rbac.md)
- [Organization context management](../../../docs/guides/org-context.md)
- [Custom permissions](../../../docs/guides/custom-permissions.md)

## Troubleshooting

### "Session not found" Error

**Cause**: Middleware not configured correctly
**Solution**: Ensure middleware is set up in `middleware.ts`:

\`\`\`typescript
// middleware.ts
import { authMiddleware } from '@repo/auth';

export default authMiddleware();
\`\`\`

### "Insufficient permissions" Error

**Cause**: User lacks required role or permission
**Solution**: Verify user role in Clerk dashboard or check RBAC configuration

---

## For Maintainers

### Architecture

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for package internal structure.

### Development Setup

1. Clone monorepo: `git clone ...`
2. Install dependencies: `pnpm install`
3. Start dev server: `pnpm dev`
4. Run tests: `pnpm test`

### Testing

See [docs/TESTING.md](./docs/TESTING.md) for testing strategy.

### Releasing

See [docs/RELEASING.md](./docs/RELEASING.md) for version management and publishing.

### Contributing

See [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) for contribution guidelines.
\`\`\`

---

#### For Package Maintainer (/docs/ARCHITECTURE.md)

````markdown
# @repo/auth Architecture

Internal architecture documentation for maintainers of the auth package.

## Overview

The auth package provides a unified authentication and authorization layer using Clerk, with custom RBAC and multi-tenant Organization support.

## Package Structure

\`\`\`
packages/auth/
├── src/
│ ├── index.ts # Public API exports
│ ├── client/ # Client-side hooks and components
│ │ ├── useAuth.ts # Auth context hook
│ │ ├── RequireAuth.tsx # Auth HOC
│ │ └── AuthProvider.tsx # Context provider
│ ├── server/ # Server-side utilities
│ │ ├── requireAuth.ts # Server-side auth middleware
│ │ ├── getAuth.ts # Get auth from request
│ │ └── permissions.ts # RBAC helpers
│ ├── middleware/ # Edge middleware
│ │ └── authMiddleware.ts # Clerk middleware wrapper
│ ├── types/ # TypeScript types
│ │ ├── user.ts
│ │ ├── Organization.ts
│ │ └── permissions.ts
│ └── utils/ # Internal utilities
│ ├── roleMapping.ts # Clerk role → app role
│ └── tokenValidation.ts
├── tests/
│ ├── client/
│ ├── server/
│ └── integration/
└── docs/
├── ARCHITECTURE.md # This file
├── TESTING.md
├── CONTRIBUTING.md
└── RELEASING.md
\`\`\`

## Design Decisions

### 1. Clerk as Auth Provider

**Decision**: Use Clerk instead of building custom auth
**Rationale**: See [ADR-006](/docs/2-technical/adr/006-clerk-authentication.md)

### 2. Custom RBAC Layer

**Decision**: Build custom RBAC on top of Clerk Organizations
**Rationale**: Clerk's built-in roles are too basic for our multi-tenant needs

**Implementation**: Map Clerk roles to application roles in `roleMapping.ts`

### 3. Edge Middleware for Auth

**Decision**: Validate sessions at edge rather than in each app
**Rationale**: Reduce latency and centralize auth logic

## Key Flows

### Authentication Flow

\`\`\`
User Login Request
↓
Clerk Hosted UI (OAuth/Magic Link/Password)
↓
Clerk issues JWT token
↓
Token stored in httpOnly secure cookie
↓
Edge middleware validates token on each request
↓
User context injected into request
↓
Available in app via useAuth() or getAuth()
\`\`\`

### Authorization Flow

\`\`\`
Protected Route Request
↓
requireAuth() HOC checks session
↓
requireRole() checks user role
↓
checkPermission() validates specific permission
↓
Access granted or 403 Forbidden
\`\`\`

## Testing Strategy

See [TESTING.md](./TESTING.md) for full details.

- Unit tests: Mock Clerk SDK
- Integration tests: Use Clerk test mode
- E2E tests: Real Clerk environment with test users

## Performance Considerations

- Session validation cached at edge (Vercel Edge Config)
- Token validation: <5ms target
- No database queries in auth middleware (use cached data)

## Security Considerations

- Tokens are httpOnly and secure cookies
- CSRF protection via signed tokens
- Rate limiting on auth endpoints
- Session expiry: 7 days default

## Future Improvements

- [ ] Add social login providers (GitHub, Google)
- [ ] Implement MFA enforcement for admin roles
- [ ] Add session management UI (view/revoke sessions)
- [ ] Support API key authentication for programmatic access
      \`\`\`

---

### Example 2: Architecture Decision Record (ADR)

```markdown
# ADR-006: Clerk for Authentication

**Status**: Accepted
**Date**: 2025-11-24
**Deciders**: Tech Lead, Security Lead
**Context**: Epic 2A.2 (Authentication Package)

## Context

We need an authentication solution for the platform that supports:

- Multi-tenant Organizations
- Social login (Google, GitHub)
- Email/password and magic link authentication
- Session management
- Webhook integration for user sync

## Decision

Use Clerk as our authentication provider.

## Alternatives Considered

### 1. NextAuth.js

- **Pros**: Open source, self-hosted, free
- **Cons**: More setup required, less polished UI, webhook support limited
- **Why Not**: More development effort, less feature-complete

### 2. Auth0

- **Pros**: Enterprise-grade, highly configurable
- **Cons**: Expensive ($240/mo for base plan), complex setup
- **Why Not**: Overkill for our needs, higher cost

### 3. Custom Auth

- **Pros**: Full control, no third-party dependency
- **Cons**: Significant development time, security risk if not done correctly
- **Why Not**: Not core to our value proposition, high risk

## Rationale

Clerk provides the best balance of:

- **Developer Experience**: Excellent DX with React SDK, pre-built components
- **Features**: Organizations, social login, magic links, webhooks out of the box
- **Cost**: Free tier covers development, $25/mo for production is reasonable
- **Security**: Managed security updates, compliance (SOC 2, GDPR)
- **Time to Market**: Faster implementation vs. building custom

## Consequences

### Positive

- Faster implementation (1 week vs. 4+ weeks for custom)
- Pre-built UI components save design/dev time
- Managed security and compliance
- Excellent webhook support for user sync

### Negative

- Vendor lock-in (mitigated by abstracting auth behind @repo/auth)
- Monthly cost at scale ($25/mo base + $0.02/MAU)
- Some customization limits (e.g., email templates)

### Neutral

- Need to maintain abstraction layer for potential future migration

## Implementation Notes

- Abstract Clerk behind `@repo/auth` package to allow future migration
- Use Clerk Organizations for multi-tenancy
- Sync users to database via webhooks
- Custom RBAC layer on top of Clerk roles

## References

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Pricing](https://clerk.com/pricing)
- [Authentication Epic: 2A.2](../../3-epics/2A.2-auth-package/EPIC.md)
  \`\`\`

---

## Integration with Roadmap

Documentation is not a single phase but a continuous practice embedded across multiple epics:

| Epic                                 | Documentation Deliverables                                                  |
| ------------------------------------ | --------------------------------------------------------------------------- |
| **P.3: Epic & Story Specifications** | EPIC.md and Story files for all epics                                       |
| **0A.1: Steel Thread**               | Initial README, deployment documentation                                    |
| **1A.1: Monorepo Foundation**        | Root README, CONTRIBUTING.md, workspace structure                           |
| **1A.4: Documentation Foundation**   | ADR template, documentation structure, this TAD section                     |
| **1A.5: CI/CD Pipeline**             | Quality gates for documentation enforcement                                 |
| **2A.x: Each Package Epic**          | Package README (both audiences), ARCHITECTURE.md, TESTING.md, API reference |
| **2B.1: Database Schema**            | Schema documentation, migration guides                                      |
| **3A.x: Application Epics**          | App README, deployment guides                                               |
| **3B.4: Documentation Application**  | Public documentation site (Nextra/Docusaurus)                               |
| **7A.1: Developer Documentation**    | Documentation completeness audit, gap filling                               |
| **7A.2: Operational Documentation**  | Runbooks, incident response procedures                                      |

### Documentation-Specific Epic: 7A (Documentation Enhancement)

**Epic 7A.1: Developer Documentation Enhancement**

**Goal**: Ensure all developer-facing documentation is complete, accurate, and accessible.

**Deliverables**:

1. Audit all package documentation for completeness
2. Fill gaps in user guides and tutorials
3. Ensure all public APIs have JSDoc
4. Update architecture diagrams to reflect current state
5. Create missing ADRs for historical decisions
6. Deploy documentation site (if not done in 3B.4)

**Epic 7A.2: Operational Documentation**

**Goal**: Create comprehensive operational runbooks for production support.

**Deliverables**:

1. Incident response procedures
2. Deployment runbooks
3. Database backup/restore procedures
4. Monitoring and alerting guides
5. Troubleshooting guides for common issues
6. On-call rotation documentation

---

## Summary

This documentation architecture ensures:

✅ **Documentation is a first-class deliverable** created alongside code
✅ **Two audiences** (maintainer and consumer) receive appropriate documentation
✅ **Multiple formats** (static site, API docs, Storybook, runbooks) for different needs
✅ **Quality gates** enforce completeness through CI/CD
✅ **Living documentation** maintained through triggers and review processes
✅ **Success metrics** measure documentation effectiveness
✅ **Continuous practice** embedded in every epic, not a single phase

By treating documentation with the same rigor as code, we ensure the platform is maintainable, scalable, and accessible to all team members.

---

**Back to**: [Technical Architecture Document (TAD)](2-tad.md)
```
````
`````
