# CodeRabbit Comment Extractor

This script extracts CodeRabbit comments from GitHub Pull Requests and saves them to markdown files in the appropriate epic folder.

## What It Extracts

The script looks for comments from `coderabbitai` and extracts:

1. **Prompt for AI Agents** - Any AI agent prompts provided by CodeRabbit
2. **Nitpick Comments** - Code review nitpick suggestions (excludes the "Review details" section)

## Prerequisites

- Node.js installed
- GitHub CLI (`gh`) authenticated (already set up in your environment)
- `npx` available (comes with Node.js)

## Usage

### Basic Usage

```bash
./scripts/extract-coderabbit.sh <pr-number> <epic-number>
```

No GitHub token needed! The script uses your existing GitHub CLI authentication.

### Examples

Extract CodeRabbit comments from PR #84 for Epic 2.9:

```bash
./scripts/extract-coderabbit.sh 84 2.9
```

Extract CodeRabbit comments from PR #91 for Epic 2.8:

```bash
./scripts/extract-coderabbit.sh 91 2.8
```

Extract CodeRabbit comments from PR #80 for Epic 2.4:

```bash
./scripts/extract-coderabbit.sh 80 2.4
```

## Output

The script creates a markdown file at:

```
docs/stories/epic-<epic-number>/epic-<epic-number>-pr-coderabbit.md
```

For example, running:

```bash
./scripts/extract-coderabbit.sh 84 2.9
```

Creates:

```
docs/stories/epic-2.9/epic-2.9-pr-coderabbit.md
```

## Output Format

The generated markdown file includes:

- PR metadata (number, title, author, link)
- Extraction timestamp
- All "Prompt for AI Agents" sections found
- All "Nitpick Comments" sections found (without "Review details")

## Running the TypeScript Script Directly

If you prefer to run the TypeScript script directly:

```bash
npx tsx scripts/extract-coderabbit-comments.ts <pr-number> <epic-number>
```

## Troubleshooting

### GitHub CLI Not Authenticated

If you get authentication errors, make sure GitHub CLI is set up:

```bash
gh auth status
```

If not authenticated, run:

```bash
gh auth login
```

### Permission Errors

If you get "permission denied" errors:

```bash
chmod +x scripts/extract-coderabbit.sh
chmod +x scripts/extract-coderabbit-comments.ts
```

### Rate Limiting

The script automatically handles GitHub API pagination. If you're processing PRs with hundreds of comments, it may take a moment.

## Testing

Test with the provided example PRs:

```bash
# Epic 2.9
./scripts/extract-coderabbit.sh 84 2.9

# Epic 2.8
./scripts/extract-coderabbit.sh 91 2.8

# Epic 2.4
./scripts/extract-coderabbit.sh 80 2.4
```

## How It Works

The script:

1. Uses `gh api` to fetch PR information and comments
2. Filters comments from the `coderabbitai` user
3. Extracts specific sections using regex patterns:
   - "Prompt for AI Agents" sections
   - "Nitpick comments" sections (excluding "Review details")
4. Generates a markdown file with the extracted content
5. Saves to the appropriate epic folder

## Script Files

- `scripts/extract-coderabbit.sh` - Bash wrapper for easy usage
- `scripts/extract-coderabbit-comments.ts` - Main TypeScript implementation
- `scripts/README-coderabbit-extractor.md` - This documentation

## Benefits of Using GitHub CLI

- No need to manage personal access tokens
- Uses your existing GitHub authentication
- Automatically handles API rate limits
- Simpler and more secure
