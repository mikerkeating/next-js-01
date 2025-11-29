# Story 2A.7.S2: ClerkProvider Wrapper and Auth Context

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Auth Infrastructure](./EPIC.md)
- **Depends On**: [S1: Package Setup and Clerk SDK Installation](./S1-package-setup.md)
- **Blocks**: [S3: Auth Hooks Implementation](./S3-auth-hooks.md), [S4: Protected Route HOC](./S4-protected-route.md), [S7: Auth Error Boundary and Token Refresh](./S7-error-boundary.md)
- **Runs in Parallel With**: None (foundational story for auth context)

## User Story

**As a** developer integrating authentication into applications
**I want** a ClerkProvider wrapper component and centralized auth context
**So that** I can easily access authentication state throughout the application and ensure consistent Clerk configuration across all apps

## Acceptance Criteria

- [ ] `ClerkProvider` wrapper component created that wraps Clerk SDK provider with standard configuration
- [ ] Wrapper component accepts optional configuration props for customization (appearance, localization)
- [ ] Auth context provides unified access to authentication state (userId, isLoaded, isSignedIn)
- [ ] Auth context works in both client and server components
- [ ] Context properly handles loading states before Clerk SDK initializes
- [ ] Wrapper applies default configuration from environment variables
- [ ] Package exports provider component for use in application root layouts
- [ ] TypeScript types correctly inferred for all auth context values

## Technical Requirements

### Files to Create

| Path | Purpose |
|------|---------|
| `packages/auth/src/provider.tsx` | ClerkProvider wrapper component |
| `packages/auth/src/context.tsx` | Auth context and provider logic |
| `packages/auth/src/types.ts` | TypeScript types for auth context |
| `packages/auth/src/config.ts` | Default Clerk configuration |

### Files to Modify

| Path | Changes |
|------|---------|
| `packages/auth/src/index.ts` | Export provider component and types |
| `packages/auth/package.json` | Add peer dependencies for React |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Required dependencies** (already installed in S1):
- `@clerk/nextjs` - Clerk SDK for Next.js
- `@clerk/themes` - Clerk UI theming

**Install peer dependencies:**

```bash
# From packages/auth directory
pnpm add react react-dom --save-peer
```

### Configuration Details

> **Note**: For complete Clerk configuration examples, reference [ADR-006: Clerk Authentication](/docs/2-technical/adr/006-clerk-authentication.md#configuration).
> This section describes configuration REQUIREMENTS for the provider wrapper.

| Setting | Requirement | TAD Reference |
|---------|-------------|---------------|
| `publishableKey` | Read from `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` env var | [ADR-006: Configuration](/docs/2-technical/adr/006-clerk-authentication.md#configuration) |
| `appearance` | Support custom theme via prop, default to base theme | [ADR-006: Configuration](/docs/2-technical/adr/006-clerk-authentication.md#configuration) |
| `localization` | Optional prop for internationalization | [ADR-006: Clerk Documentation](https://clerk.com/docs) |
| `signInUrl` | Read from `NEXT_PUBLIC_CLERK_SIGN_IN_URL` with fallback `/sign-in` | [ADR-006: Configuration](/docs/2-technical/adr/006-clerk-authentication.md#configuration) |
| `signUpUrl` | Read from `NEXT_PUBLIC_CLERK_SIGN_UP_URL` with fallback `/sign-up` | [ADR-006: Configuration](/docs/2-technical/adr/006-clerk-authentication.md#configuration) |

**Configuration Rationale**: The wrapper component centralizes Clerk configuration to ensure consistent behavior across all applications. Environment variables are used for sensitive/environment-specific settings, while props allow per-application customization of appearance and behavior.

For complete configuration templates and examples, see: [ADR-006: Clerk Configuration](/docs/2-technical/adr/006-clerk-authentication.md#configuration)

## Test Requirements

### Manual Verification

- [ ] **Provider Initialization**: Verify ClerkProvider wrapper mounts without errors in a test Next.js app
- [ ] **Environment Variable Loading**: Confirm wrapper reads Clerk keys from environment variables correctly
- [ ] **Custom Appearance**: Test that custom appearance props override default theme
- [ ] **Loading State**: Verify auth context shows `isLoaded: false` before Clerk SDK initializes, then transitions to `true`

### Automated Tests

- [ ] Unit: `provider.test.tsx` - Provider component renders children with ClerkProvider
- [ ] Unit: `provider.test.tsx` - Provider reads environment variables for configuration
- [ ] Unit: `provider.test.tsx` - Provider merges custom appearance with defaults
- [ ] Unit: `context.test.tsx` - Auth context provides expected shape and types
- [ ] Unit: `config.test.ts` - Configuration helper validates required environment variables

### Integration Tests

- [ ] Next.js app using the provider successfully initializes Clerk SDK
- [ ] Auth context values update correctly when user signs in/out (simulated with Clerk test utilities)
- [ ] Server components can access auth state via Clerk's `auth()` helper

### Verification Commands

```bash
# Run unit tests
cd packages/auth
pnpm test

# Run type checking
pnpm typecheck

# Build package to verify exports
pnpm build

# Verify no lint errors
pnpm lint
```

## Implementation Notes

### Implementation Sequence

1. **Create TypeScript Types**
   - Define `AuthContext` interface with userId, isLoaded, isSignedIn
   - Define `ClerkProviderProps` interface for wrapper component props
   - Export types from `types.ts`

2. **Create Configuration Module**
   - Build config helper that reads Clerk environment variables
   - Provide sensible defaults for optional settings
   - Validate required environment variables are present

3. **Implement ClerkProvider Wrapper**
   - Create wrapper component that accepts configuration props
   - Merge props with environment-based config
   - Render Clerk's `ClerkProvider` with merged configuration
   - Ensure children are properly rendered

4. **Create Auth Context (Client-Side)**
   - Define React context for auth state (if needed for additional abstraction)
   - Note: Clerk provides `useAuth()` and `useUser()` hooks, so custom context may be minimal or unnecessary
   - Document when to use Clerk's hooks vs custom context

5. **Update Package Exports**
   - Export provider component from `index.ts`
   - Export TypeScript types
   - Ensure package.json has correct exports configuration

6. **Write Tests**
   - Unit tests for provider component
   - Unit tests for config validation
   - Integration test with minimal Next.js app

### Key Concepts

- **Provider Pattern**: The ClerkProvider wrapper implements the React Context Provider pattern, making auth state available throughout the component tree
- **Environment Variables**: Public Clerk keys prefixed with `NEXT_PUBLIC_` are accessible client-side; secret keys are server-only
- **Clerk SDK Integration**: The wrapper delegates actual authentication logic to Clerk's SDK, focusing on configuration and consistent setup
- **Server vs Client**: Clerk provides different APIs for server components (`auth()`) and client components (`useAuth()`, `useUser()`)

### Common Patterns

> **Note**: For implementation code examples, reference the TAD and ADR.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the ADR for implementation patterns:

- [ADR-006: Root Layout ClerkProvider Setup](/docs/2-technical/adr/006-clerk-authentication.md#root-layout-applayout.tsx)
- [ADR-006: Accessing User Data](/docs/2-technical/adr/006-clerk-authentication.md#accessing-user-data)
- [ADR-006: Middleware Configuration](/docs/2-technical/adr/006-clerk-authentication.md#middleware-configuration-middleware.ts)

Key pattern notes for this story:

- Wrap the entire application at the root layout level to ensure auth context is available everywhere
- Use Clerk's built-in hooks (`useAuth`, `useUser`) for client-side auth state rather than creating redundant custom context
- Keep the wrapper focused on configuration - avoid adding business logic

### Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| "Missing publishableKey" error | Environment variable not set | Ensure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is in `.env.local` |
| Auth state always shows `isLoaded: false` | Clerk SDK not initialized | Verify ClerkProvider is at root of app, check browser console for errors |
| TypeScript errors on auth context | Incorrect types imported | Import types from `@clerk/nextjs` for Clerk-provided values |
| Provider not rendering children | Missing children prop passthrough | Ensure wrapper component renders `{children}` inside ClerkProvider |

### Reference Materials

- [Clerk Next.js Quickstart](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk ClerkProvider API Reference](https://clerk.com/docs/components/clerk-provider)
- [Clerk Appearance Customization](https://clerk.com/docs/components/customization/overview)
- [Clerk Localization](https://clerk.com/docs/components/customization/localization)

## Estimated Effort

**Size**: M (6h)

**Breakdown**:

- Types and configuration: 1h
- Provider component implementation: 2h
- Testing (unit + integration): 2h
- Documentation and examples: 1h

## Architecture Decisions

> **Consolidation Rule**: Only document story-specific decisions here.
> Cross-cutting decisions should be added to TAD first, then linked from this section.

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [ADR-006: Clerk for Authentication](/docs/2-technical/adr/006-clerk-authentication.md) - Choice of Clerk as auth provider, configuration patterns
- [TAD: Security Architecture](/docs/2-technical/2-tad-security-architecture.md#authentication-flow) - Authentication flow and session management

### Story-Specific Decisions

#### AD-2A.7.S2.1: Minimal Custom Context Approach

**Scope**: Story-specific (affects only this auth package)

**Decision**: The wrapper component will delegate most auth state management to Clerk's built-in hooks (`useAuth`, `useUser`, `useClerk`) rather than creating a custom React context layer.

**Rationale**:

- Clerk's hooks already provide comprehensive auth state access
- Adding custom context would duplicate functionality and increase maintenance
- Clerk's hooks are well-typed and optimized for Next.js App Router
- Reduces bundle size and complexity

**Consequences**:

- Developers will use Clerk's hooks directly (e.g., `useAuth()` from `@clerk/nextjs`)
- The wrapper's primary responsibility is configuration, not state management
- If custom auth state is needed later, it can be added without breaking changes

**Alternatives Considered**:

- **Full Custom Context**: Create React context wrapping all Clerk state - Rejected because it duplicates Clerk's functionality without benefit
- **Hybrid Approach**: Custom context for some values, Clerk hooks for others - Rejected due to inconsistency and confusion

#### AD-2A.7.S2.2: Environment-First Configuration

**Scope**: Story-specific (configuration pattern for this package)

**Decision**: Default configuration values will be read from environment variables, with component props available for overrides.

**Rationale**:

- Environment variables provide per-deployment configuration (dev, staging, prod)
- Props allow per-app customization when multiple apps exist in monorepo
- Follows Clerk's recommended configuration pattern
- Simplifies application code (fewer required props)

**Consequences**:

- Applications must set Clerk environment variables before using the provider
- Configuration errors caught at runtime during initialization
- Apps can optionally override defaults via props for special cases

**Alternatives Considered**:

- **Props-Only**: All configuration via props - Rejected because it requires duplicating env vars in each app's code
- **Config File**: Separate configuration file - Rejected because environment variables are more standard for secrets and deployment-specific values

## Out of Scope

The following items are explicitly NOT part of this story:

- **Auth hooks implementation** (`useAuth`, `useUser`, etc.) - Deferred to S3 (Auth Hooks Implementation)
- **Protected route components** - Deferred to S4 (Protected Route HOC)
- **Sign-in/sign-up pages** - Handled at application level, not in package
- **Webhook integration** - Deferred to S5 (Webhook Handler Framework)
- **Organization context** - Deferred to Epic 2B.7 (product-specific organizations)
- **Role-based access control** - Deferred to Epic 2B.7
- **Custom session claims** - Deferred to Epic 2B.7
- **Error boundary for auth errors** - Deferred to S7

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1: Package Setup and Clerk SDK Installation** - Required packages must be installed and package structure in place before creating provider component

### Enables (Unblocks These Stories)

- **S3: Auth Hooks Implementation** - Hooks will use the auth context established by this provider
- **S4: Protected Route HOC** - Route protection needs auth context to check authentication state
- **S7: Auth Error Boundary and Token Refresh** - Error boundaries wrap the provider and handle auth-related errors

## References

### Epic & TAD References

- [EPIC.md: Overview](./EPIC.md#overview)
- [EPIC.md: Technical Constraints](./EPIC.md#technical-constraints)
- [TAD: Security Architecture](/docs/2-technical/2-tad-security-architecture.md#authentication-flow)

### ADR References

- [ADR-006: Clerk for Authentication](/docs/2-technical/adr/006-clerk-authentication.md)
- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)

### External Documentation

- [Clerk Next.js Documentation](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk ClerkProvider Component](https://clerk.com/docs/components/clerk-provider)
- [Clerk React Hooks](https://clerk.com/docs/references/react/use-auth)
- [Clerk Customization](https://clerk.com/docs/components/customization/overview)

## Verification Checklist

### Pre-Verification

- [ ] S1 (Package Setup) completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] Clerk account created and test application configured
- [ ] Environment variables for Clerk keys available

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors
- [ ] Types compile successfully
- [ ] Tests written and passing
- [ ] Coverage > 80% for new code

### Documentation

- [ ] JSDoc comments on provider component explain props and usage
- [ ] README example shows how to use provider in app layout
- [ ] Types exported and documented

### Git Hygiene

- [ ] Conventional commit message used (e.g., `feat(auth): add ClerkProvider wrapper and auth context`)
- [ ] No unrelated changes included
- [ ] PR description includes testing instructions

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
