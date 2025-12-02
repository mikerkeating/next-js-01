#!/usr/bin/env npx tsx
/* eslint-disable no-console */
/**
 * Organization-Scoped Query Example
 *
 * Demonstrates multi-tenant data access patterns using @repo/database utilities.
 * Shows how to properly scope queries by organization and prevent cross-tenant access.
 *
 * Prerequisites:
 *   - DATABASE_URL environment variable set
 *   - Database migrations applied
 *
 * Usage:
 *   DATABASE_URL="..." npx tsx examples/organization-scoped.ts
 *
 * Or from the package directory:
 *   pnpm exec tsx examples/organization-scoped.ts
 */

import { pgTable, text } from "drizzle-orm/pg-core";

import {
  checkDatabaseHealth,
  organizationId,
  orgId,
  withoutOrgChange,
  timestamps,
  softDelete,
} from "../src/index";

// Example schema with organization scoping
const _posts = pgTable("example_posts", {
  id: text("id").primaryKey(),
  organizationId: organizationId(), // organization_id in DB
  title: text("title").notNull(),
  content: text("content"),
  authorId: text("author_id").notNull(),
  ...timestamps(),
  ...softDelete(),
});

const _comments = pgTable("example_comments", {
  id: text("id").primaryKey(),
  orgId: orgId(), // org_id in DB (short form)
  postId: text("post_id").notNull(),
  content: text("content").notNull(),
  ...timestamps(),
});

type _Post = typeof _posts.$inferSelect;
type _NewPost = typeof _posts.$inferInsert;

// Simulated current organization context
const CURRENT_ORG_ID = "550e8400-e29b-41d4-a716-446655440000";
const OTHER_ORG_ID = "550e8400-e29b-41d4-a716-446655440001";

/**
 * Organization Column Helpers
 *
 * Shows both full and short organization column definitions.
 */
function demonstrateOrgColumns(): void {
  console.log("\n--- Organization Column Helpers ---");

  console.log("  Full form: organizationId()");
  console.log("    - Property name: organizationId");
  console.log("    - Database column: organization_id");
  console.log("    - Type: UUID, NOT NULL");

  console.log("\n  Short form: orgId()");
  console.log("    - Property name: orgId");
  console.log("    - Database column: org_id");
  console.log("    - Type: UUID, NOT NULL");

  console.log("\n  Choose based on your naming preference - both work identically.");
}

/**
 * Organization Filter Helper
 *
 * Shows how withOrgFilter() creates proper WHERE conditions.
 */
function demonstrateOrgFilter(): void {
  console.log("\n--- Organization Filter (withOrgFilter) ---");

  console.log("  Query Pattern:");
  console.log("    db.select()");
  console.log("      .from(posts)");
  console.log(`      .where(withOrgFilter(posts, "${CURRENT_ORG_ID}"))`);

  console.log("\n  Generated SQL (conceptual):");
  console.log(`    SELECT * FROM posts WHERE organization_id = '${CURRENT_ORG_ID}'`);

  console.log("\n  Combined with other conditions:");
  console.log("    db.select()");
  console.log("      .from(posts)");
  console.log("      .where(and(");
  console.log("        withOrgFilter(posts, currentOrgId),");
  console.log("        isNotDeleted(posts),");
  console.log("        eq(posts.authorId, userId)");
  console.log("      ))");
}

/**
 * Preventing Organization Changes
 *
 * Shows how withoutOrgChange() prevents accidental org reassignment.
 */
function demonstrateOrgChangeProtection(): void {
  console.log("\n--- Preventing Organization Changes (withoutOrgChange) ---");

  // Example update data that might accidentally include org change
  const unsafeUpdateData = {
    title: "Updated Title",
    content: "New content",
    organizationId: OTHER_ORG_ID, // Dangerous! Could move data between orgs
    updatedAt: new Date(),
  };

  // Safe update data after withoutOrgChange
  const safeUpdateData = withoutOrgChange(unsafeUpdateData);

  console.log("  Original update data:");
  console.log(`    ${JSON.stringify({ ...unsafeUpdateData, updatedAt: "[Date]" }, null, 4)}`);

  console.log("\n  After withoutOrgChange():");
  console.log(`    ${JSON.stringify({ ...safeUpdateData, updatedAt: "[Date]" }, null, 4)}`);

  console.log("\n  Usage:");
  console.log("    await db.update(posts)");
  console.log("      .set(withoutOrgChange(updateData))");
  console.log("      .where(eq(posts.id, postId))");
}

/**
 * Soft Delete with Organization Scope
 *
 * Shows combining soft delete and organization filtering.
 */
function demonstrateSoftDeleteWithOrg(): void {
  console.log("\n--- Soft Delete + Organization Scope ---");

  console.log("  Get active posts for organization:");
  console.log("    db.select()");
  console.log("      .from(posts)");
  console.log("      .where(and(");
  console.log("        withOrgFilter(posts, currentOrgId),");
  console.log("        isNotDeleted(posts)");
  console.log("      ))");

  console.log("\n  Get deleted posts (trash) for organization:");
  console.log("    db.select()");
  console.log("      .from(posts)");
  console.log("      .where(and(");
  console.log("        withOrgFilter(posts, currentOrgId),");
  console.log("        isDeleted(posts)");
  console.log("      ))");

  console.log("\n  Soft delete a post:");
  console.log("    await db.update(posts)");
  console.log("      .set({");
  console.log("        ...markAsDeleted(),");
  console.log("        updatedAt: new Date()");
  console.log("      })");
  console.log("      .where(and(");
  console.log("        eq(posts.id, postId),");
  console.log("        withOrgFilter(posts, currentOrgId) // Ensure org ownership");
  console.log("      ))");

  console.log("\n  Restore a deleted post:");
  console.log("    await db.update(posts)");
  console.log("      .set({");
  console.log("        ...markAsRestored(),");
  console.log("        updatedAt: new Date()");
  console.log("      })");
  console.log("      .where(and(");
  console.log("        eq(posts.id, postId),");
  console.log("        withOrgFilter(posts, currentOrgId)");
  console.log("      ))");
}

/**
 * Complete Multi-Tenant CRUD Example
 *
 * Shows full create, read, update, delete with organization context.
 */
function demonstrateCompleteCrud(): void {
  console.log("\n--- Complete Multi-Tenant CRUD ---");

  // CREATE
  console.log("\n  CREATE (always set organizationId):");
  console.log("    const newPost: NewPost = {");
  console.log("      id: createId(),");
  console.log("      organizationId: currentOrgId, // Required!");
  console.log("      title: 'My Post',");
  console.log("      content: 'Content...',");
  console.log("      authorId: currentUserId,");
  console.log("    };");
  console.log("    await db.insert(posts).values(newPost);");

  // READ
  console.log("\n  READ (always filter by organization):");
  console.log("    const orgPosts = await db.select()");
  console.log("      .from(posts)");
  console.log("      .where(and(");
  console.log("        withOrgFilter(posts, currentOrgId),");
  console.log("        isNotDeleted(posts)");
  console.log("      ));");

  // UPDATE
  console.log("\n  UPDATE (protect against org change):");
  console.log("    await db.update(posts)");
  console.log("      .set(withoutOrgChange({");
  console.log("        title: 'New Title',");
  console.log("        updatedAt: new Date()");
  console.log("      }))");
  console.log("      .where(and(");
  console.log("        eq(posts.id, postId),");
  console.log("        withOrgFilter(posts, currentOrgId)");
  console.log("      ));");

  // DELETE
  console.log("\n  DELETE (soft delete with org check):");
  console.log("    await db.update(posts)");
  console.log("      .set({");
  console.log("        ...markAsDeleted(),");
  console.log("        updatedAt: new Date()");
  console.log("      })");
  console.log("      .where(and(");
  console.log("        eq(posts.id, postId),");
  console.log("        withOrgFilter(posts, currentOrgId)");
  console.log("      ));");
}

/**
 * Security Best Practices
 *
 * Important patterns for multi-tenant security.
 */
function demonstrateSecurityPractices(): void {
  console.log("\n--- Security Best Practices ---");

  console.log("\n  1. ALWAYS filter by organization in queries");
  console.log("     Never trust client-provided org IDs for queries");

  console.log("\n  2. ALWAYS validate organization access at API layer");
  console.log("     Verify user belongs to organization before queries");

  console.log("\n  3. Use withOrgFilter() consistently");
  console.log("     Don't manually construct eq(posts.organizationId, ...)");

  console.log("\n  4. Use withoutOrgChange() in updates");
  console.log("     Prevent accidental or malicious org reassignment");

  console.log("\n  5. Check ownership before updates/deletes");
  console.log("     Include org filter in WHERE clause, not just ID");

  console.log("\n  6. Audit sensitive operations");
  console.log("     Log org context for debugging and compliance");
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  console.log("=".repeat(60));
  console.log("@repo/database - Organization-Scoped Query Example");
  console.log("=".repeat(60));

  try {
    // Verify database connection
    console.log("\n--- Verifying Database Connection ---");
    const health = await checkDatabaseHealth({ timeoutMs: 5000 });
    if (health.status !== "healthy") {
      throw new Error(`Database unhealthy: ${health.error}`);
    }
    console.log(`  Database is healthy (${health.latencyMs}ms)`);

    // Demonstrate features
    demonstrateOrgColumns();
    demonstrateOrgFilter();
    demonstrateOrgChangeProtection();
    demonstrateSoftDeleteWithOrg();
    demonstrateCompleteCrud();
    demonstrateSecurityPractices();

    console.log("\n" + "=".repeat(60));
    console.log("Example completed successfully!");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("\nExample failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the example
main().catch((error: unknown) => {
  console.error("Unexpected error:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
