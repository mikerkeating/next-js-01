# Story Implementation Prompts: Epic 2A.2 Database Infrastructure

> **Usage:** `use @.claude/agents/[agent].md to execute @docs/0-process/references/story-dev-prompt.md for [story-path]`

This document provides the implementation prompts for each story in the epic, based on the role assignments in [story-resourcing.md](./story-resourcing.md).

---

### S1: Create @repo/database Package Structure - DONE

```markdown
use @.claude/agents/engineer-backend.md to execute @docs/0-process/references/story-dev-prompt.md for docs/3-epics/2A.2-database-infra/S1-package-structure.md
```

---

### S2: Configure Drizzle ORM and Client - DONE

```markdown
use @.claude/agents/engineer-database.md to execute @docs/0-process/references/story-dev-prompt.md for docs/3-epics/2A.2-database-infra/S2-drizzle-config.md
```

---

### S3: Implement Connection Utilities - DONE

```markdown
use @.claude/agents/engineer-backend.md to execute @docs/0-process/references/story-dev-prompt.md for docs/3-epics/2A.2-database-infra/S3-connection-utilities.md
```

---

### S4: Set Up Migration Infrastructure - DONE

**Primary (Database):** Implement migration runner, scripts, and database configuration.

```markdown
use @.claude/agents/engineer-database.md to execute @docs/0-process/references/story-dev-prompt.md for docs/3-epics/2A.2-database-infra/S4-migration-infrastructure.md
```

**Secondary (DevOps):** After database implementation is complete, add migration validation step to CI/CD workflow.

```markdown
use @.claude/agents/engineer-devops.md to execute @docs/0-process/references/story-dev-prompt.md for docs/3-epics/2A.2-database-infra/S4-migration-infrastructure.md
```

---

### S5: Create Seed Script Framework

```markdown
use @.claude/agents/engineer-backend.md to execute @docs/0-process/references/story-dev-prompt.md for docs/3-epics/2A.2-database-infra/S5-seed-framework.md
```

---

### S6: Implement Generic Utility Functions

```markdown
use @.claude/agents/engineer-backend.md to execute @docs/0-process/references/story-dev-prompt.md for docs/3-epics/2A.2-database-infra/S6-utility-functions.md
```

---

### S7: Write Tests for Database Package

**Primary (QA):** Define test strategy, create test infrastructure, and write comprehensive test suite.

```markdown
use @.claude/agents/engineer-qa.md to execute @docs/0-process/references/story-dev-prompt.md for docs/3-epics/2A.2-database-infra/S7-tests.md
```

**Secondary (Backend):** After QA defines test structure, implement test database setup and transaction rollback helpers.

```markdown
use @.claude/agents/engineer-backend.md to execute @docs/0-process/references/story-dev-prompt.md for docs/3-epics/2A.2-database-infra/S7-tests.md
```

---

### S8: Create Documentation and Examples

```markdown
use @.claude/agents/engineer-documentation.md to execute @docs/0-process/references/story-dev-prompt.md for docs/3-epics/2A.2-database-infra/S8-documentation.md
```

---

### S9: Local Docker Database for Development

**Primary (DevOps):** Create Docker Compose configuration and db:start/db:stop scripts.

```markdown
use @.claude/agents/engineer-devops.md to execute @docs/0-process/references/story-dev-prompt.md for docs/3-epics/2A.2-database-infra/S9-local-docker-database.md
```

**Secondary (Backend):** After Docker setup is complete, implement client factory for URL-based driver selection.

```markdown
use @.claude/agents/engineer-backend.md to execute @docs/0-process/references/story-dev-prompt.md for docs/3-epics/2A.2-database-infra/S9-local-docker-database.md
```
