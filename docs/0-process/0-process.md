## Process

### Development Model

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CLAUDE CODE DEVELOPMENT WORKFLOW                  │
├─────────────────────────────────────────────────────────────────────┤
│  CLAUDE.md (Epic Spec)                                              │
│       ↓                                                             │
│  Claude Code Agent (Implementation)                                 │
│       ↓                                                             │
│  Automated Tests (Vitest/Playwright)                                │
│       ↓                                                             │
│  AI Code Review (Claude Reviewer Agent)                             │
│       ↓                                                             │
│  GitHub Actions (Lint/Type/Test/Security)                           │
│       ↓                                                             │
│  Preview Deployment (Vercel)                                        │
│       ↓                                                             │
│  E2E Validation (Playwright on Preview URL)                         │
│       ↓                                                             │
│  Human Approval (if required) → Merge → Production                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Claude Code Agent Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                 CLAUDE CODE STORY IMPLEMENTATION                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. READ Story file (e.g., S1-create-nextjs-app.md)                 │
│       ↓                                                             │
│  2. CHECK dependencies complete (via EPIC.md status table)          │
│       ↓                                                             │
│  3. WRITE tests first (TDD)                                         │
│       ↓                                                             │
│  4. IMPLEMENT to pass tests                                         │
│       ↓                                                             │
│  5. VERIFY acceptance criteria met                                  │
│       ↓                                                             │
│  6. UPDATE documentation                                            │
│       ↓                                                             │
│  7. COMMIT with conventional commit message                         │
│       ↓                                                             │
│  8. UPDATE story status to ✅ in EPIC.md                            │
│       ↓                                                             │
│  9. CREATE PR (or add to batch PR)                                  │
│       ↓                                                             │
│  10. PROCEED to next story (check dependency graph)                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Overview

    - [x] Product Requirements
    - [x] Technical Architecture Document
    - [x] Roadmap
    - [x] Process

### Per Epic, e.g. for `phase-3`, Epic `3.1` and Story `3.1.1`

#### Branch

- [x] Create a branch for the epic from `origin/development`, i.e. `epic-3.1`

#### Prompt for Epic Details - `3A.2`

Use the .claude/agents/tech-lead.md subagent to create the epic.md file for Epic 3A.2.

Refer to

- docs/1-product/3-roadmap.md for details of the epic - find the heading starting `### Epic 3A.2:`
- docs/1-product/5-reconciliation.md to map the epic to the TAD and its sections - find the row starting `3A.2`
- docs/2-technical/2-tad.md for the TAD
- section-specific child files of the TAD linked from within the TAD

Constraints

- If architecture decisions are required, define these in the epic.md but do not make them in this process.
- Do not generate code in the process

Use the

- docs/3-references/story-details-sizing.md as a guide for story sizing
- docs/3-references/epic-template.md as a template for epic.md
- /docs/1-product/references/file-structure.md to specify file locations

When complete, validate the epic.md file created against docs/3-references/epic-acceptance-criteria.md

### Prompts for Story Details - `1A.1.S1` and `docs/3-epics/1A.1-monorepo/EPIC.md`

Use the .claude/agents/tech-lead.md subagent to create the story details file for Story `1A.1.S1` within Epic `3A.2`.

Refer to

- docs/3-epics/1A.1-monorepo/EPIC.md for details of the epic
- Product Requirements Document and Techinal Architecture Document files referenced in the EPIC.md file

Constraints

- If architecture decisions are required, define these in the story.md but do not make them in this process.
- Do not generate code in the process

Use the

- docs/3-references/story-details-template.md as a template for story.md
- /docs/1-product/references/file-structure.md to specify file locations
- docs/3-references/coding-standards.md for coding standards

When complete, validate the epic.md file created against docs/3-references/stort-acceptance-criteria.md

#### Epic Story Eval

```
We now have a set of stories within docs/3-epics/1A.2-package-management. Evaluate these. Do these deliver docs/3-epics/1A.2-package-management/EPIC.md? Do we need any story changes?

Output your evaluation into a new file docs/3-epics/1A.2-package-management/story-eval.md
```

### Resourcing - `0A.1-steel-thread`

```markdown
Use the .claude/agents/engineering-manager.md subagent to evalate each story within docs/3-epics/0A.1-steel-thread.

The engineering manager should identify the engineering roles (e.g. backend, database, devops, frontend, fullstack) for each story. There should be a primary role and may be a secondary role. If a handoff is needed from primary to secondary role, this should be noted.

Output a resourcing table into a markdown file.

The output should not include code, sequencing, sizing, critical path analysis, dependencies or other information which exists in existing files.
```

#### todo

    - [x] Setup the epic eval script
        - skill: `epic-eval-ts-generator` (Updated 2025-11-22) (Updated 2025-11-22)
        - `Using .claude/skills/epic-eval-ts-generator/SKILL.md create epic evaluation script for Epic 3.1`
        - outputs `scripts/epic-eval/epic-eval-3.1.ts`

    - [x] Plan resources for the epic's stories
        - skill: `epic-resource-planner` (Updated 2025-11-22)
        - `Using .claude/skills/epic-resource-planner/SKILL.md, plan resources for Epic 3.1`
        - outputs `docs/product/stories/phase-3/epic-3.1/epic-3.1-resources.md`
        - outputs prompts for claude code subagents, e.g. `docs/product/stories/phase-3/epic-3.1/epic-3.1-subagent-prompts-backend-engineer.md`
    - [x] Output prompts for story execution
        - skill: `epic-story-prompt-generator` (Updated 2025-11-22)
        - `Using .claude/skills/epic-story-prompt-generator/SKILL.md, generate execution prompts for Epic 3.1`
        - outputs `docs/product/stories/phase-3/epic-3.1/epic-3.1-prompts.md`

### Stories

    - [x] For each story, run the Story Implementation Prompt
        - See below
    - [x] Run all stories in an epic
    - [ ] Evaluate the `-errors.md` files in the `testing` folder to determine if these are still errors. Consolidate valid errors into a new file `testing/errors.md`
    - [ ] After all stories complete, run epic-level quality checks:
        - [x] Run `npx pnpm@10.22.0 run lint:md:fix` across entire monorepo and fix all markdown errors
        - [ ] Run the `type-check-reporter` skill across entire monorepo and fix all type errors
        - [ ] Run the `lint-reporter` skill across entire monorepo and fix all errors
        - [ ] Run the `test-failure-reporter` skill and fix all failing tests
        - [ ] Run `turbo run build` to ensure all apps build successfully
        - [ ] Commit all quality check fixes with appropriate commit message

4. Code Review and Fix for the Epic

- [x] Create a draft pull request from the epic branch into `development`
- [ ] Use the Claude Code PR review and generate a markdown file report
- [ ] Extract Claude Code PR review recommendations/ enhancements/ observations into a markdown file report
- [ ] Run the prompt below to validate and fix
-

## Epic Implementation Prompts

```text
Branch - create a new branch based on origin/epic-3.1 as this is where all prior work is. Your branch name should include `epic-3.1`. Confirm the branch you have created.

PASTE HERE
```

## Story Implementation Prompt

```text
Branch - create a new branch based on remote origin/epic-3.1 as this is where all prior work is. Your branch name should include `story-3.1.1`. Confirm the name of the branch you have created.

MANDATORY: Follow docs/development/coding-standards.md for all code:
- Check for test type helpers BEFORE writing tests (Section 2.1)
- NEVER use `as any` - use type-safe helpers (Section 1.1)
- Use type narrowing for discriminated unions (Section 1.2)
- Run incremental quality checks after each component (Section 5.1)

Use the .claude/agents/frontend-engineer subagent with the context in /docs/stories/epic-3.1/epic-3.1-subagent-prompts-frontend-engineer.md. The task is to implement the story /docs/stories/epic-3.1/story-3.1.1.md.

If there are errors, log these into a markdown file to enable debug later: /docs/stories/epic-3.1/story-3.1.1-errors.md.

BEFORE COMMIT: Verify compliance with docs/development/coding-standards.md Pre-Commit Checklist (Section 7)
- `turbo lint` → 0 errors, 0 warnings
- `turbo type-check` → 0 errors
- `npx pnpm@10.22.0 --filter [package] test` → passing

When completed, update the story file with completion notes following docs/0-process/references/story-completion-guide.md (inline completion, no separate report file).

When completed, use docs/2-technical/references/commit-guidelines.md to generate a GitHub commit message, commit and push the changes.
```

## Epic Issue Resolver Prompt

```text
Read docs/stories/epic-3.1/epic-3.1-pr-coderabbit.md. Find the first `### Issue` which is not marked as `- FIXED`. Specify which Issue Number you have found

Check the details of the Issue and, if valid, make a plan to fix the Issue.

MANDATORY: Follow docs/development/coding-standards.md when fixing issues.

When completed, run `turbo lint --fix` and fix any remaining errors.
When completed, run `turbo type-check` and fix any errors.
When completed, update docs/stories/epic-3.1/epic-3.1-pr-coderabbit.md to mark this issue as `- FIXED`

When completed, use docs/development/commit-guidelines.md to generate a GitHub commit message and commit the changes

```

## Tools

| Tool              | Usage                 | Config                                          |
| :---------------- | :-------------------- | :---------------------------------------------- |
| GitHub Dependabot | Package Version Scans | [dependabot.yaml](../../.github/dependabot.yml) |
| Synk              | Security Scans        |                                                 |
| CodeRabbit        | Pull Request Review   | [.coderabbit.yaml](../../.coderabbit.yaml)      |
| Codacy            | Code Review           | [codacy.yaml](../../.codacy/codacy.yaml)        |

## Prompts

### Epics - 3.1 and 3.1.1

- `Using .claude/skills/epic-story-planner/SKILL.md, plan resources for Epic 3.1`
- `docs(project): epic 3.1 and stories`

### Code Review

- `npx tsx scripts/extract-coderabbit-comments-2.ts 142 2.7`
