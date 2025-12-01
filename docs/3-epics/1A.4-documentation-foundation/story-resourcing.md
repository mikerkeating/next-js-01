# Story Resourcing: Epic 1A.4 Documentation Foundation

## Resourcing Table

| Story | Title                                              | Primary Role           | Secondary Role         | Hand-off Required |
| ----- | -------------------------------------------------- | ---------------------- | ---------------------- | ----------------- |
| S1    | Create Documentation Directory Structure           | engineer-documentation | —                      | No                |
| S2    | Configure Documentation Site Framework             | engineer-frontend      | engineer-devops        | Yes               |
| S3    | Create ADR Template and Document Initial Decisions | engineer-documentation | —                      | No                |
| S4    | Create Root Documentation Files                    | engineer-documentation | —                      | No                |
| S5    | Create Package Documentation Templates             | engineer-documentation | —                      | No                |
| S6    | Create CLAUDE.md Epic Template                     | engineer-documentation | —                      | No                |
| S7    | Integrate Documentation Quality Gates              | engineer-devops        | engineer-documentation | Yes               |

## Role Assignments Rationale

### S1: Create Documentation Directory Structure

**Primary: engineer-documentation**

The story involves creating directory structure with `.gitkeep` files and updating file-structure.md. This is straightforward documentation infrastructure work requiring no technical integration.

### S2: Configure Documentation Site Framework

**Primary: engineer-frontend**

Configuring Nextra (Next.js-based documentation framework) requires frontend expertise including:

- React/Next.js configuration
- Theme customization (TypeScript/TSX)
- Responsive layout and dark mode implementation
- Search functionality integration
- Accessibility compliance (WCAG 2.1)

**Secondary: engineer-devops**

DevOps involvement needed for:

- Turborepo build pipeline integration (`turbo.json` configuration)
- Vercel preview deployment configuration
- Workspace configuration in `pnpm-workspace.yaml`

**Hand-off**: Frontend completes site configuration and local development setup → DevOps integrates with build pipeline and deploys preview infrastructure.

### S3: Create ADR Template and Document Initial Decisions

**Primary: engineer-documentation**

Creating ADR templates, reviewing existing ADRs (001-007) for completeness, and establishing the ADR catalog is pure documentation work. Requires understanding of ADR best practices but no technical implementation.

### S4: Create Root Documentation Files

**Primary: engineer-documentation**

Creating README.md, CONTRIBUTING.md, and SECURITY.md requires technical writing skills and understanding of project context. No code implementation needed.

### S5: Create Package Documentation Templates

**Primary: engineer-documentation**

Creating reusable templates for package documentation (README, ARCHITECTURE, CONTRIBUTING, TESTING) is documentation work. Templates guide structure without implementing code.

### S6: Create CLAUDE.md Epic Template

**Primary: engineer-documentation**

Creating AI context documentation template requires understanding of documentation best practices and reference structuring. No technical implementation beyond markdown.

### S7: Integrate Documentation Quality Gates

**Primary: engineer-devops**

Quality gate infrastructure requires DevOps expertise:

- GitHub Actions CI workflow creation
- Pre-commit hook integration with Husky
- Shell script creation for validation
- Tool configuration (markdownlint-cli2, markdown-link-check)
- JSDoc coverage validation setup

**Secondary: engineer-documentation**

Documentation updates needed:

- CONTRIBUTING.md updates for bypass procedures
- Configuration file documentation

**Hand-off**: DevOps creates infrastructure and validation scripts → Documentation updates guidance and troubleshooting content.
