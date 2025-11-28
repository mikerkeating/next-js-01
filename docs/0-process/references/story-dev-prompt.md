# Story Implementation Prompt

> **Usage:** `use @.claude/agents/[agent].md to execute @docs/0-process/references/story-dev-prompt.md for [story-path]`
>
> Example: `use @.claude/agents/engineer-backend.md to execute @docs/0-process/references/story-dev-prompt.md for docs/3-epics/0A.1-steel-thread/S2-env-config.md`

## Available Subagents

| Agent                       | Specialization                                                 |
| --------------------------- | -------------------------------------------------------------- |
| `engineer-backend.md`       | TypeScript/Node.js, API design, environment config, validation |
| `engineer-frontend.md`      | React, UI components, client-side logic                        |
| `engineer-fullstack.md`     | End-to-end features spanning frontend and backend              |
| `engineer-database.md`      | Data modeling, migrations, query optimization                  |
| `engineer-devops.md`        | CI/CD, deployment, infrastructure                              |
| `engineer-security.md`      | Security audits, vulnerability prevention                      |
| `engineer-qa.md`            | Testing strategies, quality assurance                          |
| `engineer-documentation.md` | Technical writing, API docs                                    |
| `tech-lead.md`              | Architecture decisions, technical direction                    |
| `engineering-manager.md`    | Process, coordination, planning                                |

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

## Implementation Workflow (TDD)

This workflow follows **Test-Driven Development (TDD)**: write failing tests first, then implement code to make them pass.

### Step 1: Understand the Story

- Read the **User Story** and **Acceptance Criteria**
- Review **Technical Requirements** (files to create/modify, dependencies)
- Check **Dependencies on Other Stories** (ensure prerequisites are complete)

### Step 2: Write Failing Tests (RED)

Before writing any implementation code:

1. Create test files for each component/module to be implemented
2. Write tests that capture the **Acceptance Criteria** as executable specifications
3. Use patterns from TAD links and [coding-standards.md](/docs/2-technical/references/coding-standards.md) Section 2 (Test Standards)
4. Run tests to confirm they fail:

```bash
pnpm test
```

All new tests should fail at this point (RED state).

### Step 3: Implement to Pass Tests (GREEN)

- Follow the **Files to Create** and **Files to Modify** tables
- Write the minimum code necessary to make tests pass
- Use patterns from TAD links in **Configuration Details** and **Common Patterns**
- Reference [canonical-versions.md](/docs/2-technical/references/canonical-versions.md) for all dependency versions
- Run tests after each implementation change:

```bash
pnpm test
```

Continue until all tests pass (GREEN state).

### Step 4: Refactor (REFACTOR)

With passing tests as a safety net:

1. Improve code quality, readability, and performance
2. Remove duplication and apply design patterns
3. Run full quality checks after refactoring:

```bash
pnpm lint
pnpm type-check
pnpm test
```

Fix issues immediately while context is fresh. All tests must remain passing after refactoring.

### Step 5: Verify Implementation

- Complete all items in **Manual Verification**
- Run **Verification Commands** from the story
- Ensure all **Acceptance Criteria** are met

### Step 6: Final Verification Checklist

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

| Test       | Command           | Result         |
| ---------- | ----------------- | -------------- |
| Lint       | `pnpm lint`       | Pass           |
| Types      | `pnpm type-check` | Pass           |
| Unit Tests | `pnpm test`       | Pass (N tests) |
| Build      | `pnpm build`      | Pass           |

### Files Changed

Beyond planned files, list any additional files created/modified:

- `path/to/file.ts` - [reason for addition/change]

### Known Issues

- **Issue**: [Description] - **Status**: [Deferred/Workaround] - **Tracking**: [Story ID or issue #]

### Lessons Learned

- [Technical insight or process improvement for future stories]
```

### Step 5: Commit Changes

1. **Commit Changes** - Use [commit-guidelines.md](/docs/2-technical/references/commit-guidelines.md) for commit message format and commit the changes
2. **Do NOT push** - Leave pushing to the user
3. **Do NOT create PR** - Leave PR creation to the user

## Reference Documents

| Document                                                                    | Purpose                   |
| --------------------------------------------------------------------------- | ------------------------- |
| [coding-standards.md](/docs/2-technical/references/coding-standards.md)     | Code quality rules        |
| [canonical-versions.md](/docs/2-technical/references/canonical-versions.md) | Dependency versions       |
| [commit-guidelines.md](/docs/2-technical/references/commit-guidelines.md)   | Commit message format     |
| [story-completion-guide.md](./story-completion-guide.md)                    | Completion sections guide |
| Story's TAD links                                                           | Implementation patterns   |
