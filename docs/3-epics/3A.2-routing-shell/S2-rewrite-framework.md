# Story 3A.2.S2: Implement Rewrite Configuration Framework

> **To implement this story:** Read the Technical Requirements, create the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Routing Application Shell](./EPIC.md)
- **Depends On**: [S1: Initialize Routing Application](./S1-initialize-routing-app.md)
- **Blocks**: [S6: Create Responsive Shell Layout](./S6-responsive-shell.md)
- **Runs in Parallel With**: [S3: Build SEO Utilities](./S3-seo-utilities.md), [S4: Integrate Analytics](./S4-analytics-integration.md), [S5: Configure CDN Asset References](./S5-cdn-integration.md)

## User Story

**As a** Platform Engineer
**I want** a configurable URL rewrite framework in the routing application
**So that** I can delegate requests to different applications (docs, demo, marketing, tools) without modifying core routing logic

## Acceptance Criteria

- [ ] Rewrite configuration framework implemented in `next.config.js`
- [ ] Developers can add new application rewrites via configuration file without touching middleware
- [ ] URL patterns correctly delegate to target applications
- [ ] Rewrite rules support path prefix matching (e.g., `/docs/*` → docs app)
- [ ] Rewrite configuration is type-safe and validates at build time
- [ ] Documentation explains how to add new application routes
- [ ] Test suite verifies rewrite behavior for multiple URL patterns

## Technical Requirements

### Files to Create

| Path                                               | Purpose                                      |
| -------------------------------------------------- | -------------------------------------------- |
| `apps/routing/src/config/rewrites.ts`              | Rewrite rule configuration                   |
| `apps/routing/src/config/rewrites.schema.ts`       | Type definitions for rewrite rules           |
| `apps/routing/src/lib/validate-rewrites.ts`        | Build-time validation of rewrite config      |
| `apps/routing/tests/rewrites.test.ts`              | Unit tests for rewrite configuration         |
| `apps/routing/docs/REWRITES.md`                    | Documentation for adding application rewrites |

### Files to Modify

| Path                          | Changes                                                            |
| ----------------------------- | ------------------------------------------------------------------ |
| `apps/routing/next.config.js` | Add rewrites configuration using rules from `src/config/rewrites.ts` |
| `apps/routing/middleware.ts`  | Add request logging for rewrite debugging                          |
| `apps/routing/README.md`      | Add section linking to REWRITES.md                                 |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# Navigate to apps/routing
cd apps/routing

# Development dependencies for schema validation
pnpm add -D zod
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting                       | Requirement                                    | TAD Reference                                                                      |
| ----------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------- |
| Rewrite Rule Structure        | Source pattern, destination URL, conditions    | [TAD: Edge Middleware](/docs/2-technical/2-tad-edge-middleware.md)                |
| Path Prefix Matching          | Support wildcard patterns for app delegation   | [TAD: System Architecture](/docs/2-technical/2-tad.md#system-architecture)        |
| Type Safety                   | Zod schema validation at build time            | [Coding Standards](/docs/2-technical/references/coding-standards.md)              |
| Application Mapping           | Map URL prefixes to application base URLs      | [EPIC: Technical Constraints](./EPIC.md#technical-constraints)                     |

**Configuration Rationale**:
- Rewrite framework enables adding new applications without modifying core routing code
- Type-safe configuration prevents misconfiguration that could break routing
- Centralized configuration improves maintainability and discoverability
- Build-time validation catches errors before deployment

For complete implementation patterns, see: [TAD: Edge Middleware Architecture](/docs/2-technical/2-tad-edge-middleware.md)

## Test Requirements

### Manual Verification

- [ ] **Rewrite to Docs App**: Navigate to `/docs/*` and verify request is delegated (placeholder response expected)
- [ ] **Rewrite to Demo App**: Navigate to `/demo/*` and verify request is delegated
- [ ] **Invalid Configuration**: Modify rewrite config with invalid data and verify build fails with clear error
- [ ] **Middleware Logging**: Check logs to verify rewrite decisions are logged for debugging

### Automated Tests

- [ ] Unit: `rewrites.test.ts` - Validates rewrite configuration structure
- [ ] Unit: `rewrites.test.ts` - Tests path pattern matching logic
- [ ] Unit: `validate-rewrites.test.ts` - Validates schema enforcement

### Integration Tests

- [ ] Rewrite rules correctly delegate requests to placeholder destinations
- [ ] Multiple rewrite rules can coexist without conflicts
- [ ] Invalid rewrite configuration fails build with descriptive error message
- [ ] Middleware context is preserved across rewrites

### Verification Commands

```bash
# Build application to validate configuration
cd apps/routing
pnpm build

# Type check
pnpm type-check

# Run tests
pnpm test

# Start development server
pnpm dev

# Test rewrite behavior (requires placeholder apps or mocks)
curl -I http://localhost:3000/docs/getting-started
# Expected: Request logged, rewrite processed (may 404 if app not deployed)

curl -I http://localhost:3000/demo/examples
# Expected: Request logged, rewrite processed

# Validate configuration
pnpm validate:rewrites
```

## Implementation Notes

### Implementation Sequence

1. **Define Rewrite Schema**
   - Create Zod schema for rewrite rule structure
   - Define TypeScript types for configuration
   - Document required and optional fields

2. **Create Rewrite Configuration**
   - Create `rewrites.ts` with initial application mappings
   - Add placeholder rules for docs, demo, marketing apps
   - Structure rules for easy extension

3. **Implement Validation**
   - Create build-time validation using Zod schema
   - Add validation script to package.json
   - Integrate validation into build process

4. **Update Next.js Configuration**
   - Import rewrite rules into `next.config.js`
   - Map configuration to Next.js rewrites format
   - Test rewrites function correctly

5. **Add Middleware Logging**
   - Update middleware to log rewrite decisions
   - Include source path, destination, and rule matched
   - Use structured logging format

6. **Create Documentation**
   - Document rewrite configuration structure
   - Provide examples for adding new applications
   - Include troubleshooting guide

7. **Write Tests**
   - Unit tests for configuration validation
   - Tests for path matching logic
   - Integration tests for rewrite behavior

### Key Concepts

- **URL Rewrites**: Next.js feature that maps incoming request paths to different destinations without changing the URL in the browser
- **Path Matching**: Pattern-based matching using wildcards (e.g., `/docs/:path*`) to delegate entire URL namespaces
- **Middleware Context**: Request metadata passed through middleware chain that can influence routing decisions
- **Build-Time Validation**: Type checking and schema validation that runs during build to prevent runtime errors

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Edge Middleware Composition](/docs/2-technical/2-tad-edge-middleware.md#middleware-chain-composition)
- [TAD: Conditional Middleware](/docs/2-technical/2-tad-edge-middleware.md#middleware-composition-pattern)
- [TAD: Request Flow](/docs/2-technical/2-tad.md#system-architecture)

Key pattern notes for this story:

- Rewrite configuration should be a pure data structure (no logic)
- Use conditional middleware pattern for rewrite-specific logging
- Validate configuration at build time to fail fast
- Keep rewrite rules simple and maintainable

### Troubleshooting

| Issue                                     | Cause                                         | Solution                                                   |
| ----------------------------------------- | --------------------------------------------- | ---------------------------------------------------------- |
| Rewrites not working                      | Next.js config syntax error                   | Check `next.config.js` exports async rewrites() function   |
| Build fails with schema error             | Invalid rewrite configuration                 | Run `pnpm validate:rewrites` to see detailed error         |
| Rewrite loops                             | Source pattern matches destination            | Ensure destination paths don't match source patterns       |
| Path parameters not captured              | Incorrect wildcard syntax                     | Use `:path*` for catch-all, `:slug` for single segment     |
| TypeScript errors in config               | Schema mismatch                               | Verify configuration matches RewriteRule type definition   |
| Rewrites conflict with existing routes    | Overlapping path patterns                     | Order rewrites by specificity (most specific first)        |

### Reference Materials

- [Next.js Rewrites Documentation](https://nextjs.org/docs/app/api-reference/next-config-js/rewrites)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Zod Schema Validation](https://zod.dev/)
- [Next.js Path Matching](https://nextjs.org/docs/app/building-your-application/routing/middleware#matching-paths)

## Estimated Effort

**Size**: M (6h)

**Breakdown**:

- Schema definition and types: 1h
- Rewrite configuration creation: 1h
- Next.js config integration: 1.5h
- Middleware logging updates: 1h
- Documentation: 1h
- Testing: 1.5h

## Architecture Decisions

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: Edge Middleware Architecture](/docs/2-technical/2-tad-edge-middleware.md#middleware-chain-composition) - Middleware composition patterns
- [ADR-003: Next.js 16 Framework](/docs/2-technical/adr/003-nextjs-framework.md) - Rewrites are a Next.js feature
- [TAD: System Architecture](/docs/2-technical/2-tad.md#system-architecture) - Multi-app architecture approach

### Story-Specific Decisions

#### AD-3A.2.S2.1: Configuration-First Rewrite Approach

**Scope**: Story-specific (does not affect other stories)

**Decision**: Implement rewrites as a pure configuration file in `src/config/rewrites.ts` rather than embedding logic directly in `next.config.js`.

**Rationale**:
- Separates configuration data from Next.js build configuration
- Enables build-time validation using Zod schemas
- Makes rewrite rules easier to discover and modify
- Supports future extensions (e.g., environment-specific rewrites)
- Improves testability of rewrite logic

**Consequences**:
- Configuration must be imported into `next.config.js`
- Adds one level of indirection
- Enables better type safety and validation
- Clear separation between "what to rewrite" (config) and "how to apply rewrites" (Next.js)

**Alternatives Considered**:
- **Option 1**: Define rewrites directly in `next.config.js` - Rejected because it mixes configuration with build logic
- **Option 2**: Use JSON configuration file - Rejected because it lacks type safety and requires runtime validation

#### AD-3A.2.S2.2: Placeholder Destinations for Future Apps

**Scope**: Story-specific (does not affect other stories)

**Decision**: Configure rewrites to placeholder destinations (e.g., `/api/placeholder/:app`) for applications not yet deployed.

**Rationale**:
- Allows rewrite framework to be tested without requiring all apps to be deployed
- Establishes URL namespace early to prevent conflicts
- Provides clear feedback when accessing unimplemented routes
- Simplifies incremental deployment of applications

**Consequences**:
- Placeholder responses need to be implemented in routing app
- Documentation must explain that some routes are placeholders
- Future stories will replace placeholders with actual app deployments
- Clear migration path from placeholder to production

**Alternatives Considered**:
- **Option 1**: Only add rewrites when apps are deployed - Rejected because it delays establishing URL structure
- **Option 2**: Return 404 for unimplemented apps - Rejected because it provides poor developer experience

#### AD-3A.2.S2.3: Zod for Configuration Validation

**Scope**: Story-specific (does not affect other stories)

**Decision**: Use Zod for runtime schema validation of rewrite configuration at build time.

**Rationale**:
- Zod provides TypeScript type inference from schemas
- Single source of truth for both runtime validation and types
- Excellent error messages for invalid configuration
- Already widely used in Next.js ecosystem
- Minimal bundle size impact (validation only at build time)

**Consequences**:
- Adds Zod as development dependency
- Configuration validation happens at build time, not runtime
- Clear error messages guide developers to fix configuration issues
- Type safety ensures configuration correctness

**Alternatives Considered**:
- **Option 1**: TypeScript types only (no runtime validation) - Rejected because it doesn't catch configuration errors at build time
- **Option 2**: JSON Schema - Rejected because Zod has better TypeScript integration

## Out of Scope

The following items are explicitly NOT part of this story:

- **Actual Application Deployments** - Apps (docs, demo, marketing, tools) are deployed in separate epics
- **Production Rewrite Destinations** - This story sets up framework with placeholders; actual apps replace placeholders later
- **Dynamic Rewrites Based on User Context** - Organization-specific rewrites are handled in Epic 2B.6 (Product Middleware)
- **Authentication-Based Rewrites** - Auth-specific routing is handled in Epic 2A.7 (Auth Infrastructure)
- **Rewrite Performance Optimization** - Advanced caching and optimization deferred to later optimization phases
- **A/B Testing Rewrites** - Feature flag-based routing handled in Epic 2A.4 (Analytics Infrastructure)
- **Geographic Rewrites** - Edge-based geographic routing not required for MVP

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1**: Initialize Routing Application - Requires Next.js application structure and `middleware.ts` placeholder

### Enables (Unblocks These Stories)

- **S6**: Create Responsive Shell Layout - Requires rewrite framework to integrate with complete routing shell
- **Epic 3B.3**: Routing Configuration (Product Routes) - Provides framework for product-specific route configuration
- **Epic 3B.4**: Documentation Application - Requires `/docs/*` rewrite configuration
- **Epic 3B.5**: Demo & Marketing Application - Requires `/demo/*` and `/marketing/*` rewrite configuration

## References

### Epic & TAD References

- [EPIC.md: Overview](./EPIC.md#overview)
- [EPIC.md: Key Deliverables](./EPIC.md#overview)
- [TAD: Edge Middleware Architecture](/docs/2-technical/2-tad-edge-middleware.md)
- [TAD: System Architecture](/docs/2-technical/2-tad.md#system-architecture)

### ADR References

- [ADR-003: Next.js 16 Framework](/docs/2-technical/adr/003-nextjs-framework.md)
- [ADR-004: Vercel Hosting](/docs/2-technical/adr/004-vercel-hosting.md)

### External Documentation

- [Next.js Rewrites Documentation](https://nextjs.org/docs/app/api-reference/next-config-js/rewrites)
- [Next.js Middleware Path Matching](https://nextjs.org/docs/app/building-your-application/routing/middleware#matching-paths)
- [Zod Documentation](https://zod.dev/)

## Verification Checklist

### Pre-Verification

- [ ] S1 (Initialize Routing Application) completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] Zod package installed successfully

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors
- [ ] TypeScript compiles successfully with strict mode
- [ ] Rewrite configuration validates at build time
- [ ] Tests written and passing (unit + integration)
- [ ] Coverage > 80% for new code

### Documentation

- [ ] REWRITES.md created with clear examples
- [ ] README.md updated with link to rewrites documentation
- [ ] Code comments added for complex rewrite patterns
- [ ] Architecture decisions documented in this story

### Git Hygiene

- [ ] Conventional commit message used
- [ ] No unrelated changes included
- [ ] PR description references this story
- [ ] PR title follows format: `feat(3A.2.S2): implement rewrite configuration framework`

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -

## Appendix A: Rewrite Configuration Example

Example structure for `apps/routing/src/config/rewrites.ts`:

```typescript
import { z } from "zod";

// Schema definition
export const RewriteRuleSchema = z.object({
  source: z.string(),
  destination: z.string(),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
});

export type RewriteRule = z.infer<typeof RewriteRuleSchema>;

// Configuration
export const rewriteRules: RewriteRule[] = [
  {
    source: "/docs/:path*",
    destination: "/api/placeholder/docs",
    description: "Documentation application routes",
    enabled: true,
  },
  {
    source: "/demo/:path*",
    destination: "/api/placeholder/demo",
    description: "Demo application routes",
    enabled: true,
  },
  {
    source: "/marketing/:path*",
    destination: "/api/placeholder/marketing",
    description: "Marketing application routes",
    enabled: true,
  },
];
```

## Appendix B: Next.js Config Integration

Example integration in `next.config.js`:

```javascript
const { rewriteRules } = require("./src/config/rewrites");

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return rewriteRules
      .filter((rule) => rule.enabled)
      .map((rule) => ({
        source: rule.source,
        destination: rule.destination,
      }));
  },
};

module.exports = nextConfig;
```

## Appendix C: Placeholder API Route

Example placeholder endpoint structure:

```typescript
// apps/routing/app/api/placeholder/[app]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { app: string } }
) {
  return Response.json({
    status: "placeholder",
    app: params.app,
    message: `The ${params.app} application is not yet deployed.`,
    requestedPath: new URL(request.url).pathname,
  }, { status: 503 });
}
```
