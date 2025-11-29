#!/usr/bin/env node
/**
 * Aggregate Package Documentation
 *
 * Copies README.md files from packages/* to docs/packages/ for inclusion
 * in the documentation site. Adds frontmatter and cleans stale files.
 *
 * Usage: pnpm aggregate-docs
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

// Files to preserve during cleanup
const PRESERVED_FILES = new Set([".gitignore", "_meta.json"]);

interface AggregationResult {
  copied: string[];
  skipped: string[];
  removed: string[];
  errors: string[];
}

/**
 * Get all direct child directories of the packages folder
 */
function getPackageDirectories(): string[] {
  if (!fs.existsSync(PACKAGES_DIR)) {
    return [];
  }

  return fs
    .readdirSync(PACKAGES_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
}

/**
 * Check if a README exists and has content
 */
function hasValidReadme(packageName: string): { valid: boolean; path: string } {
  const readmePath = path.join(PACKAGES_DIR, packageName, "README.md");

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
 * Check if content already has frontmatter
 */
function hasFrontmatter(content: string): boolean {
  return content.trimStart().startsWith("---");
}

/**
 * Generate frontmatter for a package README
 */
function generateFrontmatter(packageName: string): string {
  return `---
title: "@repo/${packageName}"
description: "Auto-generated from packages/${packageName}/README.md"
---

`;
}

/**
 * Add a source note comment to the content
 */
function addSourceNote(packageName: string, content: string): string {
  const sourceNote = `<!-- Auto-generated from packages/${packageName}/README.md -->\n\n`;

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
  return generateFrontmatter(packageName) + sourceNote + content;
}

/**
 * Clean stale files from docs/packages/
 */
function cleanStaleFiles(result: AggregationResult): void {
  if (!fs.existsSync(DOCS_PACKAGES_DIR)) {
    return;
  }

  const files = fs.readdirSync(DOCS_PACKAGES_DIR);

  for (const file of files) {
    if (PRESERVED_FILES.has(file)) {
      continue;
    }

    const filePath = path.join(DOCS_PACKAGES_DIR, file);
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
 * Ensure the docs/packages directory exists
 */
function ensureDocsPackagesDir(): void {
  if (!fs.existsSync(DOCS_PACKAGES_DIR)) {
    fs.mkdirSync(DOCS_PACKAGES_DIR, { recursive: true });
  }
}

/**
 * Copy a package README to docs/packages/
 */
function copyPackageReadme(
  packageName: string,
  readmePath: string,
  result: AggregationResult
): void {
  try {
    const content = fs.readFileSync(readmePath, "utf-8");
    const processedContent = addSourceNote(packageName, content);

    const targetPath = path.join(DOCS_PACKAGES_DIR, `${packageName}.md`);
    fs.writeFileSync(targetPath, processedContent, "utf-8");

    result.copied.push(packageName);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    result.errors.push(`Failed to copy ${packageName}: ${message}`);
  }
}

/**
 * Main aggregation function
 */
function aggregatePackageDocs(): AggregationResult {
  const result: AggregationResult = {
    copied: [],
    skipped: [],
    removed: [],
    errors: [],
  };

  // Ensure target directory exists
  ensureDocsPackagesDir();

  // Clean stale files first
  cleanStaleFiles(result);

  // Get all package directories
  const packages = getPackageDirectories();

  if (packages.length === 0) {
    console.log("No packages found in packages/");
    return result;
  }

  // Process each package
  for (const packageName of packages) {
    const readme = hasValidReadme(packageName);

    if (!readme.valid) {
      console.warn(`Warning: Skipping ${packageName} - no valid README.md`);
      result.skipped.push(packageName);
      continue;
    }

    copyPackageReadme(packageName, readme.path, result);
  }

  return result;
}

/**
 * Print results summary
 */
function printSummary(result: AggregationResult): void {
  console.log("\n=== Package Documentation Aggregation ===\n");

  if (result.copied.length > 0) {
    console.log(`Copied (${result.copied.length}):`);
    for (const pkg of result.copied) {
      console.log(`  + ${pkg}.md`);
    }
  }

  if (result.skipped.length > 0) {
    console.log(`\nSkipped (${result.skipped.length}):`);
    for (const pkg of result.skipped) {
      console.log(`  - ${pkg} (no README.md)`);
    }
  }

  if (result.removed.length > 0) {
    console.log(`\nRemoved stale files (${result.removed.length}):`);
    for (const file of result.removed) {
      console.log(`  x ${file}`);
    }
  }

  if (result.errors.length > 0) {
    console.log(`\nErrors (${result.errors.length}):`);
    for (const error of result.errors) {
      console.error(`  ! ${error}`);
    }
  }

  console.log("\n=========================================\n");
}

// Run the aggregation
const result = aggregatePackageDocs();
printSummary(result);

// Exit with error code if there were errors
if (result.errors.length > 0) {
  process.exit(1);
}
