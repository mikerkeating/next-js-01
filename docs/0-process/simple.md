Epic - `1A.1-monorepo-foundation`
Epic - `1A.1-monorepo-foundation`, `1A.2-package-management`, `1A.3-testing-foundation`, `1A.4-documentation-foundation`, `1A.5-basic-cicd`

## Generate List of Epics - DONE

For the list of epics below, based on docs/1-product/3-roadmap.md, generate a new markdown file with, for each epic, a heading line (at ### level) and a single line underneath as per `usage` and `example` below

> **Usage:** `execute @docs/0-process/references/epic-details-prompt-template.md for Epic {EpicID}`
>
> Example: `execute @docs/0-process/references/epic-details-prompt-template.md for Epic 1A.1`

### list

- 0A.1: Steel Thread Deployment
- 1A.1: Monorepo Foundation
- 1A.2: Package Management & Quality Gates
- 1A.3: Testing Foundation
- 1A.4: Documentation Foundation
- 1A.5: Basic CI/CD Pipeline
- 2A.1: Configuration Package
- 2A.2: Database Infrastructure (generic schema patterns)
- 2A.3: Observability Package
- 2A.4: Analytics Infrastructure (generic event system)
- 2A.5: UI Component Library (generic components only)
- 2A.6: Middleware Package (generic patterns)
- 2A.7: Auth Infrastructure (generic Clerk setup)
- 2A.8: API Client Package
- 3A.1: CDN & Asset Management Application
- 3A.2: Routing Application Shell

----

## Generate epics' details via script - DONE

`./scripts/run-next-story-prompt-auto.sh`

## Check the epic files vs templates - DONE

We now have the `EPIC.md` files for the following epics. Sense check these vs `/docs/0-process/references/epic-details-template.md` and `/docs/0-process/references/epic-details-prompt-template.m`  in case we need to improve the files. 

= some small tweaks

## Check the epic files vs the Roadmap Phase - DONE

We now have the `EPIC.md` files for the following epics. Sense check these against `/docs/1-product/3-roadmap.md` to verify that these will deliver the `### PLATFORM FOUNDATION (Generic)`. Does the content of the epic.md files align with @docs/1-product/3-roadmap.md? Are there any gaps that need to be resolved?

- 0A.1: Steel Thread Deployment
- 1A.1: Monorepo Foundation
- 1A.2: Package Management & Quality Gates
- 1A.3: Testing Foundation
- 1A.4: Documentation Foundation
- 1A.5: Basic CI/CD Pipeline
- 2A.1: Configuration Package
- 2A.2: Database Infrastructure (generic schema patterns)
- 2A.3: Observability Package
- 2A.4: Analytics Infrastructure (generic event system)
- 2A.5: UI Component Library (generic components only)
- 2A.6: Middleware Package (generic patterns)
- 2A.7: Auth Infrastructure (generic Clerk setup)
- 2A.8: API Client Package
- 3A.1: CDN & Asset Management Application
- 3A.2: Routing Application Shell

---

## List Stories for an Epic - `1A.1-monorepo-foundation` - DONE

For the list of stories under `## Stories` of `docs/3-epics/1A.1-monorepo-foundation/EPIC.md`, generate a new markdown file `docs/3-epics/1A.1-monorepo-foundation/story-details-prompts.md` with, for each story, a heading line (at ### level) and a single statement underneath as per `usage` and `example` below. Wrap each statement within ````markdown` block

> **Usage:** `execute @docs/0-process/references/story-details-prompt-template.md for Story {StoryID} within Epic {EpicID}`
>
> Example: `execute @docs/0-process/references/story-details-prompt-template.md for Story S1 within Epic 0A.1`

## Generate Stories for an Epic - DONE

`./scripts/run-next-story-prompt-auto.sh --prompts-file docs/3-epics/1A.1-monorepo-foundation/story-details-prompts.md`

## Check the stories vs the template - `1A.1-monorepo-foundation`

We now have the story md files for the `docs/3-epics/1A.1-monorepo-foundation/EPIC.md` within `docs/3-epics/1A.1-monorepo-foundation`. Sense check these vs `/docs/0-process/references/story-details-template.md` and `/docs/0-process/references/story-details-prompt-template.md` in case we need to improve the prompt or template. 

## Check the stories vs the epic - `1A.1-monorepo-foundation`

We now have the story md files for the `docs/3-epics/1A.1-monorepo-foundation/EPIC.md` within `docs/3-epics/1A.1-monorepo-foundation`. Sense check these vs `docs/3-epics/1A.1-monorepo-foundation/EPIC.md` to validate the these stories will deliver the acceptance criteria in the epic. 

---

Use the .claude/agents/engineering-manager.md subagent to evalate each story within `docs/3-epics/1A.1-monorepo-foundation`. The engineering manager should identify the engineering roles (e.g. backend, database, devops, frontend, fullstack) for each story. There should be a primary role and may be a secondary role. If a handoff is needed from primary to secondary role, this should be noted. Output a `## Resourcing Table` into a new markdown file: `docs/3-epics/1A.1-monorepo-foundation/story-resourcing.md`. The output should not include code, sequencing, sizing, critical path analysis, dependencies or other information which exists in existing files.

---

## Generate list of stories with implementation prompts

For the stories listed in `## Resourcing Table` of `docs/3-epics/1A.1-monorepo-foundation/story-resourcing.md`, generate a new markdown file `docs/3-epics/1A.1-monorepo-foundation/story-implementation-prompts.md` with, for each story, a heading line (at ### level) and a single statement underneath as per `usage` and `example` below. Wrap each statement within ````markdown` block

> **Usage:** `use @.claude/agents/[agent].md to execute @docs/0-process/references/story-dev-prompt.md for [story-path]`
>
> Example: `use @.claude/agents/engineer-backend.md to execute @docs/0-process/references/story-dev-prompt.md for docs/3-epics/1A.1-monorepo-foundation/S2-env-config.md`

## Implement the stories 

`./scripts/run-next-story-prompt-auto.sh --prompts-file docs/3-epics/1A.1-monorepo-foundation/story-implementation-prompts.md`

---

## Check the stories deliver the epic `1A.1-monorepo-foundation`

> **Usage:** `execute @docs/0-process/references/epic-story-check-prompt-template.md for Epic 1A.1`
>
> Example: `execute @docs/0-process/references/epic-story-check-prompt-template.md for Epic 0A.1`


---

`Use docs/2-technical/references/commit-guidelines.md to generate a GitHub commit message and commit. Do not push.`
 and push the changes`

`Update @docs/3-epics/0A.1-steel-thread/S7-github-actions.md  to reflect this change. Add to the Lessons Learned section at the bottom of the doc.`



---

- [x] Run the stories left to do
- [ ] Run story eval
- [ ] check the story-eval file
- [ ] Make decisions and record
- [ ] Run the prompts for `1A.1-monorepo-foundation`


The complete workflow is now:

1. epic-details-prompt-template.md  →  EPIC.md (epic definition)
           ↓
2. story-details-prompt-template.md  →  S1.md, S2.md, ... (story details)
           ↓
3. epic-story-check-prompt-template.md  →  story-eval.md (reconciliation)
           ↓
4. story-dev-prompt.md  →  implement stories

When a story is completed, we want to document the implementation using a template like @

This template may need improvements to align with our recent changes. The @ may need a change and must also ensure there is no separate verificatin report.     