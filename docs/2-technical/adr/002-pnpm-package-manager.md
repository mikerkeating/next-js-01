# ADR-002: pnpm as Package Manager

## Status

✅ **Accepted** - 2025-11-24

## Context

We need to select a package manager for our monorepo that can efficiently handle dependencies across multiple Next.js applications and shared packages. The package manager must support workspace features, provide fast installation times, and integrate seamlessly with our chosen build system (Turborepo) and hosting platform (Vercel).

### Key Requirements

1. **Workspace Support**: Must support monorepo workspaces for managing dependencies across multiple packages
2. **Performance**: Fast installation and resolution times, especially in CI/CD environments
3. **Disk Efficiency**: Optimal disk space usage when managing multiple projects
4. **Deterministic Installs**: Lockfile that ensures consistent dependency versions across environments
5. **Turborepo Compatibility**: First-class support for Turborepo caching and task orchestration
6. **Vercel Integration**: Seamless deployment experience with Vercel
7. **Developer Experience**: Clear error messages, intuitive commands, good documentation

### Constraints

- Must work with Node.js 24.x LTS
- Must support TypeScript projects with complex dependency graphs
- Team needs to adopt the tool quickly with minimal learning curve
- CI/CD pipelines should run efficiently with proper caching

## Decision

We will use **pnpm (version 10.x)** as our package manager for the entire monorepo.

### Configuration

**pnpm-workspace.yaml**:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

**Root package.json**:

```json
{
  "name": "next-js-2025-12-1",
  "private": true,
  "packageManager": "pnpm@10.x",
  "engines": {
    "node": ">=24.0.0 <25.0.0",
    "pnpm": ">=10.22.0"
  }
}
```

**.npmrc**:

```ini
# Strict dependency resolution
auto-install-peers=false
strict-peer-dependencies=true

# Workspace configuration
link-workspace-packages=true
prefer-workspace-packages=true

# Lockfile settings
lockfile=true
frozen-lockfile=true

# Performance optimizations
side-effects-cache=true
```

## Rationale

### Why pnpm?

1. **Disk Space Efficiency**
   - Content-addressable storage: All package versions are stored once in a global store
   - Hard links to global store from node_modules
   - Symlinks create the node_modules structure
   - Saves gigabytes of disk space compared to npm/yarn

2. **Installation Speed**
   - Faster than npm and yarn in most benchmarks
   - Efficient resolution algorithm
   - Smart caching strategies
   - Parallel installation by default

3. **Strict Dependency Management**
   - Prevents phantom dependencies (packages used but not declared)
   - Non-flat node_modules structure prevents accidental access to transitive dependencies
   - Strict peer dependency resolution catches compatibility issues early

4. **Excellent Workspace Support**
   - First-class monorepo features
   - Workspace protocol for local package linking
   - Efficient handling of workspace dependencies
   - Filter commands for selective operations

5. **Turborepo Integration**
   - Officially supported by Turborepo
   - Works seamlessly with Turbo's caching strategy
   - Efficient workspace task execution
   - Recommended by Vercel for monorepos

6. **Vercel Compatibility**
   - Full support on Vercel platform
   - Automatic detection and installation
   - Works with Vercel's build caching
   - No special configuration needed

7. **Security**
   - Built-in checksum verification
   - Strict lockfile prevents supply chain attacks
   - Isolated node_modules prevents dependency confusion

### Performance Comparison

Based on industry benchmarks (approximate):

| Operation         | npm 10 | yarn 4 | pnpm 10 | Winner  |
| ----------------- | ------ | ------ | ------- | ------- |
| **Clean install** | 51s    | 30s    | 24s     | ✅ pnpm |
| **With cache**    | 7s     | 8s     | 3s      | ✅ pnpm |
| **With lockfile** | 14s    | 11s    | 6s      | ✅ pnpm |
| **Disk space**    | 500 MB | 450 MB | 300 MB  | ✅ pnpm |

### Alternatives Considered

#### Option 1: npm (8.x+)

**Pros:**

- Default package manager bundled with Node.js
- Widest compatibility
- No additional installation required
- Workspace support added in v7

**Cons:**

- ❌ Slower installation compared to pnpm
- ❌ Less disk efficient (flat node_modules)
- ❌ Allows phantom dependencies
- ❌ Workspaces feature less mature
- ❌ Larger node_modules size

**Decision**: Rejected due to slower performance and less efficient disk usage in monorepo scenarios.

#### Option 2: Yarn Classic (1.x)

**Pros:**

- Mature and stable
- Good performance
- Widespread adoption

**Cons:**

- ❌ In maintenance mode (not actively developed)
- ❌ Superseded by Yarn Berry/Modern
- ❌ Less efficient than modern alternatives
- ❌ Not recommended for new projects

**Decision**: Rejected as it's in maintenance mode and superseded by Yarn Modern.

#### Option 3: Yarn Modern/Berry (4.x)

**Pros:**

- Plug'n'Play (PnP) mode for faster installs
- Modern architecture
- Good workspace support
- Active development

**Cons:**

- ❌ PnP mode has compatibility issues with some packages
- ❌ Steeper learning curve (especially with PnP)
- ❌ Some tools don't work well with PnP
- ❌ Less straightforward than pnpm
- ❌ Requires more configuration for optimal setup

**Decision**: Rejected due to PnP compatibility challenges and increased complexity compared to pnpm.

#### Option 4: Bun (1.x)

**Pros:**

- Extremely fast JavaScript runtime
- Built-in package manager
- Modern tooling
- Growing ecosystem

**Cons:**

- ❌ Still relatively new (production readiness concerns)
- ❌ Requires using Bun runtime (not just Node.js)
- ❌ Less mature ecosystem compared to established options
- ❌ Potential compatibility issues with existing tooling
- ❌ Not widely supported in enterprise environments yet

**Decision**: Rejected as it's too new for a production monorepo and requires runtime changes.

## Consequences

### Positive

1. **Faster Development Cycles**: Quick installs reduce wait time during development
2. **Efficient CI/CD**: Faster CI pipeline execution saves time and resources
3. **Disk Space Savings**: Developers save gigabytes of disk space locally
4. **Better Dependency Hygiene**: Strict mode catches dependency issues early
5. **Improved Security**: Reduced risk of phantom dependencies and supply chain attacks
6. **Seamless Monorepo Experience**: Excellent workspace features simplify cross-package development
7. **Cost Savings**: Faster CI/CD translates to lower infrastructure costs

### Negative

1. **Learning Curve**: Team needs to learn pnpm-specific commands (mitigated by similarity to npm)
2. **Different node_modules Structure**: Debugging might be slightly different due to symlinks
3. **Ecosystem Adoption**: Some legacy tools might not understand pnpm's structure
4. **Migration Effort**: Need to migrate from existing package.json/lockfiles if applicable

### Mitigation Strategies

1. **Documentation**: Create pnpm command reference for common operations
2. **Scripts**: Add package.json scripts that abstract package manager commands
3. **CI Configuration**: Ensure CI properly caches pnpm store
4. **Team Training**: Run team workshop on pnpm basics and troubleshooting
5. **Gradual Adoption**: Start with development, then migrate CI/CD

## Implementation Plan

### Phase 1: Initial Setup (Day 1)

- [x] Install pnpm globally: `npm install -g pnpm@10`
- [ ] Create `pnpm-workspace.yaml` configuration
- [ ] Add `.npmrc` with recommended settings
- [ ] Update `package.json` with `packageManager` field
- [ ] Create initial workspace structure

### Phase 2: Configuration (Day 1-2)

- [ ] Configure workspace dependencies
- [ ] Set up shared package scripts
- [ ] Test local development workflow
- [ ] Document common commands

### Phase 3: CI/CD Integration (Day 2-3)

- [ ] Update GitHub Actions to use pnpm
- [ ] Configure pnpm caching in CI
- [ ] Set up Vercel deployment with pnpm
- [ ] Test full CI/CD pipeline

### Phase 4: Team Onboarding (Week 1)

- [ ] Create developer documentation
- [ ] Run team training session
- [ ] Establish troubleshooting guide
- [ ] Collect feedback and iterate

## Validation

### Success Metrics

- [ ] Installation time < 30s for clean install
- [ ] Installation time < 5s with cache
- [ ] Disk space usage < 400 MB for all node_modules
- [ ] Zero phantom dependency issues
- [ ] 100% of CI/CD pipelines passing
- [ ] Team comfortable with pnpm commands within 1 week

### Testing Checklist

1. **Local Development**:
   - [ ] `pnpm install` works across all workspaces
   - [ ] `pnpm dev` starts development servers
   - [ ] `pnpm build` builds all apps successfully
   - [ ] Hot reload works correctly

2. **Workspace Operations**:
   - [ ] `pnpm add` in workspace root
   - [ ] `pnpm add` in specific workspace
   - [ ] `pnpm --filter` for targeted operations
   - [ ] Cross-workspace dependencies resolve correctly

3. **CI/CD**:
   - [ ] GitHub Actions installs dependencies successfully
   - [ ] Cache restore works properly
   - [ ] Build times meet targets
   - [ ] Vercel deployments succeed

4. **Edge Cases**:
   - [ ] Fresh clone and install works
   - [ ] Lockfile conflicts are resolvable
   - [ ] Peer dependency warnings are actionable
   - [ ] Node modules structure is accessible for debugging

## Common Commands Reference

### Basic Operations

```bash
# Install dependencies
pnpm install

# Add dependency to workspace root
pnpm add <package> -w

# Add dependency to specific workspace
pnpm add <package> --filter <workspace>

# Update dependencies
pnpm update

# Remove dependency
pnpm remove <package>
```

### Workspace Operations

```bash
# Run command in all workspaces
pnpm -r <command>

# Run command in specific workspace
pnpm --filter <workspace> <command>

# Run command in workspace and dependencies
pnpm --filter <workspace>... <command>

# List all workspace packages
pnpm list -r --depth 0
```

### Troubleshooting

```bash
# Clear cache
pnpm store prune

# Verify store integrity
pnpm store status

# Why is a package installed?
pnpm why <package>

# Show workspace tree
pnpm list -r
```

## Migration Guide

For projects migrating from npm or yarn:

1. **Remove old lockfiles**:

   ```bash
   rm -f package-lock.json yarn.lock
   ```

2. **Install pnpm**:

   ```bash
   npm install -g pnpm@10
   ```

3. **Import dependencies**:

   ```bash
   pnpm import  # Converts package-lock.json to pnpm-lock.yaml
   ```

4. **Install dependencies**:

   ```bash
   pnpm install
   ```

5. **Update CI/CD**: Replace npm/yarn commands with pnpm equivalents

## References

- [pnpm Documentation](https://pnpm.io/)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Turborepo with pnpm](https://turbo.build/repo/docs/handbook/package-installation#pnpm)
- [Vercel pnpm Support](https://vercel.com/docs/concepts/monorepos/package-managers#pnpm)
- [pnpm Benchmarks](https://pnpm.io/benchmarks)

## Related ADRs

- [ADR-001: Monorepo with Turborepo](001-monorepo-turborepo.md) - pnpm enables efficient monorepo management
- [ADR-003: Next.js 16 as Framework](003-nextjs-framework.md) - pnpm manages Next.js dependencies
- [ADR-004: Vercel as Hosting Platform](004-vercel-hosting.md) - pnpm integrates with Vercel deployments

## Notes

pnpm's strict dependency resolution and efficient storage make it ideal for monorepos with many packages. The performance gains in CI/CD alone justify the adoption, and the disk space savings are a welcome bonus for developers working on multiple projects.

The learning curve is minimal as most commands are identical to npm, with the main differences being in workspace-specific operations which are well-documented.

---

**Author**: Technical Lead
**Date**: 2025-11-24
**Reviewers**: DevOps Lead, Engineering Team
**Last Updated**: 2025-11-24
