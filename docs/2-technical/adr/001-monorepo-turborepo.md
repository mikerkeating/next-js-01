# ADR-001: Monorepo with Turborepo

## Status

✅ **Accepted** - 2025-11-24

## Context

We need to establish a repository structure that can efficiently manage multiple Next.js applications (routing, API, CDN, docs, demo, marketing, tools, content, landing) along with shared packages (config, database, auth, UI, analytics, observability, middleware, API client, org, testing) that will be reused across these applications.

### Key Requirements

1. **Code Sharing**: Multiple applications need to share common packages (UI components, authentication, database schemas, configuration)
2. **Independent Deployments**: Each application should be deployable independently to Vercel
3. **Build Efficiency**: Developers should have fast build times with intelligent caching
4. **Developer Experience**: Simple commands to run, build, test, and lint across all packages
5. **Type Safety**: TypeScript types should be shared and consistently updated across packages
6. **Scalability**: The structure should support adding new applications and packages as the product grows

### Constraints

- Using Next.js 16 as the primary framework
- Deploying to Vercel (first-class monorepo support required)
- TypeScript for type safety across all packages
- Need to support both apps and shared packages
- Team familiarity with modern JavaScript tooling

## Decision

We will use a **monorepo architecture powered by Turborepo** with **pnpm workspaces** to manage multiple Next.js applications and shared packages in a single repository.

### Repository Structure

```
next-js-2025-12-1/
├── apps/
│   ├── routing/          # Main routing layer
│   ├── api/              # REST API endpoints
│   ├── cdn/              # Static asset delivery
│   ├── docs/             # Documentation site
│   ├── demo/             # Demo application
│   ├── marketing/        # Marketing content
│   ├── tools/            # Authenticated tools
│   ├── content/          # Content management
│   └── landing/          # Landing page builder
├── packages/
│   ├── config/           # Shared configs (TS, ESLint, Tailwind)
│   ├── database/         # Database schema & utilities
│   ├── auth/             # Authentication utilities
│   ├── ui/               # UI component library
│   ├── analytics/        # Analytics infrastructure
│   ├── observability/    # Logging & error tracking
│   ├── middleware/       # Shared middleware
│   ├── api-client/       # Type-safe API client
│   ├── org/              # Organisation context
│   └── testing/          # Testing utilities
├── docs/                 # Product documentation
├── scripts/              # Build & deployment scripts
├── .github/              # GitHub Actions workflows
├── turbo.json           # Turborepo configuration
├── pnpm-workspace.yaml  # pnpm workspace configuration
└── package.json         # Root package.json
```

### Technology Selection

- **Turborepo**: Build system with intelligent caching and task orchestration
- **pnpm**: Fast, efficient package manager with workspace support
- **Package Naming**: `@repo/package-name` convention for internal packages

## Rationale

### Why Monorepo?

1. **Code Sharing Made Easy**: Shared packages can be imported directly without publishing to npm
2. **Atomic Changes**: Changes to shared code and consuming apps can be made in a single PR
3. **Consistent Versioning**: All packages stay in sync, reducing version mismatch issues
4. **Simplified Dependency Management**: Single lockfile for the entire project
5. **Better Refactoring**: IDEs can find all usages across the entire codebase
6. **Unified Tooling**: One set of linting, testing, and build configurations

### Why Turborepo?

1. **Vercel Integration**: Built by Vercel with first-class support for Next.js and Vercel deployments
2. **Intelligent Caching**: Caches build outputs locally and remotely, dramatically speeding up CI/CD
3. **Task Orchestration**: Runs tasks in the correct order based on dependency graph
4. **Incremental Builds**: Only rebuilds packages that have changed
5. **Simple Configuration**: Minimal setup with sensible defaults
6. **Remote Caching**: Team members can share build cache via Vercel Remote Cache
7. **Parallel Execution**: Runs independent tasks in parallel for maximum speed

### Why pnpm?

1. **Disk Efficiency**: Content-addressable storage saves disk space
2. **Fast Installation**: Faster than npm and yarn in most scenarios
3. **Strict Dependencies**: Prevents phantom dependencies
4. **Workspace Support**: Excellent monorepo workspace features
5. **Node Modules Structure**: Predictable and debuggable node_modules

### Alternatives Considered

#### Option 1: Polyrepo (Multiple Repositories)

**Pros:**
- Clear separation of concerns
- Independent deployment pipelines
- Easier access control per repository

**Cons:**
- ❌ Difficult to share code (requires publishing packages)
- ❌ Hard to maintain version consistency
- ❌ Complex cross-repo changes require multiple PRs
- ❌ Duplicated tooling configuration
- ❌ Harder to refactor across boundaries

**Decision**: Rejected due to high coordination overhead and difficulty sharing code.

#### Option 2: Monorepo with Nx

**Pros:**
- Powerful build system with extensive plugin ecosystem
- Advanced code generation capabilities
- Comprehensive project graph visualization

**Cons:**
- ❌ Steeper learning curve
- ❌ More opinionated structure
- ❌ Less optimal Vercel integration compared to Turborepo
- ❌ Heavier tooling overhead

**Decision**: Rejected in favor of Turborepo's simplicity and Vercel integration.

#### Option 3: Monorepo with Lerna

**Pros:**
- Mature monorepo tool
- Good npm publishing workflow

**Cons:**
- ❌ Maintenance has slowed down
- ❌ Less focused on build performance
- ❌ No remote caching out of the box
- ❌ Superseded by modern alternatives

**Decision**: Rejected as it's been largely superseded by Turborepo and Nx.

#### Option 4: Monorepo with Yarn Workspaces only

**Pros:**
- Simple setup
- Native yarn feature
- Good for basic monorepos

**Cons:**
- ❌ No build caching
- ❌ No task orchestration
- ❌ Manual dependency graph management
- ❌ Slower builds at scale

**Decision**: Rejected due to lack of build optimization features needed for multiple Next.js apps.

## Consequences

### Positive

1. **Developer Velocity**: Fast builds with caching significantly improve developer experience
2. **Code Reuse**: Shared packages eliminate duplication across applications
3. **Atomic Refactoring**: Large-scale changes can be made confidently in a single PR
4. **Simplified CI/CD**: Single pipeline can build and test all affected packages
5. **Type Safety Across Boundaries**: TypeScript types flow seamlessly between packages
6. **Vercel Deployment**: First-class support for deploying multiple apps from one repo
7. **Onboarding**: New developers only need to clone one repository

### Negative

1. **Build Complexity**: Initial setup requires understanding Turborepo configuration
2. **Repository Size**: Single repo will grow larger over time (mitigated by Git partial clones)
3. **CI Time**: Full CI runs can be slow without proper caching (mitigated by Turborepo cache)
4. **Learning Curve**: Team needs to learn monorepo patterns and Turborepo concepts
5. **Git Operations**: Some Git operations may be slower on a large monorepo

### Mitigation Strategies

1. **Documentation**: Comprehensive docs on monorepo patterns and common tasks
2. **Cache Strategy**: Enable Turbo Remote Cache for team collaboration
3. **CI Optimization**: Use Turborepo's `--filter` flag to only build affected packages
4. **Code Owners**: Use GitHub CODEOWNERS for package-level ownership
5. **Linting**: Enforce boundaries between packages to prevent circular dependencies

## Implementation Plan

### Phase 1: Setup (Week 1)

- [x] Initialize monorepo structure
- [ ] Configure pnpm workspaces
- [ ] Set up Turborepo
- [ ] Create shared configuration packages
- [ ] Configure root-level scripts

### Phase 2: Migration (Week 2-3)

- [ ] Create initial shared packages (@repo/config, @repo/ui)
- [ ] Set up first Next.js app (routing)
- [ ] Configure build pipeline
- [ ] Set up Vercel integration

### Phase 3: Expansion (Week 4+)

- [ ] Add remaining applications
- [ ] Create additional shared packages
- [ ] Enable Remote Cache
- [ ] Document monorepo patterns

## Validation

### Success Metrics

- [ ] Build time < 2 minutes for full rebuild
- [ ] Build time < 30 seconds for incremental changes
- [ ] 90%+ cache hit rate in CI with Remote Cache
- [ ] Zero circular dependencies between packages
- [ ] All apps successfully deploy to Vercel independently

### Testing Strategy

1. **Local Development**: Developers can run `pnpm dev` and work on any app
2. **Type Checking**: `pnpm turbo type-check` validates all TypeScript across packages
3. **Linting**: `pnpm turbo lint` runs ESLint on all packages
4. **Building**: `pnpm turbo build` builds all apps and packages
5. **Affected Testing**: Only run tests for changed packages using `--filter`

## References

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Vercel Monorepo Guide](https://vercel.com/docs/concepts/monorepos)
- [Monorepo Tools Comparison](https://monorepo.tools/)

## Related ADRs

- [ADR-002: pnpm as Package Manager](002-pnpm-package-manager.md)
- [ADR-003: Next.js 16 as Framework](003-nextjs-framework.md)
- [ADR-004: Vercel as Hosting Platform](004-vercel-hosting.md)

## Notes

This decision establishes the foundation for the entire project structure. All subsequent architectural decisions will build upon this monorepo structure.

---

**Author**: Technical Lead
**Date**: 2025-11-24
**Reviewers**: Product Manager, Engineering Team
**Last Updated**: 2025-11-24
