# CLAUDE.md Template Usage Guide

This guide explains how to use the [CLAUDE.md epic template](./claude-epic-template.md) for AI-assisted epic implementation.

## Purpose

CLAUDE.md files provide structured context for AI assistants (specifically Claude Code) when implementing epics. They serve as a "briefing document" that helps AI understand:

- What this epic is trying to accomplish
- Where to find relevant documentation
- Which patterns and standards to follow
- Where code should be created or modified

## When to Create

Create a CLAUDE.md file:

- **At epic start**: Before implementing the first story
- **Location**: `docs/3-epics/{epic-id}/CLAUDE.md`
- **Not at story level**: Stories reference the epic's CLAUDE.md

## How to Use

### Step 1: Copy the Template

```bash
cp docs/0-process/references/claude-epic-template.md docs/3-epics/{epic-id}/CLAUDE.md
```

### Step 2: Fill in Epic-Specific Sections

Replace all `{placeholder}` values with actual content:

| Placeholder           | Replace With                                     |
| --------------------- | ------------------------------------------------ |
| `{EPIC_ID}`           | Epic identifier (e.g., `1A.4`)                   |
| `{Epic Title}`        | Human-readable epic name                         |
| `{Deliverable N}`     | Key outputs from the epic                        |
| `{Link to TAD...}`    | Relevant TAD section links                       |
| `{Pattern Name}`      | Epic-specific coding patterns                    |
| `{Pitfall N}`         | Known issues to avoid                            |
| `{dependency-name}`   | Epic-specific npm packages                       |
| `{YYYY-MM-DD}`        | Date of last update                              |

### Step 3: Customize as Needed

- **Remove unused sections**: Delete patterns or dependencies not relevant to your epic
- **Add epic-specific content**: Include domain knowledge, constraints, or patterns
- **Keep links current**: Verify all referenced documents exist

## Template Structure

The template follows a "context funnel" pattern:

1. **Project Overview**: Broad context (links to README)
2. **Epic Context**: Specific goals and deliverables
3. **Technical Standards**: Rules that apply everywhere
4. **Architecture References**: Where to find design decisions
5. **File Structure**: Where code goes
6. **Implementation Guidance**: How to work within this epic
7. **Testing Requirements**: Quality expectations
8. **Dependencies**: Specific packages needed
9. **Quick Reference**: Fast access to common links

## Target Length

**150-250 lines** is the target. This ensures:

- Enough context for AI to understand the epic
- Room in context window for story files, TAD sections, and code
- Focused content without duplication

## What NOT to Include

Avoid duplicating content that exists elsewhere:

| Don't Duplicate                 | Instead Link To                                        |
| ------------------------------- | ------------------------------------------------------ |
| Full coding standards           | `/docs/2-technical/references/coding-standards.md`     |
| Complete TAD content            | `/docs/2-technical/2-tad.md` + specific sections       |
| ADR full text                   | `/docs/2-technical/adr/{adr-file}.md`                  |
| Detailed story requirements     | `./S{N}-{slug}.md`                                     |
| Package documentation           | `packages/{name}/README.md`                            |

## When to Update

Update the CLAUDE.md file when:

- **New patterns emerge**: Common code patterns discovered during implementation
- **ADRs are created**: New architectural decisions made for this epic
- **Pitfalls are discovered**: Team encounters issues others should avoid
- **Dependencies change**: New packages needed or versions updated

## Example: Filled Template

See actual CLAUDE.md files in completed epics for real-world examples:

- `docs/3-epics/{completed-epic-1}/CLAUDE.md`
- `docs/3-epics/{completed-epic-2}/CLAUDE.md`

## AI Assistant Instructions

When working with Claude Code on an epic:

1. Point to the epic's CLAUDE.md at session start
2. Let AI read linked documentation as needed
3. Update CLAUDE.md with insights discovered during implementation

## Reference

- [CLAUDE.md Template](./claude-epic-template.md)
- [Story Implementation Prompt](./story-dev-prompt.md)
- [Epic Template](./epic-details-template.md)
