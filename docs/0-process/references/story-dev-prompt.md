# Story Implementation Prompt

> **Usage:** `execute @docs/0-process/references/story-dev-prompt.md for [story-path]`
>
> Example: `execute @docs/0-process/references/story-dev-prompt.md for docs/3-epics/0A.1-steel-thread/S1-create-nextjs-app.md`

---

## Task

Implement the specified story file, then document completion inline in the same file.

## Pre-Implementation (MANDATORY)

Before writing any code, review:
1. **The story file** - Read the full story at the provided path
2. **[Coding Standards](/docs/2-technical/references/coding-standards.md)** - Especially:
   - Section 1: Type Safety Rules (never use `as any`, use discriminated unions)
   - Section 2: Test Standards (check for test helpers before writing tests)
   - Section 5: Incremental Quality Checks
3. **TAD sections** - Follow any TAD links in the story for implementation patterns

## Implementation Workflow

### Step 1: Understand the Story
- Read the **User Story** and **Acceptance Criteria**
- Review **Technical Requirements** (files to create/modify, dependencies)
- Check **Dependencies on Other Stories** (ensure prerequisites are complete)

### Step 2: Create/Modify Files
- Follow the **Files to Create** and **Files to Modify** tables
- Use patterns from TAD links in **Configuration Details** and **Common Patterns**
- Reference [canonical-versions.md](/docs/2-technical/references/canonical-versions.md) for all dependency versions

### Step 3: Incremental Quality Checks
After completing each major component, run:
```bash
pnpm lint
pnpm type-check
pnpm test  # if tests exist
```
Fix issues immediately while context is fresh.

### Step 4: Verify Implementation
- Complete all items in **Manual Verification**
- Run **Verification Commands** from the story
- Ensure all **Acceptance Criteria** are met

### Step 5: Final Verification Checklist
Complete the story's **Verification Checklist** section:
- [ ] All acceptance criteria met
- [ ] Coding standards followed
- [ ] No lint errors
- [ ] Types compile successfully
- [ ] Tests written and passing

## Pre-Commit Validation (MANDATORY)

Must pass with zero errors before committing:
```bash
pnpm lint          # 0 errors, 0 warnings
pnpm type-check    # 0 errors
pnpm test          # all passing
```

## Error Handling

If errors occur during implementation, log them to:
`testing/story-{story-id}-errors.md`

Include:
- Error message
- File and line number
- Attempted solution
- Resolution status

## Completion (MANDATORY)

When implementation is complete, update the **story file itself** with completion details.
Do NOT create a separate completion report file.

See [story-completion-guide.md](./story-completion-guide.md) for detailed guidance on each section.

### Step 1: Update Status Section

Change the story's existing `## Status` section:
```markdown
## Status
- **State**: Complete
- **Completed**: YYYY-MM-DD
- **PR**: #{number} (if applicable)
```

### Step 2: Mark Acceptance Criteria

Update the `## Acceptance Criteria` checkboxes to show completion:
```markdown
## Acceptance Criteria
- [x] Criterion 1 - completed
- [x] Criterion 2 - completed
- [ ] Criterion 3 - deferred to S{N+1} (with explanation)
```

### Step 3: Mark Verification Checklist

Update the `## Verification Checklist` checkboxes to show completion status.

### Step 4: Add Completion Notes Section

Add a new `## Completion Notes` section at the end of the story file (before any Appendix):

```markdown
## Completion Notes

### Summary
[2-3 sentences: What was built, key outcomes, any deviations from plan]

### Test Results
| Test | Command | Result |
|------|---------|--------|
| Lint | `pnpm lint` | Pass |
| Types | `pnpm type-check` | Pass |
| Unit Tests | `pnpm test` | Pass (N tests) |
| Build | `pnpm build` | Pass |

### Files Changed
Beyond planned files, list any additional files created/modified:
- `path/to/file.ts` - [reason for addition/change]

### Known Issues
- **Issue**: [Description] - **Status**: [Deferred/Workaround] - **Tracking**: [Story ID or issue #]

### Lessons Learned
- [Technical insight or process improvement for future stories]
```

### Step 5: Commit and PR

1. **Commit Changes** - Use [commit-guidelines.md](/docs/2-technical/references/commit-guidelines.md) for commit message format
2. **Create PR** - If required, create a pull request referencing the story

## Reference Documents

| Document | Purpose |
|----------|---------|
| [coding-standards.md](/docs/2-technical/references/coding-standards.md) | Code quality rules |
| [canonical-versions.md](/docs/2-technical/references/canonical-versions.md) | Dependency versions |
| [commit-guidelines.md](/docs/2-technical/references/commit-guidelines.md) | Commit message format |
| [story-completion-guide.md](./story-completion-guide.md) | Completion sections guide |
| Story's TAD links | Implementation patterns |
