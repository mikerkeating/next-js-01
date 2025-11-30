#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * Extract CodeRabbit comments from GitHub Pull Requests
 *
 * This script fetches comments from CodeRabbit on a specified PR and extracts:
 * 1. "Prompt for AI Agents" sections
 * 2. "Nitpick comments" sections (excluding "Review details")
 *
 * Uses GitHub CLI (gh) for authentication, so no token is needed.
 *
 * Usage:
 *   tsx scripts/pr-coderabbit-comments.ts <pr-number> <epic-number> <epic-slug>
 *
 * Example:
 *   tsx scripts/pr-coderabbit-comments.ts 84 1A.5 my-epic-name
 */

import { execFileSync } from "child_process";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

interface GitHubComment {
  user: {
    login: string;
  };
  body: string;
  created_at: string;
  html_url: string;
  state?: string; // For review comments: 'PENDING' | 'RESOLVED' | null
  path?: string; // File path for review comments
  original_start_line?: number; // Starting line number for multi-line comments
  original_line?: number; // Ending line number
  line?: number; // Single line number (if not a range)
}

interface PRInfo {
  number: number;
  title: string;
  html_url: string;
  user: {
    login: string;
  };
}

const OWNER = "mikerkeating";
const REPO = "next-js-01";

const args = process.argv.slice(2);
if (args.length < 3) {
  console.error("Error: PR number, epic number, and epic slug are required");
  console.error(
    "Usage: tsx scripts/pr-coderabbit-comments.ts <pr-number> <epic-number> <epic-slug>"
  );
  console.error("Example: tsx scripts/pr-coderabbit-comments.ts 84 1A.5 my-epic-name");
  process.exit(1);
}

const PR_NUMBER = parseInt(args[0], 10);
const EPIC_NUMBER = args[1];
const EPIC_SLUG = args[2];

// Validate PR number is a positive integer
if (isNaN(PR_NUMBER) || PR_NUMBER <= 0 || !Number.isInteger(PR_NUMBER)) {
  console.error(`Error: Invalid PR number: ${args[0]}`);
  console.error("PR number must be a positive integer");
  process.exit(1);
}

// Validate epic number format to prevent path traversal attacks
// Epic numbers should match format like "1A.1" or "2B.3" (digit + letter + dot + digits)
if (!/^[0-9][A-Z]\.[0-9]+$/i.test(EPIC_NUMBER)) {
  console.error(`Error: Invalid epic number format: ${EPIC_NUMBER}`);
  console.error(
    'Epic number must match format like "1A.1" or "2B.3" (digit + letter + dot + digits)'
  );
  process.exit(1);
}

// Validate epic slug format (lowercase letters, numbers, and hyphens only)
if (!/^[a-z0-9-]+$/.test(EPIC_SLUG)) {
  console.error(`Error: Invalid epic slug format: ${EPIC_SLUG}`);
  console.error("Epic slug must contain only lowercase letters, numbers, and hyphens");
  process.exit(1);
}

/**
 * Execute GitHub CLI command and return parsed JSON
 */
function ghApi(endpoint: string): unknown {
  try {
    const result = execFileSync("gh", ["api", endpoint], {
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large responses
    });
    return JSON.parse(result);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`GitHub API call failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Fetch PR info using gh CLI
 */
function fetchPRInfo(prNumber: number): PRInfo {
  const endpoint = `repos/${OWNER}/${REPO}/pulls/${prNumber}`;
  console.log(`Fetching PR info: ${endpoint}`);

  return ghApi(endpoint) as PRInfo;
}

/**
 * Fetch all issue comments with pagination using gh CLI
 */
function fetchIssueComments(prNumber: number): GitHubComment[] {
  const comments: GitHubComment[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const endpoint = `repos/${OWNER}/${REPO}/issues/${prNumber}/comments?page=${page}&per_page=${perPage}`;
    console.log(`Fetching issue comments page ${page}`);

    const pageComments = ghApi(endpoint) as GitHubComment[];

    if (pageComments.length === 0) break;

    comments.push(...pageComments);

    if (pageComments.length < perPage) break;
    page++;
  }

  console.log(`Total issue comments fetched: ${comments.length}`);
  return comments;
}

/**
 * Fetch all review comments with pagination using gh CLI
 * Review comments include the 'state' field for resolved status
 */
function fetchReviewComments(prNumber: number): GitHubComment[] {
  const comments: GitHubComment[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const endpoint = `repos/${OWNER}/${REPO}/pulls/${prNumber}/comments?page=${page}&per_page=${perPage}`;
    console.log(`Fetching review comments page ${page}`);

    const pageComments = ghApi(endpoint) as GitHubComment[];

    if (pageComments.length === 0) break;

    comments.push(...pageComments);

    if (pageComments.length < perPage) break;
    page++;
  }

  console.log(`Total review comments fetched: ${comments.length}`);
  return comments;
}

/**
 * Fetch all comments (both issue and review comments)
 */
function fetchAllComments(prNumber: number): GitHubComment[] {
  const issueComments = fetchIssueComments(prNumber);
  const reviewComments = fetchReviewComments(prNumber);

  const allComments = [...issueComments, ...reviewComments];
  console.log(`Total comments fetched: ${allComments.length}`);

  return allComments;
}

function extractPromptsForAIAgents(commentBody: string): string | null {
  // Look for "<summary>🤖 Prompt for AI Agents</summary>" section
  const promptMatch = commentBody.match(
    /<summary>🤖 Prompt for AI Agents<\/summary>\s*([\s\S]*?)(?=<\/details>|$)/i
  );
  if (!promptMatch) return null;

  // Extract just the content inside the code block or the raw content
  const content = promptMatch[1].trim();

  // Try to extract from code block if present
  const codeBlockMatch = content.match(/```\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  return content;
}

function extractNitpickComments(commentBody: string): string | null {
  // Look for "Nitpick comments" section but exclude "Review details"
  const nitpickMatch = commentBody.match(
    /<summary>🧹 Nitpick comments[\s\S]*?(?=<details>\s*<summary>📜 Review details|$)/i
  );
  if (!nitpickMatch) return null;

  return nitpickMatch[0].trim();
}

interface ExtractedPrompt {
  content: string;
  path?: string;
  lineRange?: string;
  url: string;
}

function extractCodeRabbitContent(comments: GitHubComment[]): {
  prompts: ExtractedPrompt[];
  nitpicks: string[];
} {
  const prompts: ExtractedPrompt[] = [];
  const nitpicks: string[] = [];

  for (const comment of comments) {
    // Only process comments from coderabbitai[bot]
    if (comment.user.login !== "coderabbitai[bot]") continue;

    // Skip if body doesn't include the AI Agents prompt section
    if (!comment.body.includes("<summary>🤖 Prompt for AI Agents</summary>")) continue;

    // Skip if already addressed (contains "Addressed in commit")
    if (comment.body.includes("Addressed in commit")) {
      console.log(`Skipping addressed comment from ${comment.created_at}`);
      continue;
    }

    // Skip resolved comments
    if (comment.state === "RESOLVED") {
      console.log(`Skipping resolved comment from ${comment.created_at}`);
      continue;
    }

    // Extract "Prompt for AI Agents"
    const promptContent = extractPromptsForAIAgents(comment.body);
    if (promptContent) {
      // Build line range string
      let lineRange: string | undefined;
      if (comment.path) {
        if (comment.original_start_line && comment.original_line) {
          lineRange = `${comment.original_start_line} to ${comment.original_line}`;
        } else if (comment.line || comment.original_line) {
          lineRange = String(comment.line || comment.original_line);
        }
      }

      prompts.push({
        content: promptContent,
        path: comment.path,
        lineRange,
        url: comment.html_url,
      });
    }

    // Extract "Nitpick comments"
    const nitpickContent = extractNitpickComments(comment.body);
    if (nitpickContent) {
      nitpicks.push(nitpickContent);
    }
  }

  return { prompts, nitpicks };
}

function generateMarkdown(prInfo: PRInfo, prompts: ExtractedPrompt[], nitpicks: string[]): string {
  const lines: string[] = [];

  // Header
  lines.push(`# CodeRabbit Comments for Epic ${EPIC_NUMBER}`);
  lines.push("");
  lines.push(`**Pull Request**: [#${prInfo.number} - ${prInfo.title}](${prInfo.html_url})`);
  lines.push(`**Author**: ${prInfo.user.login}`);
  lines.push(`**Extracted**: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("---");
  lines.push("");

  // Prompts for AI Agents
  if (prompts.length > 0) {
    lines.push("## Prompts for AI Agents");
    lines.push("");
    prompts.forEach((prompt, index) => {
      if (prompts.length > 1) {
        lines.push(`### Prompt ${index + 1}`);
        lines.push("");
      }

      // Add file path and line range if available
      if (prompt.path) {
        lines.push(`**File**: \`${prompt.path}\``);
        if (prompt.lineRange) {
          lines.push(`**Lines**: ${prompt.lineRange}`);
        }
        lines.push(`**Link**: [View on GitHub](${prompt.url})`);
        lines.push("");
      }

      // Add the prompt content
      lines.push("```");
      lines.push(prompt.content);
      lines.push("```");
      lines.push("");
    });
    lines.push("---");
    lines.push("");
  }

  // Nitpick Comments
  if (nitpicks.length > 0) {
    lines.push("## Nitpick Comments");
    lines.push("");
    nitpicks.forEach((nitpick, index) => {
      if (nitpicks.length > 1) {
        lines.push(`### Set ${index + 1}`);
        lines.push("");
      }
      lines.push(nitpick);
      lines.push("");
    });
  }

  // Footer
  if (prompts.length === 0 && nitpicks.length === 0) {
    lines.push("> No CodeRabbit prompts or nitpick comments found in this PR.");
  }

  return lines.join("\n");
}

function main(): void {
  try {
    console.log(`\nExtracting CodeRabbit comments from PR #${PR_NUMBER} for Epic ${EPIC_NUMBER}\n`);

    // Fetch PR info
    const prInfo = fetchPRInfo(PR_NUMBER);
    console.log(`PR Title: ${prInfo.title}`);
    console.log("");

    // Fetch all comments
    const comments = fetchAllComments(PR_NUMBER);

    // Save raw JSON response for debugging
    const epicDir = join(process.cwd(), "docs", "3-epics", `${EPIC_NUMBER}-${EPIC_SLUG}`);
    mkdirSync(epicDir, { recursive: true });

    const jsonOutputPath = join(epicDir, `epic-${EPIC_NUMBER}-pr-${PR_NUMBER}.json`);
    writeFileSync(
      jsonOutputPath,
      JSON.stringify(
        {
          prInfo,
          comments,
          metadata: {
            fetched_at: new Date().toISOString(),
            total_comments: comments.length,
            pr_number: PR_NUMBER,
            epic_number: EPIC_NUMBER,
          },
        },
        null,
        2
      ),
      "utf-8"
    );
    console.log(`✓ Raw JSON saved to: ${jsonOutputPath}`);
    console.log("");

    // Filter CodeRabbit comments
    const coderabbitComments = comments.filter((c) => c.user.login === "coderabbitai[bot]");
    const withAIPrompts = coderabbitComments.filter((c) =>
      c.body.includes("<summary>🤖 Prompt for AI Agents</summary>")
    );
    const resolvedComments = coderabbitComments.filter((c) => c.state === "RESOLVED");
    const addressedComments = coderabbitComments.filter((c) =>
      c.body.includes("Addressed in commit")
    );

    console.log(`CodeRabbit comments: ${coderabbitComments.length}`);
    console.log(`  - With AI Agent prompts: ${withAIPrompts.length}`);
    console.log(`  - Already addressed: ${addressedComments.length}`);
    console.log(`  - Resolved: ${resolvedComments.length}`);
    console.log("");

    // Extract content
    const { prompts, nitpicks } = extractCodeRabbitContent(comments);
    console.log(`Extracted ${prompts.length} prompt(s) for AI Agents`);
    console.log(`Extracted ${nitpicks.length} nitpick comment set(s)`);
    console.log("");

    // Generate markdown
    const markdown = generateMarkdown(prInfo, prompts, nitpicks);

    // Write to file (epicDir already created above)
    const outputPath = join(epicDir, `epic-${EPIC_NUMBER}-pr-coderabbit.md`);
    writeFileSync(outputPath, markdown, "utf-8");

    console.log(`✓ Output written to: ${outputPath}`);
    console.log("");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
