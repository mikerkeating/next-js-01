# Story 1A.4.S8: Document Documentation Foundation Setup

> **To implement this story:** Create the README.md for the docs app explaining the documentation setup, configuration, and contribution workflow.

## Context

- **Epic**: [Documentation Foundation](./EPIC.md)
- **Depends On**: [S2](./S2-docs-site.md), [S7](./S7-docs-quality-gates.md)
- **Blocks**: None
- **Runs in Parallel With**: None

## User Story

**As a** developer or maintainer
**I want** comprehensive documentation explaining how the documentation system is set up and how to contribute to it
**So that** I can understand, maintain, and extend the documentation infrastructure

## Acceptance Criteria

- [x] README.md in `apps/docs` explains the documentation site architecture
- [x] Developer can understand how to add new documentation by reading the README
- [x] README documents the symlink setup between `apps/docs/content` and `/docs`
- [x] Development and build commands are documented
- [x] Configuration files and their purposes are explained
- [x] Troubleshooting section covers common issues
- [x] README follows the two-audience pattern (consumer section for adding docs, maintainer section for site maintenance)

## Technical Requirements

### Files to Create

| Path                  | Purpose                                             |
| --------------------- | --------------------------------------------------- |
| `apps/docs/README.md` | Comprehensive documentation for the docs site setup |

### Files to Modify

None - this story only creates documentation.

### Dependencies

None - documentation only.

### Configuration Details

Document the following existing configuration:

| Configuration File | Purpose                        | Key Settings                           |
| ------------------ | ------------------------------ | -------------------------------------- |
| `next.config.mjs`  | Nextra framework configuration | Content directory, search, MDX         |
| `app/layout.tsx`   | Theme configuration            | Navbar, footer, dark mode              |
| `tsconfig.json`    | TypeScript configuration       | Path aliases, strict mode              |
| `content` symlink  | Links to `/docs` directory     | Enables Nextra to render monorepo docs |

## Test Requirements

### Manual Verification

- [ ] **README Completeness**: All sections from acceptance criteria are present
- [ ] **Quick Start Works**: Following the Quick Start section successfully runs the docs site
- [ ] **Adding Docs Works**: Following the "Adding Documentation" section creates working new pages
- [ ] **Links Valid**: All internal links in README resolve correctly

### Automated Tests

N/A - Documentation file; quality verified via markdown linting.

### Integration Tests

N/A - Documentation creation story; no integration points.

### Verification Commands

```bash
# Verify README exists and has content
test -f apps/docs/README.md && wc -l apps/docs/README.md

# Verify markdown lint passes
pnpm markdownlint "apps/docs/README.md"

# Verify docs site still builds with README present
pnpm --filter docs build
```

## Implementation Notes

### Key Concepts

- **Two Audiences**: README should serve both doc authors (how to add content) and site maintainers (how the system works)
- **Symlink Architecture**: The `content` symlink bridges Nextra's expected structure with monorepo `/docs` location
- **Documentation Pyramid**: Reference the four-layer structure (WHY/WHAT/HOW/CONTEXT)

### README Structure

The README should include these sections:

1. **Overview**: What the docs site does, tech stack (Nextra, Next.js)
2. **Quick Start**: Get the docs site running locally
3. **Adding Documentation**: How to add new pages, where files go
4. **Directory Structure**: Explain the symlink and content organization
5. **Configuration**: Key config files and what they control
6. **Development Commands**: All available npm scripts
7. **For Maintainers**: Architecture details, upgrading Nextra, troubleshooting
8. **Troubleshooting**: Common issues and solutions

### Common Patterns

Reference the TAD for documentation patterns:

- [TAD: Two Audiences Strategy](/docs/2-technical/2-tad-documentation.md#two-audiences-strategy) - Pattern for structuring README with both consumer and maintainer sections
- [TAD: Documentation Structure](/docs/2-technical/2-tad-documentation.md#documentation-structure) - Four-layer documentation pyramid

### Troubleshooting

| Issue                           | Cause                                      | Solution                                  |
| ------------------------------- | ------------------------------------------ | ----------------------------------------- |
| Symlink doesn't work on Windows | Windows symlinks require admin or dev mode | Document Windows-specific setup in README |
| README not linting              | Markdown lint rules violations             | Fix issues per markdownlint output        |

### Reference Materials

- [Nextra Documentation](https://nextra.site/)
- [TAD: Documentation Architecture](/docs/2-technical/2-tad-documentation.md)
- [S2: Configure Documentation Site Framework](./S2-docs-site.md) - Implementation details

## Estimated Effort

**Size**: S (2-3h)

## Architecture Decisions

### Consolidated Decisions (reference only)

- [TAD: Two Audiences Strategy](/docs/2-technical/2-tad-documentation.md#two-audiences-strategy) - README structure pattern
- [AD-1A.4.S2.1: Documentation Framework Selection](./S2-docs-site.md#ad-1a4s21-documentation-framework-selection) - Nextra choice

### Story-Specific Decisions

None - this story documents existing decisions rather than making new ones.

## Out of Scope

- **Updating Nextra Configuration** - This story documents; changes belong in separate stories
- **Creating New Documentation Content** - Only creates the README explaining how to create content
- **Automating Documentation Generation** - TypeDoc/OpenAPI generation deferred to package epics
- **Documentation Site Redesign** - Any visual or structural changes to the docs site itself

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S2**: [Configure Documentation Site Framework](./S2-docs-site.md) - Requires docs site to be set up before documenting it
- **S7**: [Integrate Documentation Quality Gates](./S7-docs-quality-gates.md) - Quality gates should be in place to document them

### Enables (Unblocks These Stories)

None - this is the final story in the epic.

## References

- [EPIC.md: Overview](./EPIC.md)
- [TAD: Documentation Architecture](/docs/2-technical/2-tad-documentation.md)
- [S2: Configure Documentation Site Framework](./S2-docs-site.md)
- [Nextra Documentation](https://nextra.site/)

## Verification Checklist

### Pre-Verification

- [x] S2 (Documentation Site Framework) completed
- [x] S7 (Documentation Quality Gates) completed
- [x] Docs site builds and runs locally

### Implementation Quality

- [x] All acceptance criteria met
- [x] README follows two-audience pattern
- [x] All commands in README verified working
- [x] Markdown lint passes
- [x] Internal links verified

### Documentation

- [x] README is self-documenting (explains its own structure)

### Git Hygiene

- [x] Conventional commit message used (e.g., `docs(apps/docs): add README documenting docs site setup`)
- [x] No unrelated changes included

## Status

- **State**: Complete
- **Completed**: 2025-11-29
- **PR**: -

## Completion Notes

### Summary

Created comprehensive README.md (340 lines) for the docs app following the two-audience pattern. The README documents the Nextra 4 documentation site architecture, provides a quick start guide for adding documentation, explains the symlink architecture between `apps/docs/content` and `/docs`, and includes a detailed troubleshooting section for maintainers.

### Test Results

| Test     | Command                         | Result           |
| -------- | ------------------------------- | ---------------- |
| Lint     | `pnpm --filter docs lint`       | Pass             |
| Types    | `pnpm --filter docs type-check` | Pass             |
| Build    | `pnpm --filter docs build`      | Pass (236 pages) |
| Markdown | `pnpm markdownlint-cli2`        | Pass (0 errors)  |

### Files Changed

**Created:**

- `apps/docs/README.md` - 340-line comprehensive documentation following two-audience pattern

### Known Issues

None.

### Lessons Learned

- The existing README was a placeholder file with no meaningful content, so this was effectively a full creation rather than an update
- The symlink architecture is well-suited for documenting in a README because developers need to understand where to create content files (in `/docs`, not `apps/docs/content`)
