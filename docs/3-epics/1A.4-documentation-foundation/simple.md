Epic - `1A.4-documentation-foundation` = `1A.4`

---

## List Stories for an Epic - DONE

For the list of stories under `## Stories` of `docs/3-epics/1A.4-documentation-foundation/EPIC.md`, generate a new markdown file `docs/3-epics/1A.4-documentation-foundation/story-details-prompts.md` with, for each story, a heading line (at ### level) and a single statement underneath as per `usage` and `example` below. Wrap each statement within ````markdown` block

> **Usage:** `execute @docs/0-process/references/story-details-prompt-template.md for Story {StoryID} within Epic {EpicID}`
>
> Example: `execute @docs/0-process/references/story-details-prompt-template.md for Story S1 within Epic 0A.1`

## Generate Stories for an Epic - DONE

`./scripts/run-next-story-prompt-auto.sh --prompts-file docs/3-epics/1A.4-documentation-foundation/story-details-prompts.md`

## Check the stories vs the template - DONE

We now have the story md files for the `docs/3-epics/1A.4-documentation-foundation/EPIC.md` within `docs/3-epics/1A.4-documentation-foundation`. Sense-check these vs `/docs/0-process/references/story-details-template.md` and `/docs/0-process/references/story-details-prompt-template.md` in case we need to improve the prompt or template.

## Check the stories vs the epic - DONE

We now have the story md files for the `docs/3-epics/1A.4-documentation-foundation/EPIC.md` within `docs/3-epics/1A.4-documentation-foundation`. Sense-check these vs `docs/3-epics/1A.4-documentation-foundation/EPIC.md` to validate the these stories will deliver the acceptance criteria in the epic.

## Define the resources for the stories - DONE

Use the .claude/agents/engineering-manager.md subagent to evaluate each story within `docs/3-epics/1A.4-documentation-foundation`. The engineering manager should identify the engineering roles (e.g. backend, database, devops, frontend, fullstack) for each story. There should be a primary role and may be a secondary role. If a handoff is needed from primary to secondary role, this should be noted. Output a `## Resourcing Table` into a new markdown file: `docs/3-epics/1A.4-documentation-foundation/story-resourcing.md`. The output should not include code, sequencing, sizing, critical path analysis, dependencies or other information which exists in existing files.

## Generate list of stories with implementation prompts - DONE

For the stories listed in `## Resourcing Table` of `docs/3-epics/1A.4-documentation-foundation/story-resourcing.md`, generate a new markdown file `docs/3-epics/1A.4-documentation-foundation/story-implementation-prompts.md` with, for each story, a heading line (at ### level) and a single statement underneath as per `usage` and `example` below. Wrap each statement within ````markdown` block. If a secondary role is needed to complete the implementation, add the statement for the secondary role after the primary role.

> **Usage:** `use @.claude/agents/[agent].md to execute @docs/0-process/references/story-dev-prompt.md for [story-path]`
>
> Example: `use @.claude/agents/engineer-backend.md to execute @docs/0-process/references/story-dev-prompt.md for docs/3-epics/1A.4-documentation-foundation/S2-env-config.md`

## Implement the stories - DONE

`./scripts/run-next-story-prompt-auto.sh --prompts-file docs/3-epics/1A.4-documentation-foundation/story-implementation-prompts.md`

## Check the stories deliver the epic `1A.4-documentation-foundation`

`execute @docs/0-process/references/epic-story-check-prompt-template.md for Epic 1A.4`

## Process CodeRabbit PR feedback - DONE

For each `###` item which is not marked `- DONE` or `- IGNORED` in docs/3-epics/1A.4-documentation-foundation/epic-1A.4-pr-coderabbit.md, evaluate the suggested change and check if it is both valid and useful.

If not, mark the `### Prompt` as `- IGNORED` and note the rationale.

If valid, implement a fix/ change and when complete, mark the item as `- DONE`.

Move to the next `### Prompt`

## Use Claude Code PR review

Use Claude Code PR Review tools to evaluate [PR 18](https://github.com/mikerkeating/next-js-01/pull/18)

## Process Claude Code PR feedback - DONE

For each `###` item which is not marked `- DONE` or `- IGNORED` in docs/3-epics/1A.4-documentation-foundation/epic-1A.4-pr-claude.md, evaluate the suggested change and check if it is both valid and useful.

If not, mark the `###` item as `- IGNORED` and move to the next `###` item.

If valid, implement a fix/ change and when complete, mark the item as `- DONE`.
