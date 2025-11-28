# Documentation Strategy

## Core Principle

**Documentation is a product deliverable, not an afterthought.** Every package, application, and decision must have documentation created alongside code, not after.

---

## Documentation Layers

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

---

## Two Documentation Audiences per Package

Every package serves two distinct audiences with different needs:

### Audience 1: Package Maintainer (Internal Developer)

**Needs:**

- Understanding the package's internals
- How to add features or fix bugs
- Testing strategy
- Build and release process

**Documentation:**

- `/packages/{name}/README.md` — Maintainer section
- `/packages/{name}/docs/ARCHITECTURE.md` — Internal structure
- `/packages/{name}/docs/CONTRIBUTING.md` — How to contribute
- Inline code comments explaining _why_ (not what)
- Test documentation

**Example (for @repo/auth):**

```
packages/auth/
├── README.md                  # Overview, installation, usage, THEN maintenance
├── docs/
│   ├── ARCHITECTURE.md        # How auth package is structured
│   ├── TESTING.md            # How to test auth flows
│   └── RELEASING.md          # How to version and publish
└── src/
    └── *.ts (with JSDoc)     # Code-level documentation
```

### Audience 2: Package Consumer (Other Developers)

**Needs:**

- How to install and configure
- API reference (what functions/components exist)
- Usage examples
- Common patterns and recipes
- Troubleshooting

**Documentation:**

- `/packages/{name}/README.md` — Consumer section (top of file)
- Generated API docs (TypeDoc)
- Storybook (for UI components)
- `/docs/guides/{package-name}.md` — Usage guide in main docs site

**Example (for @repo/auth consumer):**

```markdown
# @repo/auth

Quick start, installation, basic usage examples here.

## API Reference

[Link to generated TypeDoc]

## Usage Examples

- Setting up protected routes
- Role-based access control
- Custom permissions

## Troubleshooting

Common issues and solutions
```

---

## Documentation Structure

```
/
├── docs/                              # Central documentation site
│   ├── prd.md                         # Product requirements
│   ├── tad.md                         # Technical architecture
│   │
│   ├── adr/                           # Architecture decisions
│   │   ├── template.md
│   │   ├── 001-turborepo.md
│   │   ├── 002-pnpm.md
│   │   └── ...
│   │
│   ├── epics/                         # Epic and story specifications
│   │   ├── 0A.1-steel-thread/
│   │   │   ├── EPIC.md
│   │   │   ├── S1-create-app.md
│   │   │   └── S2-configure-vercel.md
│   │   └── ...
│   │
│   ├── architecture/                  # System architecture
│   │   ├── overview.md
│   │   ├── data-model.md
│   │   ├── deployment.md
│   │   └── diagrams/
│   │
│   ├── guides/                        # Developer guides
│   │   ├── getting-started.md
│   │   ├── using-auth-package.md
│   │   ├── creating-ui-components.md
│   │   ├── database-migrations.md
│   │   └── testing-strategy.md
│   │
│   ├── api/                           # API documentation
│   │   ├── overview.md
│   │   ├── openapi.yaml              # Generated from code
│   │   └── endpoints/
│   │
│   └── operations/                    # Operational docs
│       ├── deployment.md
│       ├── monitoring.md
│       ├── incident-response.md
│       └── runbooks/
│
├── packages/                          # Package-specific docs
│   ├── auth/
│   │   ├── README.md                  # Consumer + Maintainer
│   │   └── docs/
│   │       ├── ARCHITECTURE.md        # Maintainer only
│   │       └── TESTING.md
│   │
│   ├── ui/
│   │   ├── README.md
│   │   └── docs/
│   │       ├── ARCHITECTURE.md
│   │       └── DESIGN-SYSTEM.md
│   │
│   └── database/
│       ├── README.md
│       └── docs/
│           ├── SCHEMA.md
│           └── MIGRATIONS.md
│
├── apps/                              # Application-specific docs
│   ├── routing/
│   │   └── README.md                  # Routes, env vars, deployment
│   │
│   └── api/
│       └── README.md                  # Endpoints, auth, rate limits
│
└── README.md                          # Project overview, quick start
```

---

## Documentation Ownership by Epic Phase

| Phase     | Documentation Created                           | Owner               |
| --------- | ----------------------------------------------- | ------------------- |
| **P**     | PRD, TAD, ADRs, Epic/Story specs                | Tech Lead + PM      |
| **0A-1A** | README, CONTRIBUTING, architecture diagrams     | Platform team       |
| **2A**    | Package READMEs (both audiences), API reference | Package maintainers |
| **2B**    | Product domain docs, data model docs            | Product team        |
| **3A-3B** | App READMEs, API docs (OpenAPI), user guides    | App teams           |
| **4A-8A** | Operational runbooks, incident procedures       | DevOps + all teams  |

---

## Documentation Generation vs Hand-Written

| Type                      | Method                    | Tool                 |
| ------------------------- | ------------------------- | -------------------- |
| **API Reference**         | Generated from TypeScript | TypeDoc              |
| **Component Library**     | Generated from Storybook  | Storybook            |
| **API Endpoints**         | Generated from code       | OpenAPI/Swagger      |
| **Database Schema**       | Generated from Drizzle    | Drizzle Kit + custom |
| **Architecture Diagrams** | Hand-drawn (maintained)   | Mermaid, Excalidraw  |
| **Guides & How-Tos**      | Hand-written              | Markdown             |
| **ADRs**                  | Hand-written              | Markdown             |
| **Runbooks**              | Hand-written              | Markdown             |

---

## Documentation Quality Gates

Built into CI/CD (Epic 1A.5):

```
GitHub Actions Check: "docs"
├── All packages have README.md
├── All public functions have JSDoc
├── All API endpoints in OpenAPI spec
├── All markdown links resolve
├── No broken internal references
└── Spelling/grammar check (optional)
```

---

## Documentation Delivery Formats

| Audience                  | Format                | Tool                      |
| ------------------------- | --------------------- | ------------------------- |
| **Developers (internal)** | Static site           | Nextra / Docusaurus       |
| **API Consumers**         | Interactive docs      | Swagger UI                |
| **Component Users**       | Interactive showcase  | Storybook (deployed)      |
| **End Users**             | Marketing site + docs | Next.js app (3B.4)        |
| **Operations**            | Wiki / Notion         | Runbooks in repo + Notion |

---

## Example: @repo/auth Package Documentation

### For Package Consumer (top of README.md)

```markdown
# @repo/auth

Authentication and authorization package using Clerk.

## Installation

`pnpm add @repo/auth`

## Quick Start

[3 code examples showing common patterns]

## API Reference

[Link to generated TypeDoc]

## Guides

- Setting up protected routes
- Role-based access control
- Organisation context

## Troubleshooting

[Common issues]
```

### For Package Maintainer (further down README.md + separate docs)

```markdown
## For Maintainers

### Architecture

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

### Development

1. Clone monorepo
2. Install dependencies: `pnpm install`
3. Run tests: `pnpm test`

### Testing

See [docs/TESTING.md](./docs/TESTING.md)

### Releasing

See [docs/RELEASING.md](./docs/RELEASING.md)
```

---

## Documentation Maintenance Strategy

**Living Documentation Principle:** Documentation degrades unless actively maintained.

### Triggers for Documentation Updates

| Trigger             | Required Update                      |
| ------------------- | ------------------------------------ |
| Code change         | Update inline comments, JSDoc        |
| API change          | Update OpenAPI spec, package README  |
| Architecture change | Update TAD, create new ADR           |
| New feature         | Update user guides, add examples     |
| Incident            | Update runbooks, add troubleshooting |
| Onboarding feedback | Improve getting started guide        |

### Review Process

- **Code review includes docs review** — PR checklist includes "Documentation updated?"
- **Quarterly docs audit** — Tech Lead reviews all docs for accuracy
- **User feedback loop** — Track which docs are most viewed, which have issues

---

## Success Metrics

Documentation effectiveness measured by:

1. **Onboarding time** — New developer productive in < 2 days
2. **Support tickets** — Decrease in "how do I..." questions
3. **Self-service** — Developers find answers without asking
4. **Confidence** — Developers know _why_ things work, not just _how_

---

## Key Principles Summary

1. **Two audiences per package** — Consumer (how to use) vs Maintainer (how it works)
2. **Documentation as code** — Lives in repo, versioned with code
3. **Generate when possible** — TypeDoc, Storybook, OpenAPI from code
4. **Write what must be written** — ADRs, guides, runbooks by humans
5. **Quality gates enforce completeness** — CI fails if docs missing
6. **Maintain continuously** — Not a "Phase 7" deliverable, but ongoing

---

## Integration with Roadmap

This documentation strategy is implemented across multiple epics:

- **Epic 1A.4**: Documentation Foundation (structure, templates, ADRs)
- **Epic P.3**: Epic & Story Specifications (EPIC.md, Story files)
- **Epic 2A.x**: Each package epic includes documentation requirements
- **Epic 3B.4**: Documentation Application (public-facing docs site)
- **Epic 7A.1**: Developer Documentation Enhancement (completeness audit)
- **Epic 7A.2**: Operational Documentation (runbooks, procedures)

Documentation is not a single phase but a continuous practice embedded in every epic.
