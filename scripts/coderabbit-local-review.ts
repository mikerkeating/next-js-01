#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * Run CodeRabbit CLI review and save to markdown
 *
 * This script runs `coderabbit review --prompt-only` and parses the output
 * into a markdown file with each suggestion as a ### heading.
 *
 * Usage:
 *   tsx scripts/coderabbit-local-review.ts [output-file]
 *
 * Example:
 *   tsx scripts/coderabbit-local-review.ts
 *   tsx scripts/coderabbit-local-review.ts ./my-review.md
 */

import { execSync } from "child_process";
import { writeFileSync } from "fs";
import { join } from "path";

interface Suggestion {
  file: string;
  line?: string;
  severity?: string;
  title: string;
  description: string;
}

const DEFAULT_OUTPUT = "coderabbit-suggestions.md";

/**
 * Check if CodeRabbit CLI is authenticated
 */
function checkAuthentication(): void {
  try {
    execSync("coderabbit auth status", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch {
    console.error("❌ CodeRabbit CLI is not authenticated.");
    console.error("");
    console.error("Please authenticate first:");
    console.error("  coderabbit auth login");
    console.error("");
    process.exit(1);
  }
}

/**
 * Run coderabbit CLI and capture output
 */
function runCodeRabbitReview(): string {
  try {
    const result = execSync("coderabbit review --prompt-only --base development", {
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
      stdio: ["pipe", "pipe", "pipe"],
    });
    return result;
  } catch (error) {
    if (error instanceof Error && "stdout" in error) {
      // Command may exit non-zero but still produce output
      return (error as { stdout: string }).stdout || "";
    }
    throw new Error(
      `CodeRabbit CLI failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Parse CodeRabbit prompt-only output into structured suggestions
 *
 * The output format varies, but typically includes:
 * - File path and line numbers
 * - Severity levels (error, warning, info, nitpick)
 * - Description of the issue and suggested fix
 */
function parseSuggestions(output: string): Suggestion[] {
  const suggestions: Suggestion[] = [];

  if (!output.trim()) {
    return suggestions;
  }

  // Split by common delimiters that CodeRabbit uses
  // Try splitting by file markers or numbered items
  const sections = output.split(/(?=^(?:File:|In |📁|\d+\.\s+))/m).filter((s) => s.trim());

  for (const section of sections) {
    const lines = section.trim().split("\n");
    if (lines.length === 0) continue;

    // Try to extract file path
    const fileMatch =
      lines[0].match(/^(?:File:|In |📁)\s*[`']?([^`'\n:]+)[`']?/i) ||
      lines[0].match(/^\d+\.\s*[`']?([^`'\n:]+\.[a-z]+)[`']?/i) ||
      section.match(/[`']([^`'\s]+\.[a-z]{2,4})[`']/i);

    const file = fileMatch ? fileMatch[1].trim() : "Unknown file";

    // Try to extract line number
    const lineMatch = section.match(/(?:line|lines?|L)\s*(\d+(?:\s*-\s*\d+)?)/i);
    const line = lineMatch ? lineMatch[1] : undefined;

    // Try to extract severity
    const severityMatch = section.match(
      /\b(error|warning|info|nitpick|critical|major|minor|suggestion)\b/i
    );
    const severity = severityMatch ? severityMatch[1].toLowerCase() : undefined;

    // Extract title - first meaningful line or summary
    let title = "";
    let description = "";

    // Look for a clear title pattern
    const titleMatch = section.match(/(?:Summary|Issue|Problem|Title):\s*(.+)/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
      description = section.replace(titleMatch[0], "").trim();
    } else {
      // Use first line as title, rest as description
      const contentLines = lines.filter((l) => l.trim() && !l.match(/^(?:File:|In |📁)/i));
      title = contentLines[0]?.trim() || "Code suggestion";
      description = contentLines.slice(1).join("\n").trim();
    }

    // Clean up description
    description = description || section;

    suggestions.push({
      file,
      line,
      severity,
      title: title.substring(0, 100), // Truncate long titles
      description,
    });
  }

  // If no structured sections found, treat entire output as one suggestion
  if (suggestions.length === 0 && output.trim()) {
    suggestions.push({
      file: "General",
      title: "Code review suggestions",
      description: output.trim(),
    });
  }

  return suggestions;
}

/**
 * Generate markdown from suggestions
 */
function generateMarkdown(suggestions: Suggestion[]): string {
  const lines: string[] = [];

  lines.push("# CodeRabbit Local Review");
  lines.push("");
  lines.push(`**Generated**: ${new Date().toISOString()}`);
  lines.push(`**Total suggestions**: ${suggestions.length}`);
  lines.push("");
  lines.push("---");
  lines.push("");

  if (suggestions.length === 0) {
    lines.push("> No suggestions found. Your code looks good! 🎉");
    lines.push("");
    return lines.join("\n");
  }

  suggestions.forEach((suggestion, index) => {
    // Create heading with file info
    const fileInfo = suggestion.line ? `${suggestion.file}:${suggestion.line}` : suggestion.file;
    const severityBadge = suggestion.severity ? ` [${suggestion.severity}]` : "";

    lines.push(`### ${index + 1}. ${suggestion.title}${severityBadge}`);
    lines.push("");
    lines.push(`**File**: \`${fileInfo}\``);
    lines.push("");
    lines.push(suggestion.description);
    lines.push("");
    lines.push("---");
    lines.push("");
  });

  return lines.join("\n");
}

function main(): void {
  const args = process.argv.slice(2);
  const outputFile = args[0] || join(process.cwd(), DEFAULT_OUTPUT);

  console.log("🐰 Running CodeRabbit local review...");
  console.log("");

  // Check authentication first
  checkAuthentication();

  // Run CodeRabbit CLI
  let output: string;
  try {
    output = runCodeRabbitReview();
  } catch (error) {
    console.error("❌ Failed to run CodeRabbit CLI:");
    console.error(error instanceof Error ? error.message : String(error));
    console.error("");
    console.error("Make sure CodeRabbit CLI is installed:");
    console.error("  curl -fsSL https://cli.coderabbit.ai/install.sh | sh");
    process.exit(1);
  }

  if (!output.trim()) {
    console.log("✅ No issues found!");
    console.log("");

    // Still write the file to indicate a clean review
    const markdown = generateMarkdown([]);
    writeFileSync(outputFile, markdown, "utf-8");
    console.log(`📝 Empty report written to: ${outputFile}`);
    return;
  }

  console.log("📋 Parsing suggestions...");

  // Parse suggestions
  const suggestions = parseSuggestions(output);
  console.log(`   Found ${suggestions.length} suggestion(s)`);
  console.log("");

  // Generate markdown
  const markdown = generateMarkdown(suggestions);

  // Write to file
  writeFileSync(outputFile, markdown, "utf-8");
  console.log(`✅ Review saved to: ${outputFile}`);
  console.log("");

  // Print summary
  if (suggestions.length > 0) {
    console.log("Summary of suggestions:");
    suggestions.forEach((s, i) => {
      const severity = s.severity ? ` [${s.severity}]` : "";
      console.log(`  ${i + 1}. ${s.file}${severity}: ${s.title}`);
    });
  }
}

main();
