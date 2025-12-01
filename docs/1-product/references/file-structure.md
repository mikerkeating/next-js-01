# File Structure

This document describes the complete documentation directory structure for the monorepo.

## Documentation Pyramid

The documentation is organized into four layers following the Documentation Pyramid pattern:

| Layer                     | Purpose                                  | Primary Audience                     |
| ------------------------- | ---------------------------------------- | ------------------------------------ |
| **WHY** (Strategic)       | Strategic decisions, architecture vision | Tech leads, architects               |
| **WHAT** (Product)        | Product requirements, features           | Product managers, stakeholders       |
| **HOW** (Implementation)  | Technical guides, API reference          | Developers (maintainers & consumers) |
| **CONTEXT** (Development) | Epic/story specs, onboarding             | New team members, contributors       |

## Complete Directory Structure

```
/docs/
├── 0-process/                          # WHY: Development process
│   ├── 0-process.md                    # Process overview
│   ├── references/                     # Process templates and guides
│   │   ├── story-details-template.md   # Story specification template
│   │   ├── story-dev-prompt.md         # Story implementation guide
│   │   ├── story-completion-guide.md   # Completion checklist guide
│   │   ├── epic-details-template.md    # Epic specification template
│   │   └── ...
│   └── ...
│
├── 1-product/                          # WHAT: Product documentation
│   ├── 1-prd.md                        # Product Requirements Document
│   ├── 3-roadmap.md                    # Epic delivery roadmap
│   ├── 4-documentation-strategy.md     # Documentation strategy
│   ├── references/                     # Product references
│   │   └── file-structure.md           # This file
│   └── ...
│
├── 2-technical/                        # HOW: Technical documentation
│   ├── 2-tad.md                        # Technical Architecture Document
│   ├── 2-tad-*.md                      # Detailed TAD sections
│   ├── adr/                            # Architecture Decision Records
│   │   ├── 001-monorepo-turborepo.md
│   │   ├── 002-pnpm-package-manager.md
│   │   ├── 003-nextjs-framework.md
│   │   └── ...
│   ├── references/                     # Technical references
│   │   ├── coding-standards.md         # Code quality rules
│   │   ├── canonical-versions.md       # Dependency versions
│   │   └── commit-guidelines.md        # Commit message format
│   └── ...
│
├── 3-epics/                            # CONTEXT: Epic & story specifications
│   ├── 0A.1-steel-thread/
│   │   ├── EPIC.md                     # Epic overview, context, story index
│   │   ├── S1-create-nextjs-app.md
│   │   ├── S2-configure-vercel.md
│   │   └── ...
│   ├── 1A.1-monorepo-foundation/
│   │   ├── EPIC.md
│   │   └── ...
│   ├── 1A.4-documentation-foundation/
│   │   ├── EPIC.md
│   │   ├── S1-docs-structure.md        # This story
│   │   └── ...
│   └── ...
│
├── architecture/                       # HOW: Architecture documentation
│   ├── .gitkeep                        # Placeholder for future content
│   └── (future: overview.md, data-model.md, deployment.md, diagrams/)
│
├── guides/                             # HOW: Developer guides
│   ├── .gitkeep                        # Placeholder for future content
│   └── (future: getting-started.md, testing-strategy.md, etc.)
│
└── api/                                # WHAT: API documentation
    ├── .gitkeep                        # Placeholder for future content
    └── (future: overview.md, openapi.yaml, endpoints/)
```

## Directory Purposes

### `/docs/0-process/`

Development process documentation including workflow guides, templates, and references for epic/story creation and implementation.

### `/docs/1-product/`

Product-level documentation including PRD, roadmap, and product strategy documents.

### `/docs/2-technical/`

Technical documentation including TAD (Technical Architecture Document), ADRs (Architecture Decision Records), and technical references like coding standards.

### `/docs/2-technical/adr/`

Architecture Decision Records documenting significant technical decisions with context, rationale, and consequences.

### `/docs/3-epics/`

Epic and story specifications organized by epic ID. Each epic has its own directory with an EPIC.md overview and individual story files (S1, S2, etc.).

### `/docs/architecture/`

High-level architecture documentation including system overview, data models, deployment architecture, and diagrams.

### `/docs/guides/`

Developer guides and tutorials for common tasks like getting started, testing, deployment, and package usage.

### `/docs/api/`

API documentation including OpenAPI/Swagger specifications and endpoint documentation.

## Package Documentation

In addition to `/docs/`, each package has its own documentation:

```
/packages/{name}/
├── README.md                           # Consumer + Maintainer documentation
└── docs/
    ├── ARCHITECTURE.md                 # Internal structure (maintainer)
    ├── TESTING.md                      # Testing guide (maintainer)
    └── api/                            # Generated API docs (consumer)
```

## References

- [TAD: Documentation Architecture](/docs/2-technical/2-tad-documentation.md)
- [Documentation Strategy](/docs/1-product/4-documentation-strategy.md)
