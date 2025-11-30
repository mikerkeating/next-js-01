Epic - `1A.4`
Epic - `1A.4-documentation-foundation`

---

## List Stories for an Epic - `1A.4-documentation-foundation` - DONE

For the list of stories under `## Stories` of `docs/3-epics/1A.4-documentation-foundation/EPIC.md`, generate a new markdown file `docs/3-epics/1A.4-documentation-foundation/story-details-prompts.md` with, for each story, a heading line (at ### level) and a single statement underneath as per `usage` and `example` below. Wrap each statement within ````markdown` block

> **Usage:** `execute @docs/0-process/references/story-details-prompt-template.md for Story {StoryID} within Epic {EpicID}`
>
> Example: `execute @docs/0-process/references/story-details-prompt-template.md for Story S1 within Epic 0A.1`

## Generate Stories for an Epic - DONE

`./scripts/run-next-story-prompt-auto.sh --prompts-file docs/3-epics/1A.4-documentation-foundation/story-details-prompts.md`

## Check the stories vs the template - `1A.4-documentation-foundation`

We now have the story md files for the `docs/3-epics/1A.4-documentation-foundation/EPIC.md` within `docs/3-epics/1A.4-documentation-foundation`. Sense-check these vs `/docs/0-process/references/story-details-template.md` and `/docs/0-process/references/story-details-prompt-template.md` in case we need to improve the prompt or template.

## Check the stories vs the epic - `1A.4-documentation-foundation`

We now have the story md files for the `docs/3-epics/1A.4-documentation-foundation/EPIC.md` within `docs/3-epics/1A.4-documentation-foundation`. Sense-check these vs `docs/3-epics/1A.4-documentation-foundation/EPIC.md` to validate the these stories will deliver the acceptance criteria in the epic.

---

Use the .claude/agents/engineering-manager.md subagent to evaluate each story within `docs/3-epics/1A.4-documentation-foundation`. The engineering manager should identify the engineering roles (e.g. backend, database, devops, frontend, fullstack) for each story. There should be a primary role and may be a secondary role. If a handoff is needed from primary to secondary role, this should be noted. Output a `## Resourcing Table` into a new markdown file: `docs/3-epics/1A.4-documentation-foundation/story-resourcing.md`. The output should not include code, sequencing, sizing, critical path analysis, dependencies or other information which exists in existing files.

---

## Generate list of stories with implementation prompts

For the stories listed in `## Resourcing Table` of `docs/3-epics/1A.4-documentation-foundation/story-resourcing.md`, generate a new markdown file `docs/3-epics/1A.4-documentation-foundation/story-implementation-prompts.md` with, for each story, a heading line (at ### level) and a single statement underneath as per `usage` and `example` below. Wrap each statement within ````markdown` block. If a secondary role is needed to complete the implementation, add the statement for the secondary role after the primary role.

> **Usage:** `use @.claude/agents/[agent].md to execute @docs/0-process/references/story-dev-prompt.md for [story-path]`
>
> Example: `use @.claude/agents/engineer-backend.md to execute @docs/0-process/references/story-dev-prompt.md for docs/3-epics/1A.4-documentation-foundation/S2-env-config.md`

## Implement the stories

`./scripts/run-next-story-prompt-auto.sh --prompts-file docs/3-epics/1A.4-documentation-foundation/story-implementation-prompts.md`

---

## Check the stories deliver the epic `1A.4-documentation-foundation`

> **Usage:** `execute @docs/0-process/references/epic-story-check-prompt-template.md for Epic 1A.4`
>
> Example: `execute @docs/0-process/references/epic-story-check-prompt-template.md for Epic 1A.1`

### Minor Comments

`Use docs/2-technical/references/commit-guidelines.md to generate a GitHub commit message and commit. Do not push/ push the change.`

`Update @docs/3-epics/0A.1-steel-thread/S7-github-actions.md  to reflect this change. Add to the Lessons Learned section at the bottom of the doc.`

### Others

- [x] Run the stories left to do
- [ ] Run story eval
- [ ] check the story-eval file
- [ ] Make decisions and record
- [ ] Run the prompts for `1A.4-documentation-foundation`

The complete workflow is now:

1. epic-details-prompt-template.md → EPIC.md (epic definition)
   ↓
2. story-details-prompt-template.md → S1.md, S2.md, ... (story details)
   ↓
3. epic-story-check-prompt-template.md → story-eval.md (reconciliation)
   ↓
4. story-dev-prompt.md → implement stories

When a story is completed, we want to document the implementation using a template like @

This template may need improvements to align with our recent changes. The @ may need a change and must also ensure there is no separate verification report.
