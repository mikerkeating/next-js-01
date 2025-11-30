# MK3 Platform Documentation Site

A documentation site built with [Nextra](https://nextra.site/) that renders all markdown files from the monorepo's `/docs` directory.

## Quick Start

```bash
# From monorepo root
pnpm install

# Start development server (http://localhost:3001)
pnpm --filter docs dev

# Build for production
pnpm --filter docs build
```

## Adding Documentation

### Where to Put Documentation Files

Documentation content lives in the **monorepo root** `/docs` directory, not in `apps/docs`. The docs app uses a symlink to render this content.

```text
/docs                          # Source of truth for documentation
├── 0-process/                 # Development process docs
├── 1-product/                 # Product requirements (PRD)
├── 2-technical/               # Technical architecture (TAD, ADRs)
│   ├── 2-tad.md               # Technical Architecture Document
│   ├── adr/                   # Architecture Decision Records
│   └── references/            # Canonical versions, coding standards
├── 3-epics/                   # Epic and story specifications
└── ...
```

### Creating a New Page

1. Create a markdown (`.md`) or MDX (`.mdx`) file in the appropriate `/docs` subdirectory
2. Start the file with a heading that will become the page title:

   ```markdown
   # My New Page Title

   Content goes here...
   ```

3. The page will automatically appear in the sidebar based on its file location

### Organizing with Folders

- Create folders to group related documentation
- Use a `_meta.json` file to customize the sidebar order and display names:

  ```json
  {
    "getting-started": "Getting Started",
    "guides": "Developer Guides",
    "api": "API Reference"
  }
  ```

### Using MDX Features

MDX allows embedding React components in markdown:

```mdx
import { Callout } from "nextra/components";

<Callout type="info">This is an informational callout.</Callout>
```

Available callout types: `info`, `warning`, `error`, `default`.

## Development Commands

| Command                         | Description                   |
| ------------------------------- | ----------------------------- |
| `pnpm --filter docs dev`        | Start dev server on port 3001 |
| `pnpm --filter docs build`      | Build for production          |
| `pnpm --filter docs start`      | Start production server       |
| `pnpm --filter docs lint`       | Run ESLint                    |
| `pnpm --filter docs type-check` | Run TypeScript type checking  |

## Directory Structure

```text
apps/docs/
├── app/                       # Next.js app router
│   ├── layout.tsx             # Root layout with navbar, footer, theme config
│   ├── page.mdx               # Landing page (/)
│   └── docs/[[...mdxPath]]/   # Catch-all route for documentation pages
│       └── page.tsx           # MDX page renderer
├── content -> ../../docs      # Symlink to monorepo /docs directory
├── mdx-components.tsx         # MDX component customizations
├── next.config.mjs            # Nextra configuration
├── package.json               # Dependencies and scripts
└── tsconfig.json              # TypeScript configuration
```

### The Symlink Architecture

The `content` directory is a **symbolic link** pointing to `../../docs` (the monorepo's `/docs` folder). This allows:

- Documentation to live with the code in the monorepo root
- Nextra to render the documentation through its expected `content` directory
- Single source of truth for all documentation

**Important**: The symlink is already created and committed. You don't need to recreate it.

## Configuration Files

| File                 | Purpose                                                |
| -------------------- | ------------------------------------------------------ |
| `next.config.mjs`    | Nextra configuration: search settings, content routing |
| `app/layout.tsx`     | Theme configuration: navbar, footer, sidebar, ToC      |
| `mdx-components.tsx` | Custom MDX component overrides                         |
| `tsconfig.json`      | TypeScript configuration with path aliases             |

### Key Configuration Settings

**Nextra settings** (`next.config.mjs`):

- `search.codeblocks: false` - Excludes code blocks from search index
- `contentDirBasePath: '/docs'` - Maps content to `/docs` route

**Theme settings** (`app/layout.tsx`):

- Navbar with project link to GitHub
- Footer with copyright
- Sidebar with collapsed sections (level 1)
- Floating table of contents
- Edit link pointing to GitHub repository
- Feedback link for questions

---

## For Maintainers

This section covers maintaining and extending the documentation site infrastructure.

### Architecture Overview

The docs app uses **Nextra 4** with the following architecture:

```text
Browser Request
      │
      ▼
Next.js App Router
      │
      ▼
[[...mdxPath]]/page.tsx (catch-all route)
      │
      ▼
Nextra importPage() (loads MDX from content/)
      │
      ▼
MDX Renderer with nextra-theme-docs components
      │
      ▼
HTML Response
```

**Key Technologies**:

- **Nextra 4.6.0** - MDX-based documentation framework
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **Flexsearch** - Built-in full-text search (client-side)

### Environment Variables

| Variable                         | Purpose                              | Default                                      |
| -------------------------------- | ------------------------------------ | -------------------------------------------- |
| `NEXT_PUBLIC_DOCS_GITHUB_REPO`   | GitHub repository URL for edit links | `https://github.com/mikerkeating/next-js-01` |
| `NEXT_PUBLIC_DOCS_GITHUB_BRANCH` | Branch name for edit links           | `development`                                |
| `NEXT_PUBLIC_DOCS_PATH`          | Path to docs in repository           | `docs`                                       |

### Upgrading Nextra

1. Check the [Nextra changelog](https://nextra.site/docs/changelog) for breaking changes
2. Update dependencies:

   ```bash
   pnpm --filter docs update nextra nextra-theme-docs
   ```

3. Test locally:

   ```bash
   pnpm --filter docs dev
   pnpm --filter docs build
   ```

4. Verify:
   - Search functionality works
   - Navigation renders correctly
   - Dark mode toggle functions
   - All existing pages render

### Adding Custom Components

To add custom MDX components:

1. Edit `mdx-components.tsx`:

   ```tsx
   import { useMDXComponents as getDocsMDXComponents } from "nextra-theme-docs";

   const docsComponents = getDocsMDXComponents();

   export function useMDXComponents(components?: Record<string, unknown>): Record<string, unknown> {
     return {
       ...docsComponents,
       // Add custom components here
       MyCustomComponent: (props) => <div {...props} />,
       ...components,
     };
   }
   ```

2. Use in any MDX file:

   ```mdx
   <MyCustomComponent>Custom content</MyCustomComponent>
   ```

### Modifying the Layout

The root layout (`app/layout.tsx`) controls:

- **Navbar**: Logo, project link
- **Footer**: Copyright text
- **Sidebar**: Collapse level, auto-generation from file structure
- **Table of Contents**: Float position
- **Edit/Feedback Links**: GitHub integration

See [Nextra Theme Configuration](https://nextra.site/docs/docs-theme/theme-configuration) for all options.

### Turborepo Integration

The docs app is integrated into the Turborepo build pipeline:

**In `turbo.json`**:

```json
{
  "docs#build": {
    "dependsOn": ["//#docs-aggregates", "^build"],
    "inputs": ["app/**", "*.tsx", "*.ts", "*.mjs", "../../docs/**/*.md", "../../docs/**/*.mdx"],
    "outputs": [".next/**", "!.next/cache/**"]
  }
}
```

This ensures:

- Docs aggregates (package READMEs) are generated before docs build
- Docs build runs after package builds
- Changes to `/docs` content trigger rebuilds
- Build outputs are cached for faster subsequent builds

### Troubleshooting

#### Symlink Issues on Windows

Windows requires Developer Mode enabled or Administrator privileges for symlinks.

**Solution**: Enable Developer Mode in Windows Settings > Update & Security > For developers.

Alternatively, recreate the symlink with admin privileges:

```powershell
# Run as Administrator
cd apps/docs
mklink /D content ..\..\docs
```

#### Search Not Working

**Cause**: Search index not built or JavaScript disabled.

**Solution**:

1. Ensure the site builds successfully: `pnpm --filter docs build`
2. Search is client-side only - verify JavaScript is enabled in browser
3. Clear browser cache and reload

#### Pages Not Appearing in Sidebar

**Cause**: File not in the correct location or missing heading.

**Solution**:

1. Verify file is in `/docs` directory (not `apps/docs/content`)
2. Ensure file has a top-level heading (`# Title`)
3. Check file extension is `.md` or `.mdx`
4. Restart dev server after adding new files

#### Build Fails with Module Not Found

**Cause**: Missing dependencies or import errors.

**Solution**:

1. Run `pnpm install` from monorepo root
2. Check for circular dependencies in MDX imports
3. Verify all imported components exist

#### Git Timestamp Warning

**Cause**: Nextra shows warning about missing Git timestamps for `app/page.mdx`.

**Status**: Cosmetic only, doesn't affect functionality. The warning appears because `page.mdx` is in the app directory, not tracked the same way as content files.

### Testing Changes

Before committing documentation infrastructure changes:

```bash
# Verify lint passes
pnpm --filter docs lint

# Verify types compile
pnpm --filter docs type-check

# Verify build succeeds
pnpm --filter docs build

# Test dev server renders correctly
pnpm --filter docs dev
```

### Related Documentation

- [Nextra Documentation](https://nextra.site/)
- [TAD: Documentation Architecture](/docs/2-technical/2-tad-documentation.md)
- [S2: Configure Documentation Site Framework](/docs/3-epics/1A.4-documentation-foundation/S2-docs-site.md)
- [S7: Documentation Quality Gates](/docs/3-epics/1A.4-documentation-foundation/S7-docs-quality-gates.md)
