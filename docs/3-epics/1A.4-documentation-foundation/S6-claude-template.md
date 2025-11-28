# Story 1A.4.S6: Create CLAUDE.md Epic Template

> **To implement this story:** Read the Technical Requirements, create the CLAUDE.md template file following TAD patterns and root documentation structure, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Documentation Foundation](./EPIC.md)
- **Depends On**: [S4: Create Root Documentation Files](./S4-root-docs.md)
- **Blocks**: [S7: Integrate Documentation Quality Gates](./S7-docs-quality-gates.md)
- **Runs in Parallel With**: None (depends on S4 completion)

## User Story

**As a** developer implementing an epic using AI assistance (Claude)
**I want** a standardized CLAUDE.md template at the epic level
**So that** I can provide consistent context to Claude Code for epic implementation while maintaining alignment with project standards, architecture patterns, and coding conventions

## Acceptance Criteria

- [ ] CLAUDE.md template created at `docs/0-process/references/claude-epic-template.md`
- [ ] Template includes all essential context sections: project overview, epic context, technical stack, architecture patterns, coding standards, file structure, and implementation guidance
- [ ] Template references existing documentation (README, CONTRIBUTING, TAD, ADRs) rather than duplicating content
- [ ] Template is concise yet comprehensive (target 150-250 lines)
- [ ] Markdown linting passes with no errors
- [ ] Template follows patterns from root documentation (S4)

## Technical Requirements

### Files to Create

| Path                                                      | Purpose                                                |
| --------------------------------------------------------- | ------------------------------------------------------ |
| `docs/0-process/references/claude-epic-template.md`       | Template for epic-level CLAUDE.md files               |
| `docs/0-process/references/claude-epic-template-usage.md` | Usage guide for CLAUDE.md template (optional guidance) |

### Files to Modify

| Path | Changes |
| ---- | ------- |
| N/A  | N/A     |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

No additional dependencies required for this story. Uses existing markdownlint configuration from Epic 1A.2.

### Configuration Details

N/A - This story creates documentation template files only, no configuration changes required.

## Test Requirements

### Manual Verification

- [ ] **Template Completeness**: Review template against epic implementation workflow to ensure all necessary context is included
- [ ] **Reference Links**: Verify all links to TAD, ADRs, README, CONTRIBUTING resolve correctly
- [ ] **Template Usability**: Test template by creating a sample CLAUDE.md for a hypothetical epic to ensure clarity
- [ ] **Conciseness Check**: Ensure template doesn't duplicate content available in referenced documents

### Automated Tests

- [ ] Markdown linting passes for template file (via markdownlint-cli2)
- [ ] Link validation passes (no broken internal/external links)

### Integration Tests

N/A - Template file; integration testing deferred to S7 (Documentation Quality Gates).

### Verification Commands

```bash
# Lint markdown template
pnpm markdownlint-cli2 "docs/0-process/references/claude-epic-template.md"

# Verify template links are valid
pnpm markdown-link-check docs/0-process/references/claude-epic-template.md

# Optional: Spell check
pnpm cspell "docs/0-process/references/claude-epic-template.md"
```

## Implementation Notes

### Implementation Sequence

1. **Analyze Context Requirements**
   - Review EPIC.md and story files to understand what context AI needs
   - Identify patterns from README and CONTRIBUTING that should be referenced
   - Determine essential vs. nice-to-have sections

2. **Create Template Structure**
   - Project overview (link to README)
   - Epic-specific context (EPIC.md reference, goals, acceptance criteria)
   - Technical stack (link to TAD canonical versions)
   - Architecture patterns (link to TAD sections)
   - Coding standards (link to CONTRIBUTING and coding-standards.md)
   - File structure and conventions (link to file-structure.md)
   - Story implementation guidance (link to story files)
   - Testing requirements (link to testing standards)
   - Quality gates and pre-commit hooks

3. **Add Usage Instructions**
   - When to create CLAUDE.md (at epic start)
   - Where to place it (epic directory root)
   - How to customize for specific epic
   - When to update it (as epic evolves)

### Key Concepts

- **AI Context Optimization**: Provide just enough context for AI to understand project without overwhelming token limits
- **Reference Over Duplication**: Link to canonical sources (TAD, ADRs) rather than copying content
- **Epic-Scoped**: Template focuses on epic-level context, not individual stories (stories reference EPIC.md)
- **Living Document**: CLAUDE.md should be updated as epic progresses if patterns or constraints change

### Common Patterns

Reference the TAD for documentation patterns:

- [TAD: Documentation Pyramid](/docs/2-technical/2-tad-documentation.md#documentation-layers) - Level 4 (CONTEXT)
- [TAD: Documentation Structure](/docs/2-technical/2-tad-documentation.md#documentation-structure) - Epic specification patterns

Key pattern notes for this story:

- CLAUDE.md serves as AI assistant context, not human documentation (different from other docs)
- Should be concise enough to fit in AI context window while comprehensive enough for implementation
- Must reference canonical sources to avoid version drift

### Troubleshooting

| Issue                                      | Cause                                | Solution                                                       |
| ------------------------------------------ | ------------------------------------ | -------------------------------------------------------------- |
| Template too verbose (>300 lines)         | Too much duplicated content          | Replace detailed sections with links to TAD/ADRs               |
| Missing essential context for AI           | Template too minimal                 | Add critical patterns that aren't easily found in linked docs  |
| Template doesn't match actual epic needs   | Generic template without customization | Add notes on which sections to expand per epic type           |
| Broken links to TAD sections               | TAD structure changed                | Update links; consider using stable anchors in TAD             |

### Reference Materials

- [Anthropic: Claude Code Documentation](https://code.claude.com/docs/en) - Understanding Claude Code context requirements
- [TAD: Documentation Architecture](/docs/2-technical/2-tad-documentation.md) - Documentation structure patterns
- Root documentation files created in S4 (README, CONTRIBUTING)

## Estimated Effort

**Size**: S (3h)

**Breakdown**:

- Template structure and content: 1.5h
- Usage guide creation: 0.5h
- Testing with sample epic: 0.5h
- Refinement and review: 0.5h

## Architecture Decisions

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: Documentation Pyramid](/docs/2-technical/2-tad-documentation.md#documentation-layers) - CLAUDE.md is Level 4 (CONTEXT) documentation
- [TAD: Documentation Structure](/docs/2-technical/2-tad-documentation.md#documentation-structure) - Template location and organization

### Story-Specific Decisions

#### AD-1A.4.S6.1: CLAUDE.md Placement at Epic Level

**Scope**: Story-specific (does not affect other stories)

**Decision**: Place CLAUDE.md template for use at epic directory level (`docs/3-epics/{epic}/CLAUDE.md`), not at story level.

**Rationale**:

- Epic provides sufficient context scope for AI implementation
- Avoids duplication across multiple story CLAUDE.md files
- Stories reference EPIC.md which includes necessary context
- Reduces maintenance burden (one CLAUDE.md per epic vs. one per story)
- AI can read story files directly when implementing specific stories

**Consequences**:

- Single CLAUDE.md maintained per epic
- Story-specific context comes from reading story .md files
- CLAUDE.md updated if epic-wide patterns or constraints change
- Developers update CLAUDE.md at epic start, not for each story

**Alternatives Considered**:

- **Story-level CLAUDE.md**: One per story - Rejected due to duplication and maintenance burden
- **Repository-level CLAUDE.md only**: Single file for entire repo - Rejected because epic-specific context (like domain patterns, epic goals) wouldn't fit well

#### AD-1A.4.S6.2: Template Length Target (150-250 lines)

**Scope**: Story-specific (does not affect other stories)

**Decision**: Target template length of 150-250 lines, optimized for AI context consumption.

**Rationale**:

- AI context windows are large but finite (Claude has ~200K tokens)
- Concise template leaves room for AI to load story files, TAD sections, code files
- Links to detailed docs (TAD, ADRs) allow AI to fetch specifics when needed
- Avoids overwhelming AI with redundant information

**Consequences**:

- Template must be information-dense with clear structure
- Heavy reliance on links to canonical sources
- May require developers to point AI to specific TAD sections for complex patterns
- Faster AI processing with focused context

**Alternatives Considered**:

- **Comprehensive CLAUDE.md (500+ lines)**: Include all TAD content inline - Rejected because it duplicates docs and consumes AI context budget
- **Minimal CLAUDE.md (<100 lines)**: Only links, no content - Rejected because AI would need too many fetches to get started

## Out of Scope

The following items are explicitly NOT part of this story:

- **Story-level CLAUDE.md templates** - Template is epic-scoped only (see AD-1A.4.S6.1)
- **Repository-level CLAUDE.md** - Project-level context comes from README/CONTRIBUTING
- **CLAUDE.md for non-epic use cases** - Template designed specifically for epic implementation
- **AI prompt engineering best practices** - Template provides context structure, not prompt guidance
- **Automated CLAUDE.md generation** - Template is manually customized per epic
- **Integration with Claude Code CLI** - Template is documentation only, no tooling integration

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S4: Create Root Documentation Files** - CLAUDE.md template references README, CONTRIBUTING patterns and content structure

### Enables (Unblocks These Stories)

- **S7: Integrate Documentation Quality Gates** - CLAUDE.md template will be validated by quality gates (markdown linting)

## References

### Epic & TAD References

- [EPIC.md: Overview](./EPIC.md#overview) - Epic goals for documentation foundation
- [EPIC.md: Key Deliverables](./EPIC.md#overview) - CLAUDE.md template mentioned
- [TAD: Documentation Architecture](/docs/2-technical/2-tad-documentation.md) - Documentation structure and patterns
- [TAD: Documentation Layers](/docs/2-technical/2-tad-documentation.md#documentation-layers) - Level 4 (CONTEXT) documentation
- [TAD: Documentation Structure](/docs/2-technical/2-tad-documentation.md#documentation-structure) - Epic specification location

### ADR References

- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md) - Architecture context for template
- [ADR-002: pnpm as Package Manager](/docs/2-technical/adr/002-pnpm-package-manager.md) - Development workflow context

### External Documentation

- [Anthropic: Claude Code](https://code.claude.com/docs/en) - Claude Code capabilities and context handling
- [Anthropic: Prompt Engineering Guide](https://docs.anthropic.com/en/docs/prompt-engineering) - Context optimization principles

## Verification Checklist

### Pre-Verification

- [ ] S4 (Root Documentation Files) completed - README, CONTRIBUTING available to reference
- [ ] Local environment has markdownlint-cli2 installed (from Epic 1A.2)
- [ ] Access to TAD and ADR files for reference link testing

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] Template length within target range (150-250 lines)
- [ ] No markdownlint errors
- [ ] All reference links verified (internal links resolve)
- [ ] Template reviewed by at least one other team member
- [ ] Sample CLAUDE.md created for test epic to validate usability

### Documentation

- [ ] Template includes clear section headers with purpose explanations
- [ ] Links to canonical sources rather than duplicating content
- [ ] Usage instructions provided (when/where/how to use template)
- [ ] Template is self-explanatory for developers new to AI-assisted development

### Git Hygiene

- [ ] Conventional commit message used: `docs(templates): add CLAUDE.md epic template`
- [ ] No unrelated changes included
- [ ] PR description explains template purpose and usage

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
