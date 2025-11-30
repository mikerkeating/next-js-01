# Story 1A.4.S12: App Documentation Aggregation

> **To implement this story:** Extend the aggregation script to copy app README files into `/docs/apps/` so they appear on the documentation site.

## Context

- **Epic**: [Documentation Foundation](./EPIC.md)
- **Depends On**: [S2](./S2-docs-site.md), [S11](./S11-package-docs-aggregation.md)
- **Blocks**: None
- **Runs in Parallel With**: S7, S8, S9, S10

## User Story

**As a** developer browsing the documentation site
**I want** app README files to be automatically included in the docs site
**So that** I can find all documentation in one place without navigating to GitHub or individual app directories

## Acceptance Criteria

- [x] Build script copies all `apps/*/README.md` files to `docs/apps/`
- [x] Copied files are renamed appropriately (e.g., `apps/routing/README.md` → `docs/apps/routing.md`)
- [x] Script runs automatically before docs site build via Turborepo
- [x] App documentation appears in docs site navigation under `/docs/apps/`
- [x] Script handles apps without README files gracefully (skip with warning)
- [x] Script cleans stale files from `docs/apps/` before copying
- [x] Turbo cache invalidates when app READMEs change
- [x] Generated files are gitignored (not committed to repo)

## Technical Requirements

### Files to Create

| Path                   | Purpose                                          |
| ---------------------- | ------------------------------------------------ |
| `docs/apps/.gitignore` | Ignore generated files, keep directory in git    |
| `docs/apps/_meta.json` | Nextra navigation configuration for apps section |

### Files to Modify

| Path                                | Change                                      |
| ----------------------------------- | ------------------------------------------- |
| `scripts/aggregate-package-docs.ts` | Extend to also aggregate app READMEs        |
| `turbo.json`                        | Update inputs to include `apps/*/README.md` |

### Dependencies

No new npm dependencies required. Extends existing aggregation script.

### Script Specification

```typescript
// Extend scripts/aggregate-package-docs.ts
//
// 1. Find all apps with README.md files (apps/*/README.md)
// 2. Clean docs/apps/ directory (except _meta.json and .gitignore)
// 3. Copy each README.md to docs/apps/{app-name}.md
// 4. Add frontmatter with title derived from app name
// 5. Log results: copied files, skipped apps, any errors
```

### Turbo Configuration Update

```json
{
  "tasks": {
    "//#docs-aggregates": {
      "inputs": ["packages/*/README.md", "apps/*/README.md"],
      "outputs": [
        "docs/packages/*.md",
        "docs/apps/*.md",
        "!docs/packages/_meta.json",
        "!docs/apps/_meta.json"
      ]
    }
  }
}
```

### Nextra Navigation

Create `docs/apps/_meta.json` to configure sidebar:

```json
{
  "*": {
    "title": "App: {filename}"
  }
}
```

## Test Requirements

### Automated Tests

```bash
# Run aggregation script
pnpm docs-aggregates

# Verify files created
ls docs/apps/

# Build docs to verify integration
pnpm --filter docs build
```

### Manual Verification

- [ ] Run `pnpm docs-aggregates` and verify files appear in `docs/apps/`
- [ ] Verify docs site builds successfully with aggregated content
- [ ] Navigate to `/docs/apps/routing` and verify content matches `apps/routing/README.md`
- [ ] Delete an app README, run script, verify corresponding docs file is removed
- [ ] Run `pnpm turbo run build --filter=docs` and verify aggregation runs first

## Implementation Notes

### Implementation Sequence

1. **Create gitignore**: Add `docs/apps/.gitignore`
2. **Add Nextra meta**: Create `docs/apps/_meta.json`
3. **Extend aggregation script**: Update `aggregate-package-docs.ts` to handle apps
4. **Update turbo.json**: Add app inputs to docs-aggregates task
5. **Test integration**: Run full build pipeline

### Frontmatter Generation

The script should add frontmatter to copied files:

```markdown
---
title: "routing"
description: "Auto-generated from apps/routing/README.md"
---

[Original README content here]
```

### Edge Cases

| Scenario                            | Behavior                                       |
| ----------------------------------- | ---------------------------------------------- |
| App without README                  | Skip with console warning                      |
| README with existing frontmatter    | Preserve original frontmatter, add source note |
| Nested app (e.g., `apps/web/admin`) | Only process direct children of `apps/`        |
| Empty README                        | Skip with console warning                      |
| Docs app README                     | Include (self-referential but useful)          |

## Estimated Effort

**Size**: S (2h)

## Architecture Decisions

### Story-Specific Decisions

#### AD-1A.4.S12.1: Extend Existing Script

**Scope**: Story-specific

**Decision**: Extend `aggregate-package-docs.ts` rather than creating a new script

**Rationale**:

- DRY principle - reuse existing logic for frontmatter injection, file cleaning, etc.
- Single Turbo task handles all documentation aggregation
- Consistent behavior and error handling across packages and apps

**Alternatives Considered**:

- Separate script for apps - Rejected to avoid duplication and maintain consistency
- Generic script with config file - Over-engineering for current needs

#### AD-1A.4.S12.2: App Title Format

**Scope**: Story-specific

**Decision**: Use simple app name as title (e.g., "routing") rather than scoped name

**Rationale**: Apps don't follow npm package naming conventions; simple names are clearer

**Alternatives Considered**:

- Scoped format (@app/routing) - Rejected as non-standard for apps
- Full path (apps/routing) - Rejected as redundant with navigation context

## Out of Scope

- **Automatic API documentation** - Deferred to app-specific epics
- **Custom transformations** - No markdown transformations beyond frontmatter
- **Nested app support** - Only direct children of `apps/`
- **Changelog aggregation** - Only README files initially

## Dependencies on Other Stories

### Depends On

- **S2**: [Configure Documentation Site Framework](./S2-docs-site.md) - Provides Nextra configuration
- **S11**: [Package Documentation Aggregation](./S11-package-docs-aggregation.md) - Provides base aggregation script

### Enables

- Future app documentation enhancements
- Unified documentation search across apps

## References

- [EPIC.md](./EPIC.md)
- [S11: Package Documentation Aggregation](./S11-package-docs-aggregation.md)
- [TAD: Documentation Architecture](/docs/2-technical/2-tad-documentation.md)
- [Documentation Strategy](/docs/1-product/4-documentation-strategy.md)
- [Nextra Directory Structure](https://nextra.site/docs/guide/organize-files)

## Verification Checklist

- [x] S2 completed and docs site builds locally
- [x] S11 completed and package aggregation working
- [x] Script creates files in `docs/apps/`
- [x] Turbo runs aggregation before docs build
- [x] App docs appear on docs site
- [x] Generated files are gitignored
- [x] All acceptance criteria met
- [x] Conventional commit message used

## Status

- **State**: Complete
- **Started**: 2025-11-30
- **Completed**: 2025-11-30
- **PR**: -

## Completion Notes

### Summary

Extended the existing `aggregate-package-docs.ts` script to also aggregate app README files to `docs/apps/`. The script was refactored to use generic functions that handle both packages and apps, following the DRY principle. Created supporting files (`docs/apps/.gitignore` and `docs/apps/_meta.json`) for proper gitignore and Nextra navigation.

### Test Results

| Test   | Command                              | Result               |
| ------ | ------------------------------------ | -------------------- |
| Lint   | `pnpm lint`                          | Pass                 |
| Types  | `pnpm type-check`                    | Pass                 |
| Build  | `pnpm turbo run build --filter=docs` | Pass                 |
| Script | `pnpm docs-aggregates`               | Pass (2 apps copied) |

### Files Changed

Planned files only:

- `docs/apps/.gitignore` - Created to ignore generated markdown files
- `docs/apps/_meta.json` - Created for Nextra navigation configuration
- `scripts/aggregate-package-docs.ts` - Extended with generic functions to handle both packages and apps
- `turbo.json` - Updated inputs to include `apps/*/README.md`

### Known Issues

None.

### Lessons Learned

- Refactoring to generic functions early made it easy to extend the script for apps
- The existing package aggregation pattern translated directly to app aggregation with minimal changes
