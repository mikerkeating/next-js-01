#!/usr/bin/env tsx
/**
 * Database Connection Verification Script
 *
 * CLI utility to verify database connectivity and report connection details.
 * Useful for validating environment configuration before running tests or deployments.
 *
 * Usage:
 *   DATABASE_URL="postgres://..." pnpm --filter @repo/database run verify-connection
 *
 * Exit codes:
 *   0 - Connection successful
 *   1 - Connection failed
 *
 * @example
 * ```bash
 * # Verify local Docker database
 * DATABASE_URL="postgres://postgres:postgres@localhost:5432/postgres" \
 *   pnpm --filter @repo/database run verify-connection
 *
 * # Verify Neon database
 * DATABASE_URL="postgres://user:pass@ep-example.neon.tech/neondb" \
 *   pnpm --filter @repo/database run verify-connection
 * ```
 */

import { getDatabaseType } from "../src/client-factory";

/**
 * Connection verification result
 */
interface VerificationResult {
  success: boolean;
  databaseType: "neon" | "local" | "unknown";
  latencyMs: number;
  error?: string;
  timestamp: string;
}

/**
 * ANSI color codes for terminal output
 */
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
};

/**
 * Formats a duration in milliseconds for display
 */
function formatDuration(ms: number): string {
  if (ms < 100) {
    return `${colors.green}${ms.toFixed(2)}ms${colors.reset}`;
  }
  if (ms < 500) {
    return `${colors.yellow}${ms.toFixed(2)}ms${colors.reset}`;
  }
  return `${colors.red}${ms.toFixed(2)}ms${colors.reset}`;
}

/**
 * Masks sensitive parts of a database URL for safe logging
 */
function maskDatabaseUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.password) {
      parsed.password = "****";
    }
    return parsed.toString();
  } catch {
    // If URL parsing fails, do basic masking
    return url.replace(/:[^:@]+@/, ":****@");
  }
}

/**
 * Verifies database connection by executing a simple query
 */
async function verifyConnection(): Promise<VerificationResult> {
  const databaseUrl = process.env.DATABASE_URL;
  const timestamp = new Date().toISOString();

  if (!databaseUrl) {
    return {
      success: false,
      databaseType: "unknown",
      latencyMs: 0,
      error: "DATABASE_URL environment variable is not set",
      timestamp,
    };
  }

  const databaseType = getDatabaseType(databaseUrl);
  const startTime = performance.now();

  try {
    // Dynamically import the database client to avoid initialization errors
    // when DATABASE_URL is not set
    const { checkDatabaseHealth } = await import("../src/connection");

    const health = await checkDatabaseHealth({ timeoutMs: 10000 });
    const latencyMs = performance.now() - startTime;

    if (health.status === "healthy") {
      return {
        success: true,
        databaseType,
        latencyMs,
        timestamp,
      };
    }

    return {
      success: false,
      databaseType,
      latencyMs,
      error: health.error ?? "Health check returned unhealthy status",
      timestamp,
    };
  } catch (error) {
    const latencyMs = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      databaseType,
      latencyMs,
      error: errorMessage,
      timestamp,
    };
  }
}

/**
 * Prints the verification result to console
 */
function printResult(result: VerificationResult): void {
  const databaseUrl = process.env.DATABASE_URL ?? "";

  console.log("");
  console.log(
    `${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`
  );
  console.log(
    `${colors.cyan}║${colors.reset}          Database Connection Verification                 ${colors.cyan}║${colors.reset}`
  );
  console.log(
    `${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}`
  );
  console.log("");

  // Connection URL (masked)
  console.log(`  ${colors.dim}URL:${colors.reset}       ${maskDatabaseUrl(databaseUrl)}`);

  // Database type
  const typeLabel =
    result.databaseType === "neon"
      ? `${colors.cyan}Neon Serverless${colors.reset}`
      : result.databaseType === "local"
        ? `${colors.cyan}Local PostgreSQL${colors.reset}`
        : `${colors.yellow}Unknown${colors.reset}`;
  console.log(`  ${colors.dim}Type:${colors.reset}      ${typeLabel}`);

  // Status
  if (result.success) {
    console.log(
      `  ${colors.dim}Status:${colors.reset}    ${colors.green}✓ Connected${colors.reset}`
    );
    console.log(`  ${colors.dim}Latency:${colors.reset}   ${formatDuration(result.latencyMs)}`);

    // Performance feedback
    if (result.latencyMs < 100) {
      console.log(
        `  ${colors.dim}Quality:${colors.reset}   ${colors.green}Excellent${colors.reset} (< 100ms target met)`
      );
    } else if (result.latencyMs < 500) {
      console.log(
        `  ${colors.dim}Quality:${colors.reset}   ${colors.yellow}Acceptable${colors.reset} (consider connection pooling)`
      );
    } else {
      console.log(
        `  ${colors.dim}Quality:${colors.reset}   ${colors.red}Slow${colors.reset} (investigate connection issues)`
      );
    }
  } else {
    console.log(`  ${colors.dim}Status:${colors.reset}    ${colors.red}✗ Failed${colors.reset}`);
    console.log(
      `  ${colors.dim}Error:${colors.reset}     ${colors.red}${result.error}${colors.reset}`
    );
  }

  console.log(`  ${colors.dim}Timestamp:${colors.reset} ${result.timestamp}`);
  console.log("");

  if (result.success) {
    console.log(`  ${colors.green}Database connection verified successfully!${colors.reset}`);
  } else {
    console.log(`  ${colors.red}Database connection failed.${colors.reset}`);
    console.log("");
    console.log(`  ${colors.dim}Troubleshooting:${colors.reset}`);
    console.log(`    1. Verify DATABASE_URL is correctly formatted`);
    console.log(`    2. Ensure the database server is running`);
    console.log(`    3. Check network connectivity and firewall rules`);
    console.log(`    4. Verify credentials are correct`);
  }

  console.log("");
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  const result = await verifyConnection();
  printResult(result);
  process.exit(result.success ? 0 : 1);
}

main().catch((error: unknown) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
