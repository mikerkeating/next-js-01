# Epic 1A.2: Package Management & Quality Gates

> **To create stories for this epic:** Define the epic scope and acceptance criteria first, then break down into stories following the [story template](../../0-process/references/story-details-template.md). Each story should be independently implementable and testable.

## Context

- **PRD Reference**: [PRD: Technology Requirements](/docs/1-product/1-prd.md#6-technical-requirements)
- **TAD Reference**: [TAD: Developer Experience](/docs/2-technical/2-tad-developer-experience.md)
- **Phase**: 1A - Foundation & Infrastructure (Days 3-7)
- **Type**: Foundation

## Dependencies

### Requires (Must Complete First)

| Epic | Title                                                      | Reason                                                                                                  |
| ---- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 1A.1 | [Monorepo Foundation](../1A.1-monorepo-foundation/EPIC.md) | Workspace structure required for package-level quality gates, pnpm configuration, and Husky integration |

### Blocks (Enables These Epics)

| Epic | Title                                                                | What This Provides                                                                        |
| ---- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1A.3 | [Testing Foundation](../1A.3-testing-foundation/EPIC.md)             | Environment validation pattern and lint-staged integration for test file linting          |
| 1A.4 | [Documentation Foundation](../1A.4-documentation-foundation/EPIC.md) | Markdown linting configuration and documentation quality gates                            |
| 1A.5 | [Basic CI/CD Pipeline](../1A.5-basic-cicd/EPIC.md)                   | Quality gate thresholds, commitlint for changelog generation, and security audit patterns |
| 2A.1 | [Configuration Package](../2A.1-config-package/EPIC.md)              | ESLint and Prettier configurations to be extracted into shared package                    |

### Can Run in Parallel With

| Epic | Title | Notes                                                                        |
| ---- | ----- | ---------------------------------------------------------------------------- |
| -    | None  | This epic establishes quality infrastructure that subsequent epics depend on |

## Overview

Package Management & Quality Gates establishes the developer experience infrastructure for the monorepo, ensuring consistent code quality, automated formatting, conventional commits, and dependency management. This epic transforms the basic monorepo into a production-ready development environment with pre-commit hooks, AI-assisted code review, and automated dependency updates.

**Key Deliverables:**

- pnpm configuration with `.npmrc` and workspace optimisations
- Environment validation with `@t3-oss/env-nextjs` for type-safe environment variables
- Pre-commit quality gates with Husky and lint-staged (ESLint + Prettier)
- Conventional commit enforcement with commitlint
- Markdown linting with markdownlint for documentation consistency
- Automated dependency management with Dependabot (npm + GitHub Actions)
- AI code review configuration with CodeRabbit

## Acceptance Criteria

> **Note**: Epic acceptance criteria should be high-level outcomes. Story-level criteria provide the detailed verification.

- [ ] Developers get automatic code formatting and linting on every commit (pre-commit hooks prevent non-compliant code)
- [ ] Commit messages follow conventional commit format and are rejected if non-compliant
- [ ] Environment variables are validated at build time with clear error messages for missing/invalid values
- [ ] Markdown documentation follows consistent style and broken links are detected
- [ ] Dependabot creates PRs for outdated dependencies on a weekly schedule
- [ ] Pull requests receive automated AI code review feedback within 5 minutes
- [ ] All configuration files are documented with inline comments explaining choices
- [ ] New developers can run `pnpm install` and have all quality gates automatically configured
- [ ] All stories complete and verified
- [ ] Documentation updated

## Stories

| ID  | Title                                                                 | Size | Status | Depends On | Blocks     |
| --- | --------------------------------------------------------------------- | ---- | ------ | ---------- | ---------- |
| S1  | [Configure pnpm and npmrc](./S1-pnpm-config.md)                       | S    | ⬜     | -          | S2, S3, S5 |
| S2  | [Set Up Environment Validation](./S2-env-validation.md)               | M    | ⬜     | S1         | S6         |
| S3  | [Install and Configure Husky](./S3-husky-setup.md)                    | S    | ⬜     | S1         | S4         |
| S4  | [Configure lint-staged with ESLint and Prettier](./S4-lint-staged.md) | M    | ⬜     | S3         | S6         |
| S5  | [Set Up Commitlint for Conventional Commits](./S5-commitlint.md)      | S    | ⬜     | S1, S3     | S6         |
| S6  | [Configure Markdown Linting](./S6-markdown-lint.md)                   | M    | ⬜     | S4, S5     | S8         |
| S7  | [Configure Dependabot for Automated Updates](./S7-dependabot.md)      | S    | ⬜     | S1         | S8         |
| S8  | [Configure CodeRabbit AI Code Review](./S8-coderabbit.md)             | S    | ⬜     | S6, S7     | -          |

**Status Legend**: ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Blocked

## Story Dependency Graph

```
S1 (pnpm Configuration)
 ├──→ S2 (Environment Validation)
 │
 ├──→ S3 (Husky Setup)
 │     ├──→ S4 (lint-staged) ←── S3
 │     │     ↓
 │     └──→ S5 (Commitlint) ←── S1
 │           ↓
 │           └──→ S6 (Markdown Linting) ←── S4
 │                 ↓
 └──→ S7 (Dependabot)
       ↓
       └──→ S8 (CodeRabbit) ←── S6
```

**Parallel Execution Notes:**

- S2 (Environment Validation) and S3 (Husky Setup) can start immediately after S1 completes
- S7 (Dependabot) can run in parallel with S3-S6 as it only depends on S1
- S4 (lint-staged) and S5 (Commitlint) both depend on S3 but can run in parallel
- S8 (CodeRabbit) is the final convergence point requiring both quality gate chains complete

## Technical Constraints

### Required Patterns

- **Package Manager Configuration**: pnpm with strict peer dependencies per [ADR-002: pnpm](/docs/2-technical/adr/002-pnpm-package-manager.md)
- **Environment Validation**: Type-safe validation using `@t3-oss/env-nextjs` with Zod schemas per [TAD: Developer Experience](/docs/2-technical/2-tad-developer-experience.md)
- **Quality Gates**: Pre-commit hooks must not block emergency commits (document bypass procedure)
- **Conventional Commits**: Follow [Conventional Commits 1.0.0](https://www.conventionalcommits.org/) specification

### Technology Decisions

| Decision               | Choice             | Reference                                                                                |
| ---------------------- | ------------------ | ---------------------------------------------------------------------------------------- |
| Package Manager        | pnpm 10.x          | [ADR-002: pnpm as Package Manager](/docs/2-technical/adr/002-pnpm-package-manager.md)    |
| Environment Validation | @t3-oss/env-nextjs | [TAD: Developer Experience](/docs/2-technical/2-tad-developer-experience.md)             |
| Git Hooks              | Husky 9.x          | [Canonical Versions](/docs/2-technical/references/canonical-versions.md)                 |
| Staged Linting         | lint-staged 15.x   | [Canonical Versions](/docs/2-technical/references/canonical-versions.md)                 |
| Commit Linting         | commitlint 18.x    | [Canonical Versions](/docs/2-technical/references/canonical-versions.md)                 |
| AI Code Review         | CodeRabbit         | [Roadmap: 1A.2](/docs/1-product/3-roadmap.md#epic-1a2-package-management--quality-gates) |

### Constraints

- **Versions**: All technology versions per [Canonical Versions](/docs/2-technical/references/canonical-versions.md)
- **No Breaking Developer Flow**: Quality gates must complete in <10 seconds to avoid frustration
- **Bypass Mechanism**: Document `--no-verify` for emergency hotfixes with audit trail
- **IDE Integration**: Configuration must work with VS Code ESLint and Prettier extensions
- **CI Compatibility**: Pre-commit checks must be a subset of CI checks (avoid CI failures for code that passed locally)

## Out of Scope

The following items are explicitly NOT part of this epic:

- **ESLint Rule Configuration** - Initial rules only; advanced rules deferred to Epic 2A.1 (Configuration Package)
- **Prettier Plugin Configuration** - Basic formatting only; Tailwind sorting deferred to Epic 2A.1
- **Testing Tool Configuration (Vitest)** - Deferred to Epic 1A.3 (Testing Foundation)
- **Security Scanning (pnpm audit in CI)** - Deferred to Epic 1A.5 (Basic CI/CD Pipeline)
- **Type-Checking in Pre-commit** - Too slow for pre-commit; runs in CI only
- **Storybook Integration** - Deferred to Epic 4A.2 (Storybook Enhancement)
- **Advanced Dependabot Configuration** - Auto-merge for patch updates requires CI pipeline first (Epic 1A.5)

## Actions or Decisions Required

> **Note**: Flag decisions that need resolution before or during implementation.

| Decision                        | Options                                     | Impact                                  | Status                                                                         |
| ------------------------------- | ------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------ |
| Commitlint config preset        | `@commitlint/config-conventional` vs custom | Affects allowed commit types and scopes | ✅ Resolved: Use conventional preset                                           |
| lint-staged TypeScript checking | Include `tsc --noEmit` vs exclude           | Affects pre-commit speed (5s vs 30s+)   | ✅ Resolved: Exclude; run in CI                                                |
| Dependabot update schedule      | Daily vs weekly                             | Affects PR noise and review burden      | ✅ Resolved: Weekly per roadmap                                                |
| CodeRabbit review profile       | Assertive vs balanced                       | Affects verbosity of AI review comments | ⬜ Open                                                                        |
| Markdown link validation        | markdownlint-cli2 + markdown-link-check     | Affects dead link detection capability  | ✅ Resolved: Use markdownlint-cli2 for linting + markdown-link-check for links |

## Risks and Mitigations

| Risk                                           | Likelihood | Impact | Mitigation                                                            |
| ---------------------------------------------- | ---------- | ------ | --------------------------------------------------------------------- |
| Pre-commit hooks too slow (>10s)               | Medium     | High   | Exclude type-checking; use Turborepo cache; profile and optimise      |
| Developer frustration with strict commitlint   | Medium     | Medium | Document common patterns; provide commit message templates            |
| Dependabot PR flood on initial enable          | High       | Low    | Enable grouped updates; configure ignore patterns for stable packages |
| CodeRabbit false positives                     | Medium     | Low    | Configure path-based rules; adjust review sensitivity                 |
| Environment validation breaks existing scripts | Low        | Medium | Add validation incrementally; maintain backward compatibility         |

## Estimated Effort

| Metric          | Value        |
| --------------- | ------------ |
| Total Stories   | 8            |
| Total Hours     | 25h          |
| Calendar Days   | 2-3 days     |
| Parallel Tracks | 2 (after S1) |

### Story Breakdown

| Size      | Count | Hours |
| --------- | ----- | ----- |
| XS (1-2h) | 0     | 0h    |
| S (2-4h)  | 5     | 13h   |
| M (4-8h)  | 3     | 12h   |
| L (8-16h) | 0     | 0h    |

**Note**: S-sized stories estimated at ~2.5h average for configuration tasks. M-sized stories (Environment Validation, lint-staged, Markdown Linting) require more testing to ensure IDE and CI compatibility.

## References

### Internal Documentation

- [PRD: Technical Requirements](/docs/1-product/1-prd.md#6-technical-requirements)
- [TAD: Developer Experience](/docs/2-technical/2-tad-developer-experience.md)
- [Roadmap: Phase 1A](/docs/1-product/3-roadmap.md#phase-1a-foundation--infrastructure-days-3-7)
- [Canonical Versions](/docs/2-technical/references/canonical-versions.md)

### ADRs

- [ADR-002: pnpm as Package Manager](/docs/2-technical/adr/002-pnpm-package-manager.md)

### External Documentation

- [pnpm Configuration](https://pnpm.io/npmrc)
- [t3-env Documentation](https://env.t3.gg/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/lint-staged/lint-staged)
- [Commitlint Documentation](https://commitlint.js.org/)
- [markdownlint Rules](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md)
- [Dependabot Configuration](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file)
- [CodeRabbit Configuration](https://docs.coderabbit.ai/guides/configure-coderabbit)
- [Conventional Commits](https://www.conventionalcommits.org/)

## Status

- **State**: Not Started
- **Started**: -
- **Completed**: -
- **Stories Complete**: 0/8
