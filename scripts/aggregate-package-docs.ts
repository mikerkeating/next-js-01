#!/usr/bin/env node
/**
 * Aggregate Package and App Documentation
 *
 * Copies README.md files from packages/* and apps/* to docs/packages/ and
 * docs/apps/ for inclusion in the documentation site. Adds frontmatter and
 * cleans stale files.
 *
 * Usage: pnpm docs-aggregates
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

// Get directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths relative to repository root
const REPO_ROOT = path.resolve(__dirname, "..");
const PACKAGES_DIR = path.join(REPO_ROOT, "packages");
const DOCS_PACKAGES_DIR = path.join(REPO_ROOT, "docs", "packages");
const APPS_DIR = path.join(REPO_ROOT, "apps");
const DOCS_APPS_DIR = path.join(REPO_ROOT, "docs", "apps");

type SourceType = "package" | "app";

// Files to preserve during cleanup
const PRESERVED_FILES = new Set([".gitignore", "_meta.json"]);

interface AggregationResult {
  copied: string[];
  skipped: string[];
  removed: string[];
  errors: string[];
}

/**
 * Get all direct child directories of a source folder
 */
function getDirectories(sourceDir: string): string[] {
  if (!fs.existsSync(sourceDir)) {
    return [];
  }

  return fs
    .readdirSync(sourceDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
}

/**
 * Check if a README exists and has content
 */
function hasValidReadme(sourceDir: string, name: string): { valid: boolean; path: string } {
  const readmePath = path.join(sourceDir, name, "README.md");

  if (!fs.existsSync(readmePath)) {
    return { valid: false, path: readmePath };
  }

  const content = fs.readFileSync(readmePath, "utf-8").trim();
  if (content.length === 0) {
    return { valid: false, path: readmePath };
  }

  return { valid: true, path: readmePath };
}

/**
 * Check if content already has frontmatter.
 * Frontmatter must start at position 0 per the spec.
 */
function hasFrontmatter(content: string): boolean {
  return content.startsWith("---");
}

/**
 * Generate frontmatter for a package or app README
 */
function generateFrontmatter(name: string, type: SourceType): string {
  if (type === "package") {
    return `---
title: "@repo/${name}"
description: "Auto-generated from packages/${name}/README.md"
---

`;
  }
  return `---
title: "${name}"
description: "Auto-generated from apps/${name}/README.md"
---

`;
}

/**
 * Add a source note comment to the content
 */
function addSourceNote(name: string, content: string, type: SourceType): string {
  const sourceDir = type === "package" ? "packages" : "apps";
  const sourceNote = `<!-- Auto-generated from ${sourceDir}/${name}/README.md -->\n\n`;

  if (hasFrontmatter(content)) {
    // Insert source note after frontmatter
    const frontmatterEnd = content.indexOf("---", 3);
    if (frontmatterEnd !== -1) {
      const afterFrontmatter = frontmatterEnd + 3;
      return (
        content.slice(0, afterFrontmatter) +
        "\n\n" +
        sourceNote +
        content.slice(afterFrontmatter).trimStart()
      );
    }
  }

  // Add frontmatter and source note
  return generateFrontmatter(name, type) + sourceNote + content;
}

/**
 * Clean stale files from a docs directory
 */
function cleanStaleFiles(docsDir: string, result: AggregationResult): void {
  if (!fs.existsSync(docsDir)) {
    return;
  }

  const files = fs.readdirSync(docsDir);

  for (const file of files) {
    if (PRESERVED_FILES.has(file)) {
      continue;
    }

    const filePath = path.join(docsDir, file);
    try {
      fs.unlinkSync(filePath);
      result.removed.push(file);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      result.errors.push(`Failed to remove ${file}: ${message}`);
    }
  }
}

/**
 * Ensure a docs directory exists
 */
function ensureDocsDir(docsDir: string): void {
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
}

/**
 * Copy a README to a docs directory
 */
function copyReadme(
  name: string,
  readmePath: string,
  docsDir: string,
  type: SourceType,
  result: AggregationResult
): void {
  try {
    const content = fs.readFileSync(readmePath, "utf-8");
    const processedContent = addSourceNote(name, content, type);

    const targetPath = path.join(docsDir, `${name}.md`);
    fs.writeFileSync(targetPath, processedContent, "utf-8");

    result.copied.push(name);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    result.errors.push(`Failed to copy ${name}: ${message}`);
  }
}

/**
 * Aggregate docs from a source directory
 */
function aggregateDocs(
  sourceDir: string,
  docsDir: string,
  type: SourceType,
  label: string
): AggregationResult {
  const result: AggregationResult = {
    copied: [],
    skipped: [],
    removed: [],
    errors: [],
  };

  // Ensure target directory exists
  ensureDocsDir(docsDir);

  // Clean stale files first
  cleanStaleFiles(docsDir, result);

  // Get all directories
  const items = getDirectories(sourceDir);

  if (items.length === 0) {
    console.log(`No ${label} found in ${path.basename(sourceDir)}/`);
    return result;
  }

  // Process each item
  for (const name of items) {
    const readme = hasValidReadme(sourceDir, name);

    if (!readme.valid) {
      console.warn(`Warning: Skipping ${name} - no valid README.md`);
      result.skipped.push(name);
      continue;
    }

    copyReadme(name, readme.path, docsDir, type, result);
  }

  return result;
}

/**
 * Main aggregation function - aggregates both packages and apps
 */
function aggregateAllDocs(): {
  packages: AggregationResult;
  apps: AggregationResult;
} {
  const packages = aggregateDocs(PACKAGES_DIR, DOCS_PACKAGES_DIR, "package", "packages");
  const apps = aggregateDocs(APPS_DIR, DOCS_APPS_DIR, "app", "apps");

  return { packages, apps };
}

/**
 * Print results summary for a single aggregation
 */
function printSectionSummary(result: AggregationResult, sectionLabel: string): void {
  console.log(`\n--- ${sectionLabel} ---`);

  if (result.copied.length > 0) {
    console.log(`Copied (${result.copied.length}):`);
    for (const item of result.copied) {
      console.log(`  + ${item}.md`);
    }
  }

  if (result.skipped.length > 0) {
    console.log(`Skipped (${result.skipped.length}):`);
    for (const item of result.skipped) {
      console.log(`  - ${item} (no README.md)`);
    }
  }

  if (result.removed.length > 0) {
    console.log(`Removed stale files (${result.removed.length}):`);
    for (const file of result.removed) {
      console.log(`  x ${file}`);
    }
  }

  if (result.errors.length > 0) {
    console.log(`Errors (${result.errors.length}):`);
    for (const error of result.errors) {
      console.error(`  ! ${error}`);
    }
  }
}

/**
 * Print full results summary
 */
function printSummary(results: { packages: AggregationResult; apps: AggregationResult }): void {
  console.log("\n=== Documentation Aggregation ===");

  printSectionSummary(results.packages, "Packages");
  printSectionSummary(results.apps, "Apps");

  console.log("\n=================================\n");
}

// Run the aggregation
const results = aggregateAllDocs();
printSummary(results);

// Exit with error code if there were errors
const totalErrors = results.packages.errors.length + results.apps.errors.length;
if (totalErrors > 0) {
  process.exit(1);
}
