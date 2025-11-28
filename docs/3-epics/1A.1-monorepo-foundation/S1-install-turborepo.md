# Story 1A.1.S1: Install and Configure Turborepo

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Monorepo Foundation](./EPIC.md)
- **Depends On**: None (first story in epic)
- **Blocks**: [S2: Configure pnpm Workspaces](./S2-pnpm-workspaces.md), [S3: Migrate Next.js App](./S3-migrate-nextjs-app.md), [S4: Turbo Pipeline](./S4-turbo-pipeline.md)
- **Runs in Parallel With**: None

## User Story

**As a** developer
**I want** Turborepo installed and configured in the repository
**So that** I have a build system foundation for managing multiple apps and packages with intelligent caching

## Acceptance Criteria

- [x] Turborepo is installed as a dev dependency in the root package.json
- [x] `turbo.json` exists at repository root with valid configuration
- [x] Running `pnpm turbo --version` outputs the installed Turborepo version
- [x] Root `package.json` has `turbo` scripts for common tasks (`build`, `dev`, `lint`, `test`, `type-check`, `clean`)
- [x] Turborepo daemon starts successfully when running turbo commands
- [x] `.turbo` directory is added to `.gitignore`

## Technical Requirements

### Files to Create

| Path         | Purpose                                                         |
| ------------ | --------------------------------------------------------------- |
| `turbo.json` | Turborepo configuration with task definitions and caching rules |

### Files to Modify

| Path           | Changes                                     |
| -------------- | ------------------------------------------- |
| `package.json` | Add turbo dev dependency; add turbo scripts |
| `.gitignore`   | Add `.turbo` directory to ignore list       |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
pnpm add -D turbo
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting              | Requirement                                                                        | TAD Reference                                                              |
| -------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `$schema`            | Include JSON schema for validation                                                 | [TAD: Monorepo Structure](/docs/2-technical/2-tad.md#monorepo-structure)   |
| `tasks`              | Define placeholder tasks for `build`, `dev`, `lint`, `test`, `type-check`, `clean` | [TAD: System Architecture](/docs/2-technical/2-tad.md#system-architecture) |
| `globalDependencies` | Include `.env*` files for cache invalidation                                       | [ADR-001](/docs/2-technical/adr/001-monorepo-turborepo.md)                 |

**Configuration Rationale**:

- The `turbo.json` file defines the task graph and caching behaviour for the monorepo
- Placeholder task definitions allow incremental configuration as workspaces are added
- Global dependencies ensure environment changes invalidate relevant caches

## Test Requirements

### Manual Verification

- [ ] **Turbo Version**: Run `pnpm turbo --version` and confirm version output matches canonical-versions.md constraint
- [ ] **Turbo Help**: Run `pnpm turbo --help` to verify CLI is functional
- [ ] **Config Validation**: Verify `turbo.json` passes JSON schema validation (no IDE errors)

### Automated Tests

N/A - Infrastructure setup story; no runtime code to test.

### Integration Tests

N/A - Infrastructure setup story; no runtime integration to test.

### Verification Commands

```bash
# Verify turbo is installed
pnpm turbo --version

# Verify turbo.json is valid JSON
node -e "require('./turbo.json')"

# Verify .turbo is in .gitignore
grep -q ".turbo" .gitignore && echo "✓ .turbo in .gitignore"

# Verify turbo scripts exist in package.json
node -e "const pkg = require('./package.json'); console.log('Scripts:', Object.keys(pkg.scripts || {}).filter(s => s.includes('turbo') || ['build','dev','lint','test','type-check','clean'].includes(s)).join(', '))"
```

## Implementation Notes

### Implementation Sequence

1. **Install Turborepo**
   - Add turbo as dev dependency to root package.json
   - Verify installation with version check

2. **Create turbo.json Configuration**
   - Create file at repository root
   - Include JSON schema reference
   - Define placeholder tasks with basic caching configuration
   - Configure global dependencies for environment files

3. **Update Root package.json Scripts**
   - Add `turbo` prefix scripts for build, dev, lint, test, type-check, clean
   - Scripts will be refined in S4 (Pipeline Configuration)

4. **Update .gitignore**
   - Add `.turbo` directory to prevent cache artifacts in version control

### Key Concepts

- **Turborepo**: Build system for JavaScript/TypeScript monorepos with intelligent caching
- **turbo.json**: Configuration file defining tasks, dependencies, and cache behaviour
- **Task Graph**: Turborepo automatically determines task execution order based on dependencies

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Monorepo Structure](/docs/2-technical/2-tad.md#monorepo-structure)
- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)

Key pattern notes for this story:

- Tasks are initially defined without outputs (caching configured in S4)
- Persistent tasks like `dev` should not be cached
- Environment variables affecting builds must be in `globalDependencies`

### Troubleshooting

**Issue**: `turbo: command not found` after installation

- **Cause**: pnpm binaries not in PATH or installation incomplete
- **Solution**: Run `pnpm install` again; ensure `node_modules/.bin` is accessible

**Issue**: `turbo.json` schema validation errors in IDE

- **Cause**: Invalid configuration structure or missing required fields
- **Solution**: Verify `$schema` URL is correct; check JSON syntax

**Issue**: Turbo daemon fails to start

- **Cause**: Port conflict or permissions issue
- **Solution**: Kill existing turbo processes (`pkill -f turbo`); check for port 3456 conflicts

### Reference Materials

- [Turborepo Getting Started](https://turbo.build/repo/docs/getting-started)
- [turbo.json Reference](https://turbo.build/repo/docs/reference/configuration)
- [Turborepo Caching](https://turbo.build/repo/docs/core-concepts/caching)

## Estimated Effort

**Size**: M (4-8h)

**Breakdown**:

- Research & planning: 1h
- Install & configure Turborepo: 1.5h
- Create turbo.json with task definitions: 1.5h
- Update package.json scripts: 0.5h
- Testing & verification: 1h
- Documentation updates: 0.5h

## Architecture Decisions

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md) - Establishes Turborepo as the build system
- [TAD: Technology Stack](/docs/2-technical/2-tad.md#technology-stack) - Defines Turborepo version constraint

### Story-Specific Decisions

No story-specific decisions required - all decisions for this story are covered by ADR-001 and the TAD.

## Out of Scope

The following items are explicitly NOT part of this story:

- **pnpm Workspace Configuration** - Handled in S2 (pnpm Workspaces)
- **Remote Caching Setup** - Deferred to S5 (Remote Caching)
- **Pipeline Task Dependencies** - Deferred to S4 (Turbo Pipeline); S1 creates placeholder tasks only
- **Cache Output Configuration** - Deferred to S4 (Turbo Pipeline)
- **Application Migration** - Deferred to S3 (Migrate Next.js App)

## Dependencies on Other Stories

### Depends On (Must Complete First)

- None - this is the first story in the epic

### Enables (Unblocks These Stories)

- **S2**: pnpm Workspaces - Can proceed with workspace configuration after Turborepo is installed
- **S3**: Migrate Next.js App - Requires turbo.json to exist for workspace integration
- **S4**: Turbo Pipeline - Will configure task dependencies and caching on the foundation created here

## References

### Epic & TAD References

- [EPIC.md: Overview](./EPIC.md#overview)
- [EPIC.md: Technical Constraints](./EPIC.md#technical-constraints)
- [TAD: Monorepo Structure](/docs/2-technical/2-tad.md#monorepo-structure)
- [TAD: Technology Stack](/docs/2-technical/2-tad.md#technology-stack)

### ADR References

- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)

### External Documentation

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [turbo.json Configuration Reference](https://turbo.build/repo/docs/reference/configuration)

## Verification Checklist

### Pre-Verification

- [x] All dependent stories completed (N/A - first story)
- [x] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [x] Required credentials/access available (N/A - no external services)

### Implementation Quality

- [x] All acceptance criteria met
- [x] `turbo.json` follows schema and is valid JSON
- [x] No lint errors in configuration files
- [x] Scripts added to package.json are functional

### Documentation

- [x] Code comments where logic isn't self-evident (N/A - config files)
- [x] README updated (if applicable) - defer to S7
- [x] Architecture decisions documented (covered by ADR-001)

### Git Hygiene

- [ ] Conventional commit message used
- [ ] No unrelated changes included
- [ ] PR description complete

## Status

- **State**: Complete
- **PR**: -
- **Completed**: 2025-11-28
