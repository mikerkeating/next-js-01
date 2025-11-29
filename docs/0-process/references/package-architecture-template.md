# Package ARCHITECTURE.md Template

> **Usage**: Copy this template to `packages/{name}/docs/ARCHITECTURE.md` when creating a new package. Replace placeholders (in `{braces}`) with actual content.
>
> **Audience**: Package maintainers (internal developers who build and maintain this package)
>
> **TAD Reference**: [Two Audiences Strategy](/docs/2-technical/2-tad-documentation.md#two-audiences-strategy) | [Documentation Layers](/docs/2-technical/2-tad-documentation.md#documentation-layers)

---

# @repo/{package-name} Architecture

Internal architecture documentation for maintainers of the {package-name} package.

## Overview

{2-3 sentences explaining the package's purpose, what problem it solves, and its role in the overall system.}

### Package Responsibilities

- {Primary responsibility 1}
- {Primary responsibility 2}
- {Primary responsibility 3}

### What This Package Does NOT Do

{Clarify boundaries to prevent scope creep.}

- {Out of scope item 1}
- {Out of scope item 2}

---

## Package Structure

```
packages/{package-name}/
├── src/
│   ├── index.ts              # Public API exports
│   ├── {directory1}/         # {Purpose of this directory}
│   │   ├── {file1}.ts        # {Brief description}
│   │   └── {file2}.ts        # {Brief description}
│   ├── {directory2}/         # {Purpose of this directory}
│   │   └── ...
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts
│   └── utils/                # Internal utilities (not exported)
│       └── ...
├── tests/                    # Test files
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── docs/
│   ├── ARCHITECTURE.md       # This file
│   ├── CONTRIBUTING.md       # Contribution guide
│   └── TESTING.md            # Testing strategy
├── package.json
├── tsconfig.json
└── README.md                 # Consumer + maintainer documentation
```

### Key Files

| File                 | Purpose                                   |
| -------------------- | ----------------------------------------- |
| `src/index.ts`       | Public API surface - all consumer exports |
| `src/{main-file}.ts` | {Primary implementation}                  |
| `src/types/index.ts` | TypeScript interfaces and types           |
| `{other key files}`  | {Purpose}                                 |

---

## Design Decisions

### {Decision 1 Title}

**Decision**: {What was decided}

**Rationale**: {Why this approach was chosen}

**Consequences**: {Trade-offs and implications}

**ADR**: [{ADR number and title}](/docs/2-technical/adr/{adr-file}.md) _(if an ADR exists)_

### {Decision 2 Title}

**Decision**: {Description}

**Rationale**: {Reasoning}

**Consequences**: {Trade-offs}

### {Decision 3 Title}

{Continue pattern for other significant decisions.}

---

## Key Concepts

### {Concept 1}

{Explain a core concept or abstraction that maintainers need to understand.}

### {Concept 2}

{Another important concept.}

---

## Key Flows

### {Flow 1 Name}

{Description of what triggers this flow and its purpose.}

```
{Step 1}
    ↓
{Step 2}
    ↓
{Step 3}
    ↓
{Step 4}
```

**Code Path**: `{file1}.ts` → `{file2}.ts` → `{file3}.ts`

### {Flow 2 Name}

{Another important flow in the package.}

```
{FlowDiagram}
```

---

## Dependencies

### Internal Dependencies

| Package            | Purpose                         |
| ------------------ | ------------------------------- |
| `@repo/{package}`  | {Why this dependency is needed} |
| `@repo/{package2}` | {Purpose}                       |

### External Dependencies

| Package          | Purpose                         |
| ---------------- | ------------------------------- |
| `{npm-package}`  | {Why this dependency is needed} |
| `{npm-package2}` | {Purpose}                       |

---

## Performance Considerations

{Document any performance-sensitive areas and the approach taken.}

- **{Area 1}**: {Description and approach}
- **{Area 2}**: {Description and approach}
- **Target Metrics**: {Any specific performance targets, e.g., "<50ms response time"}

---

## Security Considerations

{Document security-relevant aspects of this package.}

- **{Security aspect 1}**: {How it's handled}
- **{Security aspect 2}**: {Approach}
- **Input Validation**: {Where and how inputs are validated}
- **Sensitive Data**: {How sensitive data is handled, if applicable}

---

## Error Handling

### Error Types

{Document the types of errors this package can produce.}

| Error Type     | When Thrown | Recovery            |
| -------------- | ----------- | ------------------- |
| `{ErrorType1}` | {Condition} | {How to handle}     |
| `{ErrorType2}` | {Condition} | {Recovery approach} |

### Error Propagation

{Explain how errors flow through the package and how they should be handled by consumers.}

---

## Testing Strategy

See [TESTING.md](./TESTING.md) for detailed testing documentation.

**Summary**:

- **Unit Tests**: {What's unit tested}
- **Integration Tests**: {What's integration tested}
- **Coverage Target**: {X%}

---

## Future Improvements

{Track planned improvements and technical debt. Remove items as they're completed.}

- [ ] {Planned improvement 1}
- [ ] {Planned improvement 2}
- [ ] {Technical debt item to address}

---

## Changelog

{Major architectural changes. For detailed version history, see package.json or CHANGELOG.md.}

| Date         | Change                             |
| ------------ | ---------------------------------- |
| {YYYY-MM-DD} | {Significant architectural change} |
| {YYYY-MM-DD} | Initial architecture               |

---

## Related Documentation

- [README.md](../README.md) - Package overview and consumer documentation
- [CONTRIBUTING.md](./CONTRIBUTING.md) - How to contribute
- [TESTING.md](./TESTING.md) - Testing strategy and running tests
- [TAD: Package Documentation](/docs/2-technical/2-tad-documentation.md#documentation-structure) - Documentation standards

---

> **Template Version**: 1.0
> **Template Source**: [package-architecture-template.md](/docs/0-process/references/package-architecture-template.md)
