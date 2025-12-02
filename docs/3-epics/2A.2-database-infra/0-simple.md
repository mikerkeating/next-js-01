Epic - `2A.2-database-infra` = `2A.2`

---

## List Stories for an Epic - D0NE

For the list of stories under `## Stories` of `docs/3-epics/2A.2-database-infra/EPIC.md`, generate a new markdown file `docs/3-epics/2A.2-database-infra/story-details-prompts.md` with, for each story, a heading line (at ### level) and a single statement underneath as per `usage` and `example` below. Wrap each statement within ````markdown` block

> **Usage:** `execute @docs/0-process/references/story-details-prompt-template.md for Story {StoryID} within Epic {EpicID}`
>
> Example: `execute @docs/0-process/references/story-details-prompt-template.md for Story S1 within Epic 0A.1`

## Generate Stories for an Epic

`./scripts/run-next-story-prompt-auto.sh --prompts-file docs/3-epics/2A.2-database-infra/story-details-prompts.md`

## Check the stories vs the template

We now have the story md files for the `docs/3-epics/2A.2-database-infra/EPIC.md` within `docs/3-epics/2A.2-database-infra`. Sense-check these vs `/docs/0-process/references/story-details-template.md` and `/docs/0-process/references/story-details-prompt-template.md` in case we need to improve the prompt or template. Output the evaluation into a new file: `docs/3-epics/2A.2-database-infra/stories-vs-template.md`.

## Check the stories vs the epic

We now have the story md files for the `docs/3-epics/2A.2-database-infra/EPIC.md` within `docs/3-epics/2A.2-database-infra`. Sense-check these vs `docs/3-epics/2A.2-database-infra/EPIC.md` to validate the these stories will deliver the acceptance criteria in the epic. Output the evaluation into a new file: `docs/3-epics/2A.2-database-infra/stories-vs-roadmap.md`.

## Define the resources for the stories

Use the `.claude/agents/engineering-manager.md` subagent to evaluate each story within `docs/3-epics/2A.2-database-infra`. The engineering manager should identify the engineering roles (e.g. backend, database, devops, frontend, fullstack) for each story. There should be a primary role and may be a secondary role. If a handoff is needed from primary to secondary role, this should be noted. Output a `## Resourcing Table` into a new markdown file: `docs/3-epics/2A.2-database-infra/story-resourcing.md`. The output should not include code, sequencing, sizing, critical path analysis, dependencies or other information which exists in existing files.

## Generate list of story implementation prompts

For the stories listed in `## Resourcing Table` of `docs/3-epics/2A.2-database-infra/story-resourcing.md`, generate a new markdown file `docs/3-epics/2A.2-database-infra/story-implementation-prompts.md`. For each story and each role, include a heading line (at ### level) and a single statement underneath as per `usage` and `example` below. Wrap each statement within a `markdown` block. Where a secondary role is needed to complete the implementation, add the statement for the secondary role after the primary role, making it clear which steps are done by the primary role and which are done by the secondary role.

> **Usage:** `use @.claude/agents/[agent].md to execute @docs/0-process/references/story-dev-prompt.md for [story-path]`
>
> Example: `use @.claude/agents/engineer-backend.md to execute @docs/0-process/references/story-dev-prompt.md for docs/3-epics/2A.2-database-infra/S2-env-config.md`

## Implement the stories

`./scripts/run-next-story-prompt-auto.sh --prompts-file docs/3-epics/2A.2-database-infra/story-implementation-prompts.md`

## Check the stories deliver the epic

`execute @docs/0-process/references/epic-story-check-prompt-template.md for Epic 2A.2`

Review each item in docs/3-epics/2A.2-database-infra/epic-cloudrabbit-1.md and determine if valid. Where valid, make a plan and implement the fixes. Mark items as done or ignored.

"I'm ready to create the diff between this branch and development. Please use pr-review-toolkit to

1. Review test coverage
1. Check for silent failures
1. Verify code comments are accurate
1. Review any new types
1. General code review"

Review each item in docs/3-epics/2A.2-database-infra/epic-pr-claude-1.txt and determine if valid. Where valid, make a plan and implement the fixes. Mark items as done or ignored.

use docs/0-process/references/epic-completion-guide.md and evaluate the completion of docs/3-epics/2A.2-database-infra/EPIC.md. Output your findings into a new doc: docs/3-epics/2A.2-database-infra/epic-completion.md
