# Story 2A.5.S1: Create @repo/ui Package Structure

> **To implement this story:** Read the Technical Requirements, create the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [UI Component Library (Generic)](./EPIC.md)
- **Depends On**: None (first story)
- **Blocks**: [S2: Configure shadcn/ui CLI and Tailwind Theme](./S2-shadcn-tailwind-setup.md), [S3: Implement Form Components](./S3-form-components.md), [S4: Implement Layout Components](./S4-layout-components.md)
- **Runs in Parallel With**: None

## User Story

**As a** Frontend Developer
**I want** a well-structured UI component package in the monorepo
**So that** I can build reusable components with proper TypeScript configuration, styling setup, and tooling

## Acceptance Criteria

- [ ] `@repo/ui` package exists at `packages/ui/` with correct directory structure
- [ ] Package has TypeScript configuration that extends workspace root config
- [ ] Package has proper package.json with correct dependencies and scripts
- [ ] Build process generates type declarations successfully
- [ ] Package can be imported by other workspace packages
- [ ] Directory structure supports shadcn/ui component organization
- [ ] Component utilities directory exists for shared helpers

## Technical Requirements

### Files to Create

| Path                                  | Purpose                                     |
| ------------------------------------- | ------------------------------------------- |
| `packages/ui/package.json`            | Package manifest with dependencies          |
| `packages/ui/tsconfig.json`           | TypeScript configuration                    |
| `packages/ui/src/index.ts`            | Package entry point (barrel export)         |
| `packages/ui/src/lib/utils.ts`        | Component utility functions (cn, etc.)      |
| `packages/ui/src/components/.gitkeep` | Placeholder for future shadcn/ui components |
| `packages/ui/README.md`               | Package documentation for consumers         |
| `packages/ui/ARCHITECTURE.md`         | Package architecture for maintainers        |

### Files to Modify

| Path                  | Changes                            |
| --------------------- | ---------------------------------- |
| `turbo.json` (root)   | Add ui package to build pipeline   |
| `pnpm-workspace.yaml` | Ensure packages/ui is in workspace |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# In packages/ui directory
pnpm add react react-dom
pnpm add class-variance-authority clsx tailwind-merge
pnpm add -D typescript @types/react @types/react-dom
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.

| Setting           | Requirement                                   | TAD Reference                                                                            |
| ----------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Package name      | `@repo/ui`                                    | [ADR-001: Monorepo Naming](/docs/2-technical/adr/001-monorepo-turborepo.md)              |
| TypeScript config | Extends workspace root with React support     | [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture)             |
| Build output      | ESM format with type declarations             | [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture)             |
| Component exports | Individual component exports for tree-shaking | [TAD: UI Components Architecture](/docs/2-technical/2-tad.md#ui-components-architecture) |

**Configuration Rationale**: This package structure follows monorepo best practices from ADR-001 while supporting shadcn/ui's copy-paste model. The `src/components/` directory will house shadcn/ui components, while `src/lib/` provides shared utilities needed across components.

## Test Requirements

### Manual Verification

- [ ] **Package Import**: Import `@repo/ui` from another workspace package - should resolve without errors
- [ ] **TypeScript Compilation**: Run `pnpm build` in ui package - should complete without type errors
- [ ] **Workspace Resolution**: Verify package appears in `pnpm list` output from root
- [ ] **Utility Function**: Import and use `cn()` utility from `@repo/ui/lib/utils` - should merge classes correctly

### Automated Tests

- [ ] Unit: Not required for this story - infrastructure setup only

### Integration Tests

N/A - Infrastructure setup story; integration tests deferred to S6 (Add Accessibility and Error Boundary Integration) and S7 (Configure Storybook and Write Documentation)

### Verification Commands

```bash
# Verify package structure
ls -la packages/ui/src

# Build the package
cd packages/ui && pnpm build

# Verify package exports
cd packages/ui && node -e "console.log(require('./package.json'))"

# Check workspace linkage
pnpm list --filter @repo/ui --depth 0

# Test utility function
cd packages/ui && node -e "const {cn} = require('./dist/lib/utils'); console.log(cn('foo', 'bar'))"
```

## Implementation Notes

### Implementation Sequence

1. **Create Package Directory Structure**
   - Create `packages/ui/` directory
   - Create `src/` subdirectory
   - Create `src/components/` subdirectory for future shadcn/ui components
   - Create `src/lib/` subdirectory for utility functions

2. **Configure Package Manifest**
   - Create `package.json` with `@repo/ui` name
   - Add core dependencies (react, react-dom, class-variance-authority, clsx, tailwind-merge)
   - Add dev dependencies (typescript, @types/react, @types/react-dom)
   - Define build scripts and exports configuration

3. **Set Up TypeScript**
   - Create `tsconfig.json` extending workspace root config
   - Configure paths for component and lib imports
   - Enable React JSX support and declaration generation

4. **Create Initial Utility Files**
   - Create `src/lib/utils.ts` with `cn()` helper function
   - Create empty `src/index.ts` barrel export
   - Add `.gitkeep` to `src/components/` directory

5. **Create Documentation**
   - Create README.md with consumer-facing usage documentation
   - Create ARCHITECTURE.md with maintainer-facing technical details

6. **Update Monorepo Configuration**
   - Update `turbo.json` to include ui package in build pipeline
   - Verify pnpm workspace configuration includes packages/ui

### Key Concepts

- **shadcn/ui Model**: Components are copied into the project rather than installed as dependencies, enabling full customization
- **Tree-Shakeable Exports**: Each component exported individually allows bundlers to exclude unused components
- **Component Utilities**: The `cn()` function merges Tailwind classes intelligently, handling conflicts and conditional classes
- **Barrel Export**: Index files re-export components for cleaner imports across applications

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.

Reference the TAD for package structure patterns:

- [ADR-001: Monorepo Package Structure](/docs/2-technical/adr/001-monorepo-turborepo.md#package-structure)
- [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture)
- [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling)

Key pattern notes for this story:

- Use `@repo/*` naming convention for all internal packages
- TypeScript config should extend workspace root and enable React JSX
- Package.json should include proper exports map for subpath imports (e.g., `@repo/ui/button`)
- The `cn()` utility combines `clsx` and `tailwind-merge` for optimal class handling

### Troubleshooting

| Issue                                         | Cause                              | Solution                                                 |
| --------------------------------------------- | ---------------------------------- | -------------------------------------------------------- |
| Package not found by other workspace packages | Not listed in pnpm-workspace.yaml  | Add `packages/ui` to workspace config                    |
| TypeScript errors during build                | Missing React types or JSX config  | Ensure @types/react installed and jsx set to "react-jsx" |
| Import errors for subpath exports             | Incorrect package.json exports map | Add proper exports configuration for components          |
| Tailwind classes not merging correctly        | Missing tailwind-merge dependency  | Verify tailwind-merge is installed and cn() uses it      |

### Reference Materials

- [shadcn/ui Installation Guide](https://ui.shadcn.com/docs/installation)
- [Turborepo Package Installation and Usage](https://turbo.build/repo/docs/handbook/sharing-code/internal-packages)
- [class-variance-authority Documentation](https://cva.style/docs)
- [Tailwind Merge Documentation](https://github.com/dcastil/tailwind-merge)

## Estimated Effort

**Size**: S (2-4h)

## Architecture Decisions

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md) - Defines package structure and naming conventions
- [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling) - Specifies shadcn/ui and Tailwind CSS usage

### Story-Specific Decisions

#### AD-2A.5.S1.1: Component Directory Organization

**Scope**: Story-specific (affects initial directory layout)

**Decision**: Create separate `src/components/` and `src/lib/` directories from the start, with components directory initially containing only `.gitkeep`

**Rationale**:

- Establishes clear separation between components and utilities
- Matches shadcn/ui's expected project structure
- Prevents future refactoring when components are added in S2-S5
- Makes it obvious where to place new components vs. utility functions

**Consequences**:

- Initial directory structure is ready for shadcn/ui CLI usage
- Developers have clear guidance on file placement
- Minor overhead of empty directory until S2

**Alternatives Considered**:

- **Create components directory in S2** - Rejected because it would require modifying package structure after initial setup and break shadcn/ui CLI expectations

#### AD-2A.5.S1.2: Dual Documentation Strategy

**Scope**: Story-specific (documentation structure)

**Decision**: Create both README.md (consumer-focused) and ARCHITECTURE.md (maintainer-focused) from the start

**Rationale**:

- Follows TAD documentation pyramid guidelines for two audiences per package
- README.md targets developers who use the components in applications
- ARCHITECTURE.md targets developers who maintain and extend the package
- Establishes documentation patterns for component-heavy packages early

**Consequences**:

- Clear separation of concerns in documentation
- Easier onboarding for both consumers and maintainers
- Requires maintaining two documentation files

**Alternatives Considered**:

- **Single README.md** - Rejected because it mixes consumer and maintainer concerns, violating TAD documentation principles

## Out of Scope

The following items are explicitly NOT part of this story:

- **shadcn/ui CLI configuration** - Handled in S2 (Configure shadcn/ui CLI and Tailwind Theme)
- **Tailwind CSS setup** - Handled in S2 (Configure shadcn/ui CLI and Tailwind Theme)
- **Actual component implementations** - Handled in S3-S5 (Form, Layout, Feedback components)
- **Storybook configuration** - Handled in S7 (Configure Storybook and Write Documentation)
- **Accessibility testing setup** - Handled in S6 (Add Accessibility and Error Boundary Integration)
- **Error boundary integration** - Handled in S6 (Add Accessibility and Error Boundary Integration)

## Dependencies on Other Stories

### Depends On (Must Complete First)

None - This is the first story in the epic

### Enables (Unblocks These Stories)

- **S2**: Configure shadcn/ui CLI and Tailwind Theme - Requires package structure to exist
- **S3**: Implement Form Components - Requires package and build configuration
- **S4**: Implement Layout Components - Requires package and build configuration

## References

### Epic & TAD References

- [EPIC.md: Overview](./EPIC.md#overview)
- [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling)
- [TAD: UI Components Architecture](/docs/2-technical/2-tad.md#ui-components-architecture)
- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)

### External Documentation

- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
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

- [ ] README.md created with consumer usage instructions
- [ ] ARCHITECTURE.md created with maintainer technical details
- [ ] Package.json has correct metadata (name, description, version)
- [ ] Utility functions have JSDoc comments

### Git Hygiene

- [ ] Conventional commit message used
- [ ] No unrelated changes included
- [ ] Commit message follows pattern: `feat(2A.5.S1): create @repo/ui package structure`

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
