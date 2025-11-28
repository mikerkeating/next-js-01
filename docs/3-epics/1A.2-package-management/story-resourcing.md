# Epic 1A.2: Package Management & Quality Gates - Story Resourcing

## Resourcing Table

| Story | Title                               | Primary Role | Secondary Role | Hand-off Notes                                                                                                                                         |
| ----- | ----------------------------------- | ------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| S1    | Configure pnpm and npmrc            | DevOps       | -              | No hand-off required; single-domain configuration story                                                                                                |
| S2    | Set Up Environment Validation       | Backend      | -              | No hand-off required; server-side validation with Zod schemas                                                                                          |
| S3    | Install and Configure Husky         | DevOps       | -              | No hand-off required; git hooks infrastructure only                                                                                                    |
| S4    | Configure lint-staged               | DevOps       | -              | No hand-off required; build tooling configuration                                                                                                      |
| S5    | Set Up Commitlint                   | DevOps       | -              | No hand-off required; git hooks and commit validation                                                                                                  |
| S6    | Configure Markdown Linting          | DevOps       | Documentation  | Hand-off: DevOps sets up tooling and lint-staged integration; Documentation reviews rule configuration and ensures rules match documentation standards |
| S7    | Configure Dependabot                | DevOps       | -              | No hand-off required; GitHub-native feature configuration                                                                                              |
| S8    | Configure CodeRabbit AI Code Review | DevOps       | -              | No hand-off required; GitHub App installation and configuration                                                                                        |

## Role Assignment Rationale

### S1: Configure pnpm and npmrc

**Primary: DevOps** - Package manager configuration, `.npmrc` settings, and CI/CD-related behaviours (frozen lockfile, caching) are core DevOps responsibilities.

### S2: Set Up Environment Validation

**Primary: Backend** - Environment variable validation using `@t3-oss/env-nextjs` and Zod schemas is server-side logic. Requires understanding of server vs client variable boundaries and Next.js build-time validation patterns.

### S3: Install and Configure Husky

**Primary: DevOps** - Git hooks infrastructure and `prepare` script configuration is build tooling / developer environment setup.

### S4: Configure lint-staged

**Primary: DevOps** - Pre-commit hook configuration, file pattern matching, and integration with existing linting tools is build pipeline work.

### S5: Set Up Commitlint

**Primary: DevOps** - Commit message validation via git hooks is developer tooling and CI/CD adjacent.

### S6: Configure Markdown Linting

**Primary: DevOps** - Tool installation, lint-staged integration, and configuration file creation is DevOps work.

**Secondary: Documentation** - Rule selection and override decisions should be reviewed by someone familiar with documentation standards. The Documentation role should validate that:

- MD013 (line-length) override is appropriate for prose
- MD033 (no-inline-html) exceptions cover required use cases
- Ignore patterns don't exclude files that should be linted

**Hand-off**: DevOps completes tooling setup and proposes rule configuration. Documentation reviews `.markdownlint.json` and `.markdownlintignore` to ensure rules align with project documentation standards before merge.

### S7: Configure Dependabot

**Primary: DevOps** - GitHub-native Dependabot configuration for automated dependency updates is infrastructure and CI/CD work.

### S8: Configure CodeRabbit AI Code Review

**Primary: DevOps** - GitHub App installation and configuration file creation is infrastructure setup.

## Notes

- This epic is heavily DevOps-focused as it establishes developer tooling, build infrastructure, and quality gates.
- S2 (Environment Validation) is the only story requiring Backend expertise due to its focus on runtime/build-time server-side validation patterns.
- S6 is the only story benefiting from a secondary role review, as markdown linting rules directly impact documentation quality and maintainability.
- No Frontend, Database, Security, QA, or Fullstack roles are required for this epic's scope.
