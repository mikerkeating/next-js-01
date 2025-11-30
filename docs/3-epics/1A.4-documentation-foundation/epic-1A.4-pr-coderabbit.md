# CodeRabbit Comments for Epic 1A.4

**Pull Request**: [#18 - Epic 1 a.5](https://github.com/mikerkeating/next-js-01/pull/18)
**Author**: mikerkeating
**Extracted**: 2025-11-30T08:05:32.582Z

---

## Prompts for AI Agents

### Prompt 1

**File**: `.github/workflows/pr.yml`
**Lines**: 117 to 121
**Link**: [View on GitHub](https://github.com/mikerkeating/next-js-01/pull/18#discussion_r2573193441)

```
In .github/workflows/pr.yml around lines 117 to 121, the inline comment claiming
"fetch-depth: 0 required for coverage comparison with base branch" is inaccurate
because the coverage step only aggregates local coverage-summary.json files and
does no base-branch comparison; either implement the base-branch coverage
comparison feature if that's intended, or change fetch-depth to 2 (to match the
other jobs) and update the comment to reflect the current behavior (e.g.,
"fetch-depth: 2 — full history not required for coverage aggregation"); apply
the simpler change (fetch-depth: 2 and corrected comment) unless you plan to add
base-branch comparison now.
```

### Prompt 2

**File**: `.github/workflows/pr.yml`
**Lines**: 172 to 199
**Link**: [View on GitHub](https://github.com/mikerkeating/next-js-01/pull/18#discussion_r2573193442)

```
.github/workflows/pr.yml around lines 172-199: jq output values (STATEMENTS,
BRANCHES, FUNCTIONS, LINES) are used directly with bc which can fail if they are
non-numeric; after each successful jq parse, validate the extracted value is a
numeric (integer or decimal) using a regex check (e.g. ^[0-9]+(\.[0-9]+)?$), and
if it fails set the variable to 0 and log a warning to stderr; then use the
sanitized numeric variables for the echo to coverage-report.md and for the bc
accumulation so bc always receives valid numeric strings.
```

### Prompt 3

**File**: `apps/routing/src/components/Button.tsx`
**Lines**: 10
**Link**: [View on GitHub](https://github.com/mikerkeating/next-js-01/pull/18#discussion_r2573193443)

```
In apps/routing/src/components/Button.tsx around line 10, the file uses
React.ReactElement as a return type but React is not imported which causes a
TypeScript error; fix by either adding an import for React (import React from
"react";) near the other imports so React.ReactElement resolves, or change the
component's return type to JSX.Element (replace React.ReactElement with
JSX.Element) which removes the need to import React — choose one approach and
update the file accordingly.
```

### Prompt 4

**File**: `packages/testing/package.json`
**Lines**: 10
**Link**: [View on GitHub](https://github.com/mikerkeating/next-js-01/pull/18#discussion_r2573193450)

```
In packages/testing/package.json around line 10, the export path has a typo
using "././providers" which breaks module resolution; update that entry to use
the correct relative path "./providers" (pointing to "./src/providers.tsx") so
the exports mapping is valid.
```

### Prompt 5

**File**: `packages/testing/src/factories/organization.ts`
**Lines**: 44 to 49
**Link**: [View on GitHub](https://github.com/mikerkeating/next-js-01/pull/18#discussion_r2573193451)

```
In packages/testing/src/factories/organization.ts around lines 44-49 the
generateSlug function strips non-ASCII characters which loses accents/Unicode;
to fix, add slugify as a dependency for this package and replace the regex-based
implementation by importing slugify and calling it with options { lower: true,
strict: true, remove: /[*+~.()'"!:@]/g } so Unicode characters are
transliterated properly and output remains URL-safe; ensure types are installed
if needed and update imports accordingly.
```

### Prompt 6

**File**: `packages/testing/src/factories/user.ts`
**Lines**: 84 to 99
**Link**: [View on GitHub](https://github.com/mikerkeating/next-js-01/pull/18#discussion_r2573193453)

```
In packages/testing/src/factories/user.ts around lines 84-99, the factory sets
createdAt to a past date and updatedAt to now but then spreads overrides which
can produce invalid states where createdAt > updatedAt; after building the user
object merge, add a validation step that ensures temporal consistency (createdAt
<= updatedAt) and fix it deterministically (for example, if createdAt >
updatedAt set updatedAt = new Date(createdAt.getTime() + 1000) or adjust
createdAt earlier) before returning the user so overrides cannot create an
impossible timestamp ordering.
```

### Prompt 7

**File**: `packages/testing/src/mocks/handlers.ts`
**Lines**: 104 to 116
**Link**: [View on GitHub](https://github.com/mikerkeating/next-js-01/pull/18#discussion_r2573193454)

```
In packages/testing/src/mocks/handlers.ts around lines 104 to 116, the handler
unsafely asserts the request body type and can produce invalid mock users if the
payload is missing or malformed; update the handler to parse the JSON inside a
try/catch, validate required fields (email and name are present and are
strings), and if validation fails return a HttpResponse.json error with status
400 and a clear message; only construct and return the 201 mock user when
validation passes, otherwise log or return the validation error so tests get
deterministic failure feedback.
```

### Prompt 8

**File**: `packages/testing/tsconfig.json`
**Lines**: 2 to 9
**Link**: [View on GitHub](https://github.com/mikerkeating/next-js-01/pull/18#discussion_r2573193456)

```
In packages/testing/tsconfig.json around lines 2 to 9, the "types" array
currently overrides the root tsconfig's types which can drop important global
type definitions (e.g. Node). Update this package tsconfig to either remove the
"types" key so it inherits the root types, or explicitly include the root/global
types alongside the test types (for example add the same Node/other globals used
in the root config) so you don’t lose required typings for the package.
```

### Prompt 9

**File**: `scripts/aggregate-package-docs.ts`
**Lines**: 88 to 107
**Link**: [View on GitHub](https://github.com/mikerkeating/next-js-01/pull/18#discussion_r2573193460)

```
In scripts/aggregate-package-docs.ts around lines 88 to 107, the current
frontmatter closing search uses content.indexOf("---", 3) which can match
occurrences mid-line; replace that with a line-aware search that finds a
triple-dash delimiter on its own line (use a multiline regex like /^\s*---\s*$/m
applied to the content starting after the opening frontmatter) to locate the
exact end-of-frontmatter line, compute the closing delimiter's end position and
insert the source note after that line; if no such line-delimited match is
found, fall back to treating the file as having no frontmatter and prepend
generated frontmatter plus the source note as before.
```

### Prompt 10

**File**: `scripts/aggregate-package-docs.ts`
**Lines**: 112 to 133
**Link**: [View on GitHub](https://github.com/mikerkeating/next-js-01/pull/18#discussion_r2573193462)

```
In scripts/aggregate-package-docs.ts around lines 112 to 133, the cleanup loop
calls fs.unlinkSync on every entry and will throw for directories; add a
file-type check before unlinking by calling fs.lstatSync(filePath) (or
fs.statSync) and verifying the entry is a regular file (e.g., stats.isFile()) —
skip non-files (directories, symlinks, etc.) instead of attempting to unlink
them, and continue to push removed filenames only for successfully deleted files
while preserving the existing error handling for failed unlink attempts.
```

### Prompt 11

**File**: `tests/e2e/example.spec.ts`
**Lines**: 40 to 48
**Link**: [View on GitHub](https://github.com/mikerkeating/next-js-01/pull/18#discussion_r2573193464)

```
In tests/e2e/example.spec.ts around lines 40 to 48, remove the redundant await
page.waitForLoadState("domcontentloaded") (line 42) because page.goto() already
waits for load; simply delete that await call so the test relies on the
navigation's built-in waiting and then continues to retrieve the title as
before.
```

### Prompt 12

**File**: `tests/e2e/example.spec.ts`
**Lines**: 68 to 86
**Link**: [View on GitHub](https://github.com/mikerkeating/next-js-01/pull/18#discussion_r2573193465)

```
In tests/e2e/example.spec.ts around lines 68 to 86, remove the unnecessary await
page.waitForLoadState("domcontentloaded") calls after each await
page.setViewportSize(...) because setViewportSize is synchronous and doesn't
trigger navigation; simply delete the three waitForLoadState lines (lines ~71,
~79, ~84) so the test only sets viewport sizes and asserts visibility.
```

### Prompt 13

**File**: `tests/e2e/smoke/health.spec.ts`
**Lines**: 57 to 64
**Link**: [View on GitHub](https://github.com/mikerkeating/next-js-01/pull/18#discussion_r2573193468)

```
In tests/e2e/smoke/health.spec.ts around lines 57 to 64, the current ISO date
validation only checks format and will accept old or future timestamps; update
the test to also assert the timestamp is recent by parsing body.timestamp into a
Date, confirming it is valid, and then asserting that the absolute difference
between Date.now() and timestamp.getTime() is within an acceptable threshold
(e.g., <= 5000 ms). Ensure the test fails if the timestamp is invalid or outside
the recency window.
```

### Prompt 14

**File**: `tests/e2e/smoke/homepage.spec.ts`
**Lines**: 14 to 24
**Link**: [View on GitHub](https://github.com/mikerkeating/next-js-01/pull/18#discussion_r2573193469)

```
In tests/e2e/smoke/homepage.spec.ts around lines 14–24, strengthen the title
assertion by replacing the non-empty length check with an assertion against the
expected page title (or a more specific pattern) — e.g. assert title equals or
matches the known application title constant/fixture — and remove the redundant
await page.waitForLoadState("domcontentloaded") since page.goto() already waits
for load by default unless you have a specific timing reason to keep it.
```

### Prompt 15

**File**: `tests/e2e/smoke/homepage.spec.ts`
**Lines**: 26 to 33
**Link**: [View on GitHub](https://github.com/mikerkeating/next-js-01/pull/18#discussion_r2573193471)

```
In tests/e2e/smoke/homepage.spec.ts around lines 26 to 33, the test only asserts
the h1 is visible but doesn't verify its content; update the test to also assert
the heading text: if the exact heading is stable use a strict assertion (e.g.
expect(heading).toHaveText("Expected Heading")), otherwise use a relaxed
assertion to check for a key substring (e.g.
expect(heading).toContainText("Expected")); place the new assertion after the
visibility check.
```

### Prompt 16

**File**: `tests/e2e/smoke/homepage.spec.ts`
**Lines**: 35 to 42
**Link**: [View on GitHub](https://github.com/mikerkeating/next-js-01/pull/18#discussion_r2573193473)

```
In tests/e2e/smoke/homepage.spec.ts around lines 35 to 42 the test uses a weak
assertion (body not empty) which can pass when the page is broken; replace it
with checks for specific, meaningful page indicators such as asserting
visibility/presence of one or more critical selectors (e.g., header, main, a
primary CTA, or elements with data-testid attributes), or assert that expected
text appears on the page; update the test to wait for and expect those specific
locators to be visible or contain the expected text instead of checking body
emptiness.
```

### Prompt 17

**File**: `tests/e2e/smoke/homepage.spec.ts`
**Lines**: 44 to 54
**Link**: [View on GitHub](https://github.com/mikerkeating/next-js-01/pull/18#discussion_r2573193474)

```
In tests/e2e/smoke/homepage.spec.ts around lines 44 to 54, the test measures
elapsed time using Date.now() which captures Playwright test overhead rather
than the page's real load metrics; replace the Date.now() approach with a
page-level navigation timing measurement (e.g., use page.goto with appropriate
waitUntil and then call page.evaluate to read the Navigation Timing or
PerformanceNavigationTiming entries via
performance.getEntriesByType('navigation') or performance.timing) and assert
against the navigation/loadEvent timings (for example loadEventEnd - startTime
or appropriate navigation.duration) so the expect checks the browser's
navigation/load metric rather than test execution wall time.
```

### Prompt 18

**File**: `tests/e2e/smoke/homepage.spec.ts`
**Lines**: 81 to 94
**Link**: [View on GitHub](https://github.com/mikerkeating/next-js-01/pull/18#discussion_r2573193475)

```
In tests/e2e/smoke/homepage.spec.ts around lines 81 to 94, the viewport test
only asserts body visibility which doesn't validate responsive behavior; update
the test to assert actual layout changes between mobile and desktop: for mobile
set viewport and assert presence/visibility of mobile-specific elements (e.g.,
hamburger menu, collapsed nav, single-column grid or hidden desktop-only
elements) and for desktop set viewport and assert desktop-specific layout (e.g.,
visible full nav, multi-column grid, hidden mobile-only elements); use stable
selectors or accessibility roles for those elements and add waits for
network/animations if needed so the assertions reliably detect the responsive
changes.
```

### Prompt 19

**File**: `turbo.json`
**Lines**: 39 to 40
**Link**: [View on GitHub](https://github.com/mikerkeating/next-js-01/pull/18#discussion_r2573193478)

```
In turbo.json around lines 39-40 (and also at line 44), the lint task currently
depends on "^build" which forces upstream builds before linting; verify whether
your linting requires type-aware information or build artefacts — if not, remove
the "^build" dependency to speed up lint runs; if you do need type information,
replace "^build" with a dependency on "^type-check" (or add a conditional
type-check dependency) so only type-checking runs before linting; update both
occurrences accordingly and ensure the change is consistent with any CI
constraints.
```

### Prompt 20

**File**: `.github/workflows/pr.yml`
**Lines**: 232 to 238
**Link**: [View on GitHub](https://github.com/mikerkeating/next-js-01/pull/18#discussion_r2573487530)

```
.github/workflows/pr.yml lines 232-238: the workflow uses
marocchino/sticky-pull-request-comment@v2 which should be pinned to a full
commit SHA for security; replace the tag with the repository commit SHA for the
v2 release (e.g., marocchino/sticky-pull-request-comment@<full-commit-sha>),
ensuring you pick the exact commit corresponding to v2 from the action's GitHub
repo, update the uses line accordingly, and commit the change so the workflow
references the immutable SHA instead of the floating tag.
```

### Prompt 21

**File**: `apps/routing/src/lib/api.test.ts`
**Lines**: 25 to 32
**Link**: [View on GitHub](https://github.com/mikerkeating/next-js-01/pull/18#discussion_r2573487531)

```
In apps/routing/src/lib/api.test.ts around lines 25 to 32, the test currently
uses expect(data.data).toBeDefined() and then accesses data.data! with non-null
assertions; change this to narrow the type first and reuse the narrowed variable
(or use Vitest's assert) so you don't need the bang operator. Specifically,
after asserting presence, assign const users = data.data (or call
assert(data.data, "...")) and then use users.length and users[0] for the
remaining assertions.
```

### Prompt 22

**File**: `playwright.config.ts`
**Lines**: 117 to 119
**Link**: [View on GitHub](https://github.com/mikerkeating/next-js-01/pull/18#discussion_r2573487537)

```
In playwright.config.ts around lines 117 to 119, the inline comment notes no
webServer is configured but lacks user instructions; add a short, explicit note
to the project's testing docs or README (e.g., docs/TESTING.md or README.md
under "End-to-end tests") stating the prerequisites and commands to run tests
locally: how to start the app (example: "pnpm dev"), how to run E2E tests
(example: "pnpm test:e2e"), and how to use a preview or set BASE_URL if testing
against a deployed instance; place the note in a visible testing section and
keep it concise with command examples.
```

### Prompt 23

**File**: `turbo.json`
**Lines**: 58 to 58
**Link**: [View on GitHub](https://github.com/mikerkeating/next-js-01/pull/18#discussion_r2573487539)

```
In turbo.json around lines 52 to 58, the test task is marked "persistent": true
which is inappropriate for one-off test runs and prevents Turbo from detecting
completion; remove the persistent property (or set it to false) for the "test"
task, and if you need watch behavior create a separate "test:watch" task that
sets persistent: true and runs vitest in watch mode so regular CI/local test
runs complete normally.
```

### Prompt 24

**File**: `turbo.json`
**Lines**: 55
**Link**: [View on GitHub](https://github.com/mikerkeating/next-js-01/pull/18#discussion_r2573487543)

```
In turbo.json at line 55, the test task's outputs is incorrectly set to
"testing/coverage/**" while Vitest writes to "coverage"; change the test task
outputs to "coverage/**" so it matches packages/config/vitest/coverage.ts and
aligns with the test:coverage task.
```

### Prompt 25

**File**: `vitest.workspace.ts`
**Lines**: 8 to 9
**Link**: [View on GitHub](https://github.com/mikerkeating/next-js-01/pull/18#discussion_r2573496538)

```
In vitest.workspace.ts around lines 8-9, add a short note explaining Vitest's
native --project flag as an alternative way to run tests for a specific
workspace project. Mention it can be used like `pnpm test --project
<projectName>` (or `pnpm test -- --project <projectName>` depending on the CLI),
state it targets a Vitest workspace project by name, and show a brief example
such as `pnpm test --project routing`; place this sentence immediately after the
existing note about `pnpm test --filter`.
```

---
