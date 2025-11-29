# Story 1A.4.S11: Package Documentation Aggregation

> **To implement this story:** Create a build script that copies package README files into `/docs/packages/` so they appear on the documentation site.

## Context

- **Epic**: [Documentation Foundation](./EPIC.md)
- **Depends On**: [S2](./S2-docs-site.md)
- **Blocks**: None
- **Runs in Parallel With**: S7, S8, S9, S10

## User Story

**As a** developer browsing the documentation site
**I want** package README files to be automatically included in the docs site
**So that** I can find all documentation in one place without navigating to GitHub or individual packages

## Acceptance Criteria

- [x] Build script copies all `packages/*/README.md` files to `docs/packages/`
- [x] Copied files are renamed appropriately (e.g., `packages/testing/README.md` → `docs/packages/testing.md`)
- [x] Script runs automatically before docs site build via Turborepo
- [x] Package documentation appears in docs site navigation under `/docs/packages/`
- [x] Script handles packages without README files gracefully (skip with warning)
- [x] Script cleans stale files from `docs/packages/` before copying
- [x] Turbo cache invalidates when package READMEs change
- [x] Generated files are gitignored (not committed to repo)

## Technical Requirements

### Files to Create

| Path                                | Purpose                                              |
| ----------------------------------- | ---------------------------------------------------- |
| `scripts/aggregate-package-docs.ts` | Script to copy package READMEs to docs directory     |
| `docs/packages/.gitignore`          | Ignore generated files, keep directory in git        |
| `docs/packages/_meta.json`          | Nextra navigation configuration for packages section |

### Files to Modify

| Path           | Change                                                    |
| -------------- | --------------------------------------------------------- |
| `turbo.json`   | Add `aggregate-docs` task, update docs build dependencies |
| `package.json` | Add `aggregate-docs` script at workspace root             |

### Dependencies

No new npm dependencies required. Script uses Node.js built-in `fs` and `path` modules.

### Script Specification

```typescript
// scripts/aggregate-package-docs.ts
//
// 1. Find all packages with README.md files
// 2. Clean docs/packages/ directory (except _meta.json and .gitignore)
// 3. Copy each README.md to docs/packages/{package-name}.md
// 4. Add frontmatter with title derived from package name
// 5. Log results: copied files, skipped packages, any errors
```

### Turbo Configuration

```json
{
  "tasks": {
    "aggregate-docs": {
      "inputs": ["packages/*/README.md"],
      "outputs": ["docs/packages/*.md", "!docs/packages/_meta.json"]
    },
    "docs#build": {
      "dependsOn": ["aggregate-docs", "^build"],
      "inputs": ["app/**", "*.tsx", "*.ts", "*.mjs", "../../docs/**/*.md", "../../docs/**/*.mdx"],
      "outputs": [".next/**", "!.next/cache/**"]
    }
  }
}
```

### Nextra Navigation

Create `docs/packages/_meta.json` to configure sidebar:

```json
{
  "*": {
    "title": "Package: {filename}"
  }
}
```

## Test Requirements

### Automated Tests

```bash
# Run aggregation script
pnpm aggregate-docs

# Verify files created
ls docs/packages/

# Build docs to verify integration
pnpm --filter docs build
```

### Manual Verification

- [ ] Run `pnpm aggregate-docs` and verify files appear in `docs/packages/`
- [ ] Verify docs site builds successfully with aggregated content
- [ ] Navigate to `/docs/packages/testing` and verify content matches `packages/testing/README.md`
- [ ] Delete a package README, run script, verify corresponding docs file is removed
- [ ] Run `pnpm turbo run build --filter=docs` and verify aggregation runs first

## Implementation Notes

### Implementation Sequence

1. **Create script directory**: Add `scripts/` if not exists
2. **Write aggregation script**: Create `aggregate-package-docs.ts`
3. **Configure gitignore**: Add `docs/packages/.gitignore`
4. **Add Nextra meta**: Create `docs/packages/_meta.json`
5. **Update turbo.json**: Add task and dependency
6. **Add npm script**: Add to root `package.json`
7. **Test integration**: Run full build pipeline

### Frontmatter Generation

The script should add frontmatter to copied files:

```markdown
---
title: "@repo/testing"
description: "Auto-generated from packages/testing/README.md"
---

[Original README content here]
```

### Edge Cases

| Scenario                                        | Behavior                                       |
| ----------------------------------------------- | ---------------------------------------------- |
| Package without README                          | Skip with console warning                      |
| README with existing frontmatter                | Preserve original frontmatter, add source note |
| Nested package (e.g., `packages/ui/components`) | Only process direct children of `packages/`    |
| Empty README                                    | Skip with console warning                      |

## Estimated Effort

**Size**: S (3h)

## Architecture Decisions

### Story-Specific Decisions

#### AD-1A.4.S11.1: Generated Files Not Committed

**Scope**: Story-specific

**Decision**: Generated package docs are gitignored and regenerated on build

**Rationale**:

- Avoids duplication in git history
- Ensures docs always reflect current package state
- Simplifies maintenance (single source of truth)

**Alternatives Considered**:

- Commit generated files - Rejected due to sync issues and bloated history
- Symlinks - Rejected due to Nextra/build tool compatibility concerns

#### AD-1A.4.S11.2: Script in TypeScript

**Scope**: Story-specific

**Decision**: Write build script in TypeScript using tsx

**Rationale**: Type safety, consistent with codebase, better IDE support

**Alternatives Considered**:

- Bash script - Rejected for complexity and cross-platform concerns
- Node.js without TypeScript - Rejected for consistency

## Out of Scope

- **Automatic API documentation** - TypeDoc integration deferred to package epics
- **Custom transformations** - No markdown transformations beyond frontmatter
- **Nested package support** - Only direct children of `packages/`
- **Changelog aggregation** - Only README files initially

## Dependencies on Other Stories

### Depends On

- **S2**: [Configure Documentation Site Framework](./S2-docs-site.md) - Provides Nextra configuration

### Enables

- Future package documentation enhancements
- Unified documentation search across packages

## References

- [EPIC.md](./EPIC.md)
- [TAD: Documentation Architecture](/docs/2-technical/2-tad-documentation.md)
- [Documentation Strategy](/docs/1-product/4-documentation-strategy.md)
- [Nextra Directory Structure](https://nextra.site/docs/guide/organize-files)

## Verification Checklist

- [x] S2 completed and docs site builds locally
- [x] Script creates files in `docs/packages/`
- [x] Turbo runs aggregation before docs build
- [x] Package docs appear on docs site
- [x] Generated files are gitignored
- [x] All acceptance criteria met
- [x] Conventional commit message used

## Status

- **State**: Complete
- **Started**: 2025-11-29
- **Completed**: 2025-11-29
- **PR**: -

## Completion Notes

### Summary

Implemented package documentation aggregation script that copies README files from `packages/*` to `docs/packages/` with frontmatter injection. The script integrates with Turborepo as a root-level task (`//#aggregate-docs`) that runs automatically before docs site builds. Generated markdown files are gitignored to maintain a single source of truth.

### Test Results

| Test       | Command                       | Result           |
| ---------- | ----------------------------- | ---------------- |
| Lint       | `pnpm lint`                   | Pass             |
| Types      | `pnpm type-check`             | Pass             |
| Unit Tests | `pnpm test`                   | N/A (script)     |
| Build      | `pnpm docs:build`             | Pass (239 pages) |
| Turbo      | `turbo run //#aggregate-docs` | Pass             |

### Files Changed

All files per technical requirements:

- `scripts/aggregate-package-docs.ts` - Aggregation script with frontmatter injection
- `docs/packages/.gitignore` - Ignores generated `*.md` files
- `docs/packages/_meta.json` - Nextra navigation config
- `turbo.json` - Added `//#aggregate-docs` root task with docs#build dependency
- `package.json` - Added `aggregate-docs` script, `tsx` devDependency

### Known Issues

None.

### Lessons Learned

- Use `//#task-name` syntax in Turbo for root-level tasks that should run once (not per-package)
- `import.meta.dirname` is not available in all Node.js/tsx contexts; use `fileURLToPath(import.meta.url)` with `path.dirname()` for compatibility
