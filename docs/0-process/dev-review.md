Draft of process

- Product Roadmap
  - PRD document
- Epic
  - Include
    - Description
    - What is included
    - what is deferred
    - What is out of scope
    - How the package/ app will be used
    - How the epic can be demonstrated
    - Epic Acceptance Criteria
  - Exclude
    - Story breakdown
    - Story related
- Technical Architecture Design
  - Expected walkthrough - ref docs/0-process/coderabbit-walkthrough.md
  - Architecture
  - Integration / Interfaces
  - Story statements but not details
  - Story assignment to subagent (one subgent per story; split if needed)
  - Story sequencing & parallel development
- Story Development
  - Story
  - Task breakdown
  - Story Acceptance Criteria
- Story Implementation
  - Context checks vs TAD
  - Context checks vs Coding Standards
  - Implement Story using Test Driven Development
  - Formatting, Linting, typecheck, build, local dev
  - Claude Code pr-review-toolkit
  - Fixes
  - Coderabbit AI check
  - Fixes
  - Evaluation vs Story - story completion report
  - Pull request
  - Error detection
  - Fixes
  - Lessons Learned and updates to Coding Standards

---

## Process Review: Epic 2A.2 Analysis (2025-12-03)

### Quantitative Findings

| Metric               | Count   |
| -------------------- | ------- |
| Feature commits      | 13      |
| Fix/refactor commits | 17      |
| Total commits        | 30      |
| **Fix ratio**        | **57%** |

More than half the commits were post-implementation fixes.

### Categories of Post-Implementation Fixes

| Category                  | Examples                                                             | Rounds |
| ------------------------- | -------------------------------------------------------------------- | ------ |
| **CodeRabbit findings**   | ID pattern consistency, timer cleanup, error codes, workflow quoting | 3      |
| **PR review (Claude)**    | Doc mismatches, JSDoc accuracy, test env fallbacks                   | 2      |
| **CI/integration issues** | Postgres driver selection, env vars, E2E credentials                 | 5+     |
| **Runtime issues**        | Proxy location, ESM compatibility, lint compliance                   | 3+     |

### Root Cause Analysis

Issues caught in post-implementation review:

1. **Documentation drift** - seeding.md showed wrong environment names and counts
2. **Example inaccuracy** - JSDoc example showed 26-char ID when code uses 24
3. **Environment configuration** - CI expected different env vars than tests
4. **Nitpicks that compound** - console.warn vs console.log semantics, timer cleanup patterns
5. **Integration gaps** - Code worked in isolation but failed in CI service containers

---

## Proposed Process vs Actual Execution

| Proposed Stage                | What Actually Happened                                                                          |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| Epic (scope/AC)               | ✅ EPIC.md well-structured with dependencies, stories, acceptance criteria                      |
| Technical Architecture Design | ⚠️ Stories define tasks but no "expected walkthrough" or architecture doc before implementation |
| Story Development             | ✅ Detailed story files with acceptance criteria                                                |
| Story Implementation with TDD | ⚠️ Tests written but not always before code (based on commit order)                             |
| Claude Code pr-review-toolkit | ✅ Used - caught 4 actionable items                                                             |
| CodeRabbit AI check           | ✅ Used - 3 rounds of reviews, 49+ items triaged                                                |
| Fixes                         | ✅ Multiple fix rounds                                                                          |
| Lessons Learned               | ❓ No evidence of feedback loop updates                                                         |

---

## What's Working

1. **Epic structure is solid** - Dependencies, stories, and acceptance criteria are well-documented
2. **Review tooling is catching issues** - Both CodeRabbit and pr-review-toolkit find real problems
3. **Triage is documented** - `epic-cloudrabbit-1.md` and `epic-pr-claude.md` show explicit DONE/IGNORED rationale

## What's Missing (causing long fix cycles)

1. **No pre-implementation architecture review** - Draft mentions "Expected walkthrough" but implementation starts without this

2. **No "definition of done" checklist per story** - Stories complete without:
   - Doc accuracy verification
   - CI env var alignment check
   - Example code testing

3. **No gate between story completion and PR** - Multiple stories batch into one PR, then all issues surface together

4. **Review happens too late** - 10 stories completed → 1 big PR → 3 rounds of CodeRabbit → 2 rounds of PR review

## Process

- Define Outlint Epic Order
- Define Epic
- Define Technical Archictecture Design for the Epic
  - [ ] Expected file structure documented
  - [ ] Key interfaces/types defined
  - [ ] Example usage written (and tested)
  - [ ] CI env vars identified
  - [ ] Integration test strategy documented
- Define Stories for the Epic aligned to the Technical Archictecture Design
  - story completion criteria that can be automated
- Implementation
  - Implement Story
  - Pre-commit Checks (pnpm lint, typecheck, build, run locally)
  - Integration test with real DB
  - All JSDoc examples pass `tsx -e` check
  - README examples pass `tsx -e` check
  - Story-Level Review by CodeRabbit in local environment
  - Push after review
- Complete stories and review
  - Full review toolkit
  - Cross story implementation
  - Deployment

## Epic Order Updated

```text
Phase 0: Developer Setup
  ├── development    - VS Code, Claude Code, CodeRabbit, Codacy, Snyk

Phase 1: Monorepo Foundation
  ├── monorepo       - Turborepo structure from start
  ├── packages       - Workspace configuration
  ├── config         - Shared TypeScript, ESLint configs
  ├── quality        - Prettier, commitlint, lint-staged, markdownlint, husky

Phase 2: Core Apps (Empty Shells)
  ├── next app       - apps/routing (main Next.js app)
  ├── next api       - apps/api API routes structure
  ├── middleware     - Middleware package inc basic auth for website
  ├── health         - Health check package/endpoint

Phase 0: Infrastructure Setup (when there is something to commit and push)
  ├── github         - Repository, branch protection
  ├── vercel         - Project, env vars, deployment

Phase 3: Test & Deploy Infrastructure
  ├── testing        - Vitest + RTL + Playwright from start
  ├── documentation  - Nextra docs app
  ├── cicd           - Full CI/CD pipeline

Phase 4: Core Packages
  ├── observability  - Logging, metrics
  ├── json content   - Content display (not full content management)
  ├── database       - Drizzle ORM
  ├── analytics      - Event tracking
  ├── ui             - Component library
  ├── middleware     - Full middleware patterns
  ├── api client     - API utilities

Phase 5: Platform Apps
  ├── cdn            - Asset management
  ├── routing        - Full routing implementation
```
