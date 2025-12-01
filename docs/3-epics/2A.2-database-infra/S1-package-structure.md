# Story 2A.2.S1: Create @repo/database Package Structure

> **To implement this story:** Read the Technical Requirements, create the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Database Infrastructure](./EPIC.md)
- **Depends On**: None (first story)
- **Blocks**: [S2: Configure Drizzle ORM and Client](./S2-drizzle-config.md), [S3: Implement Connection Utilities](./S3-connection-utilities.md)
- **Runs in Parallel With**: None

## User Story

**As a** Backend Developer
**I want** a well-structured database package in the monorepo
**So that** I can build database functionality with proper TypeScript configuration, linting, and tooling

## Acceptance Criteria

- [ ] `@repo/database` package exists at `packages/database/` with correct directory structure
- [ ] Package has TypeScript configuration that extends workspace root config
- [ ] Package has proper package.json with correct dependencies and scripts
- [ ] Build process generates type declarations successfully
- [ ] Package can be imported by other workspace packages
- [ ] Directory structure matches ADR-005 specification

## Technical Requirements

### Files to Create

| Path                                    | Purpose                                |
| --------------------------------------- | -------------------------------------- |
| `packages/database/package.json`        | Package manifest with dependencies     |
| `packages/database/tsconfig.json`       | TypeScript configuration               |
| `packages/database/src/index.ts`        | Package entry point (barrel export)    |
| `packages/database/src/schema/index.ts` | Schema barrel export (initially empty) |
| `packages/database/README.md`           | Package documentation                  |

### Files to Modify

| Path                              | Changes                                  |
| --------------------------------- | ---------------------------------------- |
| `turbo.json` (root)               | Add database package to build pipeline   |
| `pnpm-workspace.yaml` (if needed) | Ensure packages/database is in workspace |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# In packages/database directory
pnpm add drizzle-orm @neondatabase/serverless
pnpm add -D drizzle-kit typescript
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.

| Setting           | Requirement                             | TAD Reference                                                                |
| ----------------- | --------------------------------------- | ---------------------------------------------------------------------------- |
| Package name      | `@repo/database`                        | [ADR-001: Monorepo Naming](/docs/2-technical/adr/001-monorepo-turborepo.md)  |
| TypeScript config | Extends workspace root with strict mode | [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture) |
| Build output      | ESM format with type declarations       | [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture) |

**Configuration Rationale**: This package structure follows monorepo best practices from ADR-001, ensuring consistency with other workspace packages while maintaining database-specific configuration needs.

## Test Requirements

### Manual Verification

- [ ] **Package Import**: Import `@repo/database` from another workspace package (e.g., web app) - should resolve without errors
- [ ] **TypeScript Compilation**: Run `pnpm build` in database package - should complete without type errors
- [ ] **Workspace Resolution**: Verify package appears in `pnpm list` output from root

### Automated Tests

- [ ] Unit: Not required for this story - infrastructure setup only

### Integration Tests

N/A - Infrastructure setup story; integration tests deferred to S7 (Write Tests for Database Package)

### Verification Commands

```bash
# Verify package structure
ls -la packages/database/src

# Build the package
cd packages/database && pnpm build

# Verify package exports
cd packages/database && node -e "console.log(require('./package.json'))"

# Check workspace linkage
pnpm list --filter @repo/database --depth 0
```

## Implementation Notes

### Implementation Sequence

1. **Create Package Directory Structure**
   - Create `packages/database/` directory
   - Create `src/` subdirectory
   - Create `src/schema/` subdirectory for future schema files

2. **Configure Package Manifest**
   - Create `package.json` with `@repo/database` name
   - Add core dependencies (drizzle-orm, @neondatabase/serverless)
   - Add dev dependencies (drizzle-kit, typescript)
   - Define build scripts

3. **Set Up TypeScript**
   - Create `tsconfig.json` extending workspace root config
   - Configure paths for schema imports
   - Enable strict mode and declaration generation

4. **Create Initial Files**
   - Create empty `src/index.ts` barrel export
   - Create empty `src/schema/index.ts` for future schemas
   - Create README.md with basic usage documentation

5. **Update Monorepo Configuration**
   - Update `turbo.json` to include database package in build pipeline
   - Verify pnpm workspace configuration includes packages/database

### Key Concepts

- **Monorepo Package**: A reusable package within the Turborepo monorepo that can be imported by apps and other packages
- **Barrel Export**: An index.ts file that re-exports all public APIs from a package/directory for cleaner imports
- **Workspace Protocol**: pnpm's `workspace:*` protocol for referencing local packages within the monorepo

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.

Reference the TAD for package structure patterns:

- [ADR-001: Monorepo Package Structure](/docs/2-technical/adr/001-monorepo-turborepo.md#package-structure)
- [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture)

Key pattern notes for this story:

- Use `@repo/*` naming convention for all internal packages
- TypeScript config should extend workspace root for consistency
- Package.json should include `main`, `module`, and `types` fields for proper resolution

### Troubleshooting

| Issue                                         | Cause                              | Solution                                                       |
| --------------------------------------------- | ---------------------------------- | -------------------------------------------------------------- |
| Package not found by other workspace packages | Not listed in pnpm-workspace.yaml  | Add `packages/database` to workspace config                    |
| TypeScript errors during build                | Missing or incorrect tsconfig.json | Ensure extends workspace root config and includes proper paths |
| Dependency resolution errors                  | Incorrect workspace protocol usage | Use `workspace:*` for local package references                 |

### Reference Materials

- [Turborepo Package Installation and Usage](https://turbo.build/repo/docs/handbook/sharing-code/internal-packages)
- [pnpm Workspace Protocol](https://pnpm.io/workspaces#workspace-protocol-workspace)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)

## Estimated Effort

**Size**: S (2-4h)

## Architecture Decisions

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md) - Defines package structure and naming conventions
- [ADR-005: Drizzle as ORM](/docs/2-technical/adr/005-drizzle-orm.md#configuration) - Specifies database package structure

### Story-Specific Decisions

#### AD-2A.2.S1.1: Schema Directory Structure

**Scope**: Story-specific (affects initial directory layout)

**Decision**: Create `src/schema/` subdirectory for schema files from the start, even though it will be empty until S2

**Rationale**:

- Establishes clear separation of concerns (schema definitions vs. utilities)
- Prevents future refactoring when schemas are added in S2
- Matches the structure defined in ADR-005

**Consequences**:

- Initial directory structure is ready for schema files
- Developers know where to place schema definitions
- Minor overhead of empty directory until S2

**Alternatives Considered**:

- **Create schema directory in S2** - Rejected because it would require modifying package structure after initial setup

## Out of Scope

The following items are explicitly NOT part of this story:

- **Drizzle ORM configuration** - Handled in S2 (Configure Drizzle ORM and Client)
- **Database connection logic** - Handled in S3 (Implement Connection Utilities)
- **Schema definitions** - Handled in S2 and later stories
- **Migration infrastructure** - Handled in S4 (Set Up Migration Infrastructure)
- **Utility functions** - Handled in S6 (Implement Generic Utility Functions)

## Dependencies on Other Stories

### Depends On (Must Complete First)

None - This is the first story in the epic

### Enables (Unblocks These Stories)

- **S2**: Configure Drizzle ORM and Client - Requires package structure to exist
- **S3**: Implement Connection Utilities - Requires package and TypeScript configuration

## References

### Epic & TAD References

- [EPIC.md: Overview](./EPIC.md#overview)
- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)
- [ADR-005: Drizzle as ORM](/docs/2-technical/adr/005-drizzle-orm.md#configuration)

### External Documentation

- [Turborepo Handbook: Internal Packages](https://turbo.build/repo/docs/handbook/sharing-code/internal-packages)
- [pnpm Workspaces](https://pnpm.io/workspaces)

## Verification Checklist

### Pre-Verification

- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] pnpm and Node.js installed at specified versions
- [ ] Monorepo root dependencies installed

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors
- [ ] Types compile successfully
- [ ] Package builds without errors
- [ ] Package can be imported by other workspace packages

### Documentation

- [ ] README.md created with usage instructions
- [ ] Package.json has correct metadata (name, description, version)

### Git Hygiene

- [ ] Conventional commit message used
- [ ] No unrelated changes included
- [ ] Commit message follows pattern: `feat(2A.2.S1): create @repo/database package structure`

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
