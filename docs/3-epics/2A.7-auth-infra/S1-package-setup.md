# Story 2A.7.S1: Package Setup and Clerk SDK Installation

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Auth Infrastructure](./EPIC.md)
- **Depends On**: None (first story)
- **Blocks**: [S2](./S2-clerk-provider.md), [S3](./S3-auth-hooks.md), [S4](./S4-protected-route.md), [S5](./S5-webhook-handler.md), [S6](./S6-user-sync.md)
- **Runs in Parallel With**: None (foundation story)

## User Story

**As a** Platform Developer
**I want** a configured `@repo/auth` package with Clerk SDK installed
**So that** subsequent stories can build authentication features on a solid foundation

## Acceptance Criteria

- [ ] `@repo/auth` package directory structure created following monorepo conventions
- [ ] `@clerk/nextjs` installed at version specified in canonical-versions.md
- [ ] `svix` package installed for webhook signature verification
- [ ] Package exports configured with TypeScript type definitions
- [ ] Package builds successfully with `pnpm build`
- [ ] Package can be imported by other monorepo packages
- [ ] Environment variable types defined for Clerk configuration
- [ ] README.md created with package overview and usage guidelines

## Technical Requirements

### Files to Create

| Path                                      | Purpose                                     |
| ----------------------------------------- | ------------------------------------------- |
| `packages/auth/package.json`              | Package manifest and dependencies           |
| `packages/auth/tsconfig.json`             | TypeScript configuration                    |
| `packages/auth/src/index.ts`              | Package entry point and exports             |
| `packages/auth/src/env.ts`                | Environment variable validation             |
| `packages/auth/src/types.ts`              | TypeScript type definitions                 |
| `packages/auth/README.md`                 | Package documentation                       |
| `packages/auth/.eslintrc.js`              | ESLint configuration (extends root)         |
| `packages/auth/vitest.config.ts`          | Vitest configuration for unit tests         |
| `packages/auth/tsup.config.ts`            | Build configuration for package compilation |

### Files to Modify

| Path                     | Changes                                                |
| ------------------------ | ------------------------------------------------------ |
| `turbo.json`             | Add `@repo/auth#build` and `@repo/auth#test` tasks    |
| `pnpm-workspace.yaml`    | Verify `packages/*` includes new auth package          |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# Navigate to auth package
cd packages/auth

# Core dependencies
pnpm add @clerk/nextjs svix zod

# Development dependencies
pnpm add -D typescript @types/node tsup vitest @vitest/ui @vitest/coverage-v8
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting                   | Requirement                                                                  | TAD Reference                                                          |
| ------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `package.json` name       | Must be `@repo/auth`                                                         | [ADR-001: Monorepo](/docs/2-technical/adr/001-monorepo-turborepo.md)  |
| `package.json` exports    | Export `./client`, `./server`, `./types`, `./env` subpaths                   | [TAD: Package Structure](/docs/2-technical/2-tad.md)                   |
| `tsconfig.json` extends   | Extend from `@repo/typescript-config/base.json`                              | [ADR-001: Monorepo](/docs/2-technical/adr/001-monorepo-turborepo.md)  |
| Environment validation    | Use `@t3-oss/env-nextjs` with Zod schemas                                    | [TAD: Environment Variables](/docs/2-technical/2-tad.md)               |
| Build output              | ESM and CJS formats via tsup                                                 | [TAD: Package Build](/docs/2-technical/2-tad.md)                       |
| Clerk environment vars    | Define types for `NEXT_PUBLIC_CLERK_*` and `CLERK_SECRET_KEY` variables     | [ADR-006: Clerk Auth](/docs/2-technical/adr/006-clerk-authentication.md) |

**Configuration Rationale**: The package structure follows monorepo conventions for consistent build, test, and lint patterns. Environment variable validation prevents runtime errors from missing configuration. Dual format output (ESM/CJS) ensures compatibility with all consuming applications.

For complete configuration templates, see: [TAD: Monorepo Package Structure](/docs/2-technical/2-tad.md)

## Test Requirements

### Manual Verification

- [ ] **Package Build**: Run `pnpm build` in packages/auth - verifies TypeScript compilation and tsup bundling
- [ ] **Import Test**: Create test file in another package importing `@repo/auth` - verifies package exports work
- [ ] **Environment Validation**: Start dev server without Clerk env vars - verifies env validation fails with clear error

### Automated Tests

- [ ] Unit: `env.test.ts` - Validates environment schema accepts valid Clerk variables and rejects invalid ones
- [ ] Unit: `package.test.ts` - Verifies package exports the expected subpaths

### Integration Tests

N/A - Infrastructure setup story; integration testing deferred to S8 (Integration Tests and Documentation).

### Verification Commands

```bash
# Build the package
pnpm --filter @repo/auth build

# Run unit tests
pnpm --filter @repo/auth test

# Verify package exports (from root)
pnpm --filter @repo/auth exec node -e "console.log(require('./dist/index.js'))"

# Type check
pnpm --filter @repo/auth type-check

# Lint check
pnpm --filter @repo/auth lint
```

## Implementation Notes

### Key Concepts

- **Subpath Exports**: Package exports specific entry points (`./client`, `./server`) to enable tree-shaking and clear separation of client/server code
- **Environment Validation**: Using `@t3-oss/env-nextjs` ensures type-safe environment variables with runtime validation
- **Dual Module Formats**: Exporting both ESM and CJS ensures compatibility with all Next.js build configurations

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Monorepo Package Structure](/docs/2-technical/2-tad.md#monorepo-architecture)
- [TAD: Environment Variable Validation](/docs/2-technical/2-tad.md#environment-variables)

Key pattern notes for this story:

- Use `@t3-oss/env-nextjs` for environment validation with separate client/server schemas
- Follow the `@repo/*` naming convention for internal packages
- Configure tsup to generate TypeScript declaration files alongside built code

### Troubleshooting

| Issue                                          | Cause                                          | Solution                                                      |
| ---------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------- |
| Build fails with "Cannot find module"          | Missing dependency or incorrect tsconfig paths | Verify dependencies installed and tsconfig extends base       |
| Environment validation fails in development    | Missing `.env.local` file                      | Create `.env.local` with Clerk keys from dashboard           |
| Import error when using package in application | Incorrect package exports configuration        | Check `package.json` exports field matches actual file paths  |
| Type definitions not found                     | Missing TypeScript declaration files           | Ensure `declaration: true` in tsup config                     |

### Reference Materials

- [Clerk Next.js Quickstart](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Environment Variables](https://clerk.com/docs/deployments/clerk-environment-variables)
- [T3 Env Documentation](https://env.t3.gg/docs/nextjs)
- [Turborepo Package Guide](https://turbo.build/repo/docs/handbook/sharing-code/internal-packages)

## Estimated Effort

**Size**: S (3h)

**Breakdown**:

- Package structure setup: 1h
- Dependency installation and configuration: 0.5h
- Environment validation implementation: 0.5h
- README documentation: 0.5h
- Testing and verification: 0.5h

## Architecture Decisions

> **Consolidation Rule**: Only document story-specific decisions here.
> Cross-cutting decisions should be added to TAD first, then linked from this section.
> See [Architecture Decision Format](/docs/0-process/references/story-details-template.md#architecture-decision-format) for consolidation guidelines.

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md) - Establishes `@repo/*` naming and package structure
- [ADR-002: pnpm as Package Manager](/docs/2-technical/adr/002-pnpm-package-manager.md) - Workspace configuration and dependency management
- [ADR-006: Clerk for Authentication](/docs/2-technical/adr/006-clerk-authentication.md) - Choice of Clerk SDK and environment variable naming

### Story-Specific Decisions

#### AD-2A.7.S1.1: Subpath Exports for Client/Server Separation

**Scope**: Story-specific (enables clear import patterns for auth package consumers)

**Decision**: Export separate subpaths for client-side hooks (`@repo/auth/client`) and server-side utilities (`@repo/auth/server`) rather than a single entry point.

**Rationale**:

- Next.js App Router enforces strict client/server boundaries
- Subpath exports enable better tree-shaking by bundling only needed code
- Clear import paths prevent accidental use of server code in client components
- Aligns with Clerk's own SDK structure (`@clerk/nextjs` vs `@clerk/nextjs/server`)

**Consequences**:

- Consumers must import from specific subpaths: `import { useAuth } from '@repo/auth/client'`
- Build configuration must output multiple entry points
- Documentation must clearly indicate which exports are client-only vs server-only

**Alternatives Considered**:

- **Single entry point with mixed exports**: Rejected - would bundle unnecessary code and risk client/server boundary violations
- **Separate packages (`@repo/auth-client`, `@repo/auth-server`)**: Rejected - adds complexity and splits shared types across packages

## Out of Scope

The following items are explicitly NOT part of this story:

- **ClerkProvider wrapper component** - Deferred to S2 (ClerkProvider Wrapper and Auth Context)
- **Auth hooks implementation** - Deferred to S3 (Auth Hooks Implementation)
- **Webhook handler implementation** - Deferred to S5 (Webhook Handler Framework)
- **Protected route HOC** - Deferred to S4 (Protected Route HOC)
- **Actual Clerk configuration in dashboard** - Manual step performed by team lead
- **Integration tests** - Deferred to S8 (Integration Tests and Documentation)
- **Middleware integration** - Package provides utilities; middleware configured in S2

## Dependencies on Other Stories

### Depends On (Must Complete First)

None - This is the foundation story for the auth package.

### Enables (Unblocks These Stories)

- **S2**: ClerkProvider Wrapper and Auth Context - Requires package structure and Clerk SDK
- **S3**: Auth Hooks Implementation - Requires package exports and types
- **S4**: Protected Route HOC - Requires package structure and server utilities
- **S5**: Webhook Handler Framework - Requires svix dependency and types
- **S6**: User Database Sync - Requires webhook framework from S5

## References

### Epic & TAD References

- [EPIC.md: Overview](./EPIC.md#overview)
- [EPIC.md: Technical Constraints](./EPIC.md#technical-constraints)
- [TAD: Security Architecture](/docs/2-technical/2-tad.md#security-architecture)
- [TAD: Monorepo Architecture](/docs/2-technical/2-tad.md#monorepo-architecture)

### ADR References

- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)
- [ADR-002: pnpm as Package Manager](/docs/2-technical/adr/002-pnpm-package-manager.md)
- [ADR-006: Clerk for Authentication](/docs/2-technical/adr/006-clerk-authentication.md)

### External Documentation

- [Clerk Next.js Documentation](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Environment Variables](https://clerk.com/docs/deployments/clerk-environment-variables)
- [Svix Webhook Verification](https://docs.svix.com/receiving/verifying-payloads/how)
- [T3 Env Documentation](https://env.t3.gg/docs/nextjs)

## Verification Checklist

### Pre-Verification

- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] pnpm workspace configured correctly

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors
- [ ] Types compile successfully
- [ ] Tests written and passing
- [ ] Environment validation working correctly

### Documentation

- [ ] README.md created with clear usage examples
- [ ] Environment variables documented
- [ ] Package exports documented
- [ ] Architecture decisions documented

### Git Hygiene

- [ ] Conventional commit message used (e.g., "feat(auth): create @repo/auth package structure")
- [ ] No unrelated changes included
- [ ] PR description references this story

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
