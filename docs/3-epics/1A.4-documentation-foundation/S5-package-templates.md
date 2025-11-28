# Story 1A.4.S5: Create Package Documentation Templates

> **To implement this story:** Read the Technical Requirements, create the specified template files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Documentation Foundation](./EPIC.md)
- **Depends On**: [S1](./S1-docs-structure.md)
- **Blocks**: [S7](./S7-docs-quality-gates.md)
- **Runs in Parallel With**: [S2](./S2-docs-site.md), [S3](./S3-adr-setup.md), [S4](./S4-root-docs.md)

## User Story

**As a** package maintainer
**I want** standardized templates for package documentation
**So that** I can quickly create complete documentation serving both maintainers and consumers with consistent structure and quality

## Acceptance Criteria

- [ ] Package README template exists with sections for both consumers and maintainers
- [ ] ARCHITECTURE.md template created for package internal structure documentation
- [ ] CONTRIBUTING.md template created for package-specific contribution guidelines
- [ ] TESTING.md template created for package testing strategy documentation
- [ ] All templates follow Two Audiences Strategy from TAD
- [ ] Templates are stored in `docs/0-process/references/` for easy reuse
- [ ] Each template includes clear instructions and placeholder sections
- [ ] Templates reference relevant TAD sections for implementation patterns

## Technical Requirements

### Files to Create

| Path | Purpose |
|------|---------|
| `docs/0-process/references/package-readme-template.md` | Template for package README (consumer + maintainer sections) |
| `docs/0-process/references/package-architecture-template.md` | Template for package ARCHITECTURE.md (maintainer documentation) |
| `docs/0-process/references/package-contributing-template.md` | Template for package CONTRIBUTING.md (maintainer workflow) |
| `docs/0-process/references/package-testing-template.md` | Template for package TESTING.md (testing strategy) |

### Files to Modify

None - All new template files

### Dependencies

> **Version Reference**: No external dependencies for template creation

### Configuration Details

> **Note**: Templates provide structure and guidance, not code. They reference TAD sections for implementation patterns.

Templates must implement the Two Audiences Strategy per [TAD: Two Audiences Strategy](/docs/2-technical/2-tad-documentation.md#two-audiences-strategy):

| Template Section | Audience | Purpose |
|------------------|----------|---------|
| README (top sections) | Package Consumer | Installation, quick start, API overview, usage examples |
| README ("For Maintainers" section) | Package Maintainer | Links to internal docs, development setup |
| ARCHITECTURE.md | Package Maintainer | Internal structure, design decisions, key flows |
| CONTRIBUTING.md | Package Maintainer | How to contribute, PR process, release workflow |
| TESTING.md | Package Maintainer | Testing approach, running tests, coverage requirements |

**Template Requirements**:
- Clear section headers with descriptive purposes
- Placeholder text showing expected content types
- Links to relevant TAD sections for patterns
- Examples where helpful (but not full implementations)
- Instructions that guide without prescribing

## Test Requirements

### Manual Verification

- [ ] **Template Completeness**: Each template has all required sections with clear placeholders
- [ ] **Two Audiences Distinction**: README template clearly separates consumer vs. maintainer content
- [ ] **TAD References**: Templates link to relevant TAD sections for implementation patterns
- [ ] **Usability**: Templates provide enough guidance to create complete documentation without being overly prescriptive

### Automated Tests

N/A - Template content validation is manual for this story

### Integration Tests

N/A - Documentation template story; no runtime integration to test

### Verification Commands

```bash
# Verify all template files exist
test -f docs/0-process/references/package-readme-template.md && \
test -f docs/0-process/references/package-architecture-template.md && \
test -f docs/0-process/references/package-contributing-template.md && \
test -f docs/0-process/references/package-testing-template.md && \
echo "✓ All package documentation templates created"

# Verify templates reference TAD
grep -q "TAD:" docs/0-process/references/package-readme-template.md && \
grep -q "TAD:" docs/0-process/references/package-architecture-template.md && \
echo "✓ Templates reference TAD for implementation patterns"

# Verify README template has both audience sections
grep -q "## Installation" docs/0-process/references/package-readme-template.md && \
grep -q "## For Maintainers" docs/0-process/references/package-readme-template.md && \
echo "✓ README template serves both audiences"
```

## Implementation Notes

### Implementation Sequence

1. **Create README Template**
   - Consumer sections: Installation, Quick Start, API Reference, Usage Guides, Troubleshooting
   - Maintainer section: Links to ARCHITECTURE.md, CONTRIBUTING.md, TESTING.md, development setup

2. **Create ARCHITECTURE.md Template**
   - Package structure overview
   - Design decisions section
   - Key flows documentation
   - Performance and security considerations

3. **Create CONTRIBUTING.md Template**
   - Development setup instructions
   - Contribution workflow
   - PR process and requirements
   - Release process

4. **Create TESTING.md Template**
   - Testing philosophy
   - Running tests
   - Writing new tests
   - Coverage requirements

### Key Concepts

- **Two Audiences Strategy**: Every package serves both maintainers (who build it) and consumers (who use it)
- **Documentation Pyramid Level 3 (HOW)**: Package documentation explains how to implement, extend, and operate
- **Template vs. Prescription**: Templates guide structure without dictating content, allowing flexibility per package needs

### Common Patterns

Reference the TAD for package documentation patterns:

- [TAD: Two Audiences Strategy](/docs/2-technical/2-tad-documentation.md#two-audiences-strategy)
- [TAD: Package Documentation Examples](/docs/2-technical/2-tad-documentation.md#implementation-examples)

Key pattern notes for this story:

- README top section for consumers, bottom "For Maintainers" section
- ARCHITECTURE.md includes internal structure, not public API
- Link between README and detailed docs (ARCHITECTURE, CONTRIBUTING, TESTING)
- Use code examples sparingly - reference TAD for full implementations

### Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Templates too prescriptive | Trying to cover all package types | Keep templates flexible with required vs. optional sections |
| Missing TAD references | Created in isolation | Review TAD documentation sections and add relevant links |
| Consumer vs. maintainer sections unclear | Poor labeling | Use clear section headers and audience callouts |

### Reference Materials

- [TAD: Documentation Architecture](/docs/2-technical/2-tad-documentation.md)
- [Package Documentation Examples in TAD](/docs/2-technical/2-tad-documentation.md#implementation-examples)
- [Conventional Commits](https://www.conventionalcommits.org/)

## Estimated Effort

**Size**: S (3h)

## Architecture Decisions

### Consolidated Decisions (reference only)

- [TAD: Two Audiences Strategy](/docs/2-technical/2-tad-documentation.md#two-audiences-strategy) - Every package documentation serves both maintainers and consumers
- [TAD: Documentation Structure](/docs/2-technical/2-tad-documentation.md#documentation-structure) - Package documentation location and organization
- [TAD: Documentation Pyramid](/docs/2-technical/2-tad-documentation.md#documentation-layers) - Package docs are Level 3 (HOW)

### Story-Specific Decisions

#### AD-1A.4.S5.1: Single README for Both Audiences

**Scope**: Story-specific (applies to README template only)

**Decision**: Use a single README.md file with consumer content at the top and maintainer content in a "For Maintainers" section at the bottom, rather than separate README files

**Rationale**:
- Consumers typically need quick reference (installation, usage) and scroll minimally
- Maintainers need comprehensive information and will scroll to find it
- Single file is easier to maintain than multiple README variants
- GitHub displays README.md by default - ensures consumers see appropriate content first
- Clear section separation prevents confusion about intended audience

**Consequences**:
- Longer README files, but well-organized with clear section headers
- Maintainer content readily accessible without navigating to `/docs` subdirectory
- Single source of truth prevents content duplication/divergence

**Alternatives Considered**:
- **Separate README.md and README-DEV.md**: Clearer separation but GitHub only displays one - Rejected because confusing for discoverability
- **README.md (consumer) with link to docs/**: Cleaner but extra navigation - Rejected because maintains already viewing package root
- **All content in docs/ subdirectory**: Complete separation but poor discoverability - Rejected because README.md is conventional entry point

## Out of Scope

The following items are explicitly NOT part of this story:

- **Populated Package Documentation** - Templates are reusable patterns, not actual package docs; populated during package creation (Epic 2A.x)
- **TypeDoc API Generation** - Deferred to package epics when public APIs exist (Epic 2A.x)
- **Storybook Component Documentation** - Deferred to Epic 2A.5 (UI Component Library)
- **Release Process Documentation (RELEASING.md)** - Deferred to Epic 2A.1 (Shared Package Infrastructure) when versioning is configured
- **Package-Specific Examples** - Each package will customize templates with their own examples
- **Documentation Quality Enforcement** - Deferred to S7 (Documentation Quality Gates)

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1**: [Create Documentation Directory Structure](./S1-docs-structure.md) - Requires `docs/0-process/references/` directory for template storage

### Enables (Unblocks These Stories)

- **S7**: [Integrate Documentation Quality Gates](./S7-docs-quality-gates.md) - Templates define the documentation standards to enforce in quality gates

## References

- [EPIC.md](./EPIC.md)
- [TAD: Documentation Architecture](/docs/2-technical/2-tad-documentation.md)
- [TAD: Two Audiences Strategy](/docs/2-technical/2-tad-documentation.md#two-audiences-strategy)
- [TAD: Package Documentation Structure](/docs/2-technical/2-tad-documentation.md#documentation-structure)
- [TAD: Implementation Examples](/docs/2-technical/2-tad-documentation.md#implementation-examples)

## Verification Checklist

- [ ] S1 completed (dependency)
- [ ] All acceptance criteria met
- [ ] All four template files created
- [ ] Templates include both required and optional sections
- [ ] README template clearly separates consumer and maintainer content
- [ ] All templates reference relevant TAD sections
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed (Markdown formatting)
- [ ] No lint errors (markdownlint passes)
- [ ] Conventional commit message used
- [ ] PR description complete

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
