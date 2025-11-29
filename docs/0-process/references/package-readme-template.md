# Package README Template

> **Usage**: Copy this template to `packages/{name}/README.md` when creating a new package. Replace placeholders (in `{braces}`) with actual content.
>
> **TAD Reference**: [Two Audiences Strategy](/docs/2-technical/2-tad-documentation.md#two-audiences-strategy)

---

# @repo/{package-name}

{One-line description of what this package does and its primary use case.}

## Features

- {Key feature 1}
- {Key feature 2}
- {Key feature 3}

---

## Installation

```bash
pnpm add @repo/{package-name}
```

## Quick Start

{Minimal working example that demonstrates the primary use case. Should be copy-pasteable and work immediately.}

```typescript
import { {mainExport} } from "@repo/{package-name}";

// Basic usage example
const result = {mainExport}({exampleInput});
console.log(result);
```

---

## Usage

### Basic Usage

{The most common use case with a complete, working example.}

```typescript
import { {export1}, {export2} } from "@repo/{package-name}";

// Example: {describe what this example demonstrates}
{codeExample}
```

### Advanced Usage

{Power user features or less common patterns. Include multiple examples if needed.}

```typescript
// Example: {describe advanced pattern}
{
  advancedExample;
}
```

### Configuration Options

{If the package accepts configuration, document options here.}

| Option      | Type     | Default     | Description   |
| ----------- | -------- | ----------- | ------------- |
| `{option1}` | `{type}` | `{default}` | {Description} |
| `{option2}` | `{type}` | `{default}` | {Description} |

---

## API Reference

{Link to generated API documentation or provide inline reference for small packages.}

Full API documentation: [View TypeDoc](./docs/api/index.html)

### Key Exports

| Export         | Type        | Description         |
| -------------- | ----------- | ------------------- |
| `{export1}`    | `function`  | {Brief description} |
| `{export2}`    | `component` | {Brief description} |
| `{ExportType}` | `type`      | {Brief description} |

---

## Usage Guides

{Link to relevant guides in the main documentation. Remove this section if no guides exist yet.}

- [{Guide topic 1}](../../../docs/guides/{guide-file}.md)
- [{Guide topic 2}](../../../docs/guides/{guide-file}.md)

---

## Troubleshooting

### {Error message or problem description}

**Symptom**: {How the user experiences this problem}

**Cause**: {Why this happens}

**Solution**: {Step-by-step fix}

```typescript
// Example fix if applicable
{
  fixExample;
}
```

### {Another common issue}

**Symptom**: {Description}

**Cause**: {Root cause}

**Solution**: {Fix}

---

## For Maintainers

> **TAD Reference**: This section serves package maintainers per the [Two Audiences Strategy](/docs/2-technical/2-tad-documentation.md#two-audiences-strategy).

### Architecture

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for internal package structure, design decisions, and key flows.

### Development Setup

1. Clone monorepo: `git clone {repo-url}`
2. Install dependencies: `pnpm install`
3. Navigate to package: `cd packages/{package-name}`
4. Run dev mode: `pnpm dev`
5. Run tests: `pnpm test`

### Testing

See [docs/TESTING.md](./docs/TESTING.md) for testing strategy, running tests, and coverage requirements.

### Contributing

See [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) for contribution workflow, PR process, and coding standards.

### Releasing

{If versioning is configured, link to RELEASING.md. Otherwise, note that releases are managed at monorepo level.}

Releases are managed at the monorepo level. See root [CONTRIBUTING.md](/CONTRIBUTING.md) for release process.

---

## Related Packages

{List related packages in the monorepo that work with this one.}

- [`@repo/{related-package}`](/packages/{related-package}) - {Brief description of relationship}
- [`@repo/{another-package}`](/packages/{another-package}) - {Brief description}

---

## License

{License information - typically inherited from monorepo root.}

See [LICENSE](/LICENSE) in repository root.

---

> **Template Version**: 1.0
> **Template Source**: [package-readme-template.md](/docs/0-process/references/package-readme-template.md)
