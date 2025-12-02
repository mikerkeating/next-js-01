/**
 * Seed Framework
 *
 * Provides the main entry point and orchestration for database seeding.
 * Supports environment-based configuration, progress tracking, and
 * transaction-aware seeding for test isolation.
 *
 * @example
 * ```typescript
 * import { runSeed, createSeedRunner } from '@repo/database';
 *
 * // Simple one-time seed
 * const result = await runSeed({
 *   seeds: [
 *     { name: 'users', seed: async () => ({ count: 10 }) },
 *     { name: 'organizations', seed: async () => ({ count: 5 }) },
 *   ],
 *   verbose: true,
 * });
 *
 * // Reusable seed runner
 * const runner = createSeedRunner({ environment: 'development' });
 * runner.addSeed('users', async (config) => {
 *   // Use config.counts.users for data volume
 *   return { count: config.counts.users };
 * });
 * await runner.run();
 * ```
 *
 * @packageDocumentation
 */

import { getSeedConfig, getSeedEnvironment, type SeedConfig, type SeedEnvironment } from "./config";
import { createSeedLogger, createProgressTracker } from "./utils";

// Re-export all seed-related modules
export * from "./config";
export * from "./factories";
export * from "./utils";

/**
 * Result of a single seed function.
 */
export interface SeedFunctionResult {
  /** Number of records seeded */
  count: number;
}

/**
 * A seed function that populates data for a single table/entity.
 */
export type SeedFunction = (config: SeedConfig) => Promise<SeedFunctionResult>;

/**
 * Definition of a seed to run.
 */
export interface SeedDefinition {
  /** Name of the table/entity being seeded */
  name: string;
  /** The seed function to execute */
  seed: SeedFunction;
}

/**
 * Result of a complete seed operation.
 */
export interface SeedResult {
  /** Whether all seeds completed successfully */
  success: boolean;
  /** Total duration of the seed operation in milliseconds */
  durationMs: number;
  /** List of tables that were seeded */
  tablesSeeded: string[];
  /** Total number of records seeded across all tables */
  totalRecords: number;
  /** Error message if seeding failed */
  error?: string;
}

/**
 * Options for running seeds.
 */
export interface SeedOptions {
  /** Array of seed definitions to execute in order */
  seeds: SeedDefinition[];
  /** Whether to enable verbose logging. Default: based on environment */
  verbose?: boolean;
  /** Target environment. Default: from NODE_ENV */
  environment?: SeedEnvironment;
}

/**
 * Interface for a reusable seed runner.
 */
export interface SeedRunner {
  /** Execute all registered seeds */
  run(overrides?: Partial<SeedOptions>): Promise<SeedResult>;
  /** Register a new seed function */
  addSeed(name: string, seed: SeedFunction): void;
  /** Get the current configuration */
  getConfig(): SeedConfig;
}

/**
 * Runs database seeds with the provided options.
 *
 * Executes seeds in order, tracking progress and collecting results.
 * Fails fast on first error and reports which seeds completed.
 *
 * @param options - Seed execution options
 * @returns A promise resolving to the seed result
 *
 * @example
 * ```typescript
 * const result = await runSeed({
 *   seeds: [
 *     { name: 'users', seed: async () => ({ count: 10 }) },
 *     { name: 'organizations', seed: async () => ({ count: 5 }) },
 *   ],
 *   verbose: true,
 * });
 *
 * if (result.success) {
 *   console.log(`Seeded ${result.totalRecords} records`);
 * } else {
 *   console.error(`Seed failed: ${result.error}`);
 * }
 * ```
 */
export async function runSeed(options: SeedOptions): Promise<SeedResult> {
  const { seeds, verbose, environment } = options;
  const startTime = Date.now();

  const env = environment ?? getSeedEnvironment();
  const config = getSeedConfig(env);
  const isVerbose = verbose ?? config.verbose;

  const logger = createSeedLogger({ verbose: isVerbose, prefix: "[seed]" });
  const tracker = createProgressTracker(seeds.map((s) => s.name));

  const tablesSeeded: string[] = [];
  let totalRecords = 0;

  logger.info(`Starting seed for environment: ${env}`);

  try {
    for (const { name, seed } of seeds) {
      const seedStartTime = Date.now();
      logger.seeding(name, config.counts[name as keyof typeof config.counts] ?? 0);

      const result = await seed(config);

      const seedDuration = Date.now() - seedStartTime;
      logger.seeded(name, result.count, seedDuration);

      tablesSeeded.push(name);
      totalRecords += result.count;
      tracker.complete(name);
    }

    const durationMs = Date.now() - startTime;
    logger.success(`Seed complete: ${totalRecords} records in ${durationMs}ms`);

    return {
      success: true,
      durationMs,
      tablesSeeded,
      totalRecords,
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    logger.error(`Seed failed: ${errorMessage}`);

    return {
      success: false,
      durationMs,
      tablesSeeded,
      totalRecords,
      error: errorMessage,
    };
  }
}

/**
 * Creates a reusable seed runner with configurable options.
 *
 * The runner allows registering seed functions and executing them
 * with consistent configuration. Useful for building seed scripts
 * that can be run in different environments.
 *
 * @param defaultOptions - Default options for the runner
 * @returns A SeedRunner instance
 *
 * @example
 * ```typescript
 * const runner = createSeedRunner({
 *   environment: 'development',
 *   verbose: true,
 * });
 *
 * runner.addSeed('users', async (config) => {
 *   // Generate users based on config.counts.users
 *   const users = createUserData({ _count: config.counts.users });
 *   // ... insert users
 *   return { count: users.length };
 * });
 *
 * runner.addSeed('organizations', async (config) => {
 *   // Generate organizations
 *   return { count: config.counts.organizations };
 * });
 *
 * const result = await runner.run();
 * ```
 */
export function createSeedRunner(
  defaultOptions: Partial<Omit<SeedOptions, "seeds">> = {}
): SeedRunner {
  const seeds: SeedDefinition[] = [];
  const env = defaultOptions.environment ?? getSeedEnvironment();
  const config = getSeedConfig(env);

  return {
    addSeed(name: string, seed: SeedFunction): void {
      seeds.push({ name, seed });
    },

    getConfig(): SeedConfig {
      return config;
    },

    async run(overrides: Partial<SeedOptions> = {}): Promise<SeedResult> {
      return runSeed({
        seeds: overrides.seeds ?? seeds,
        verbose: overrides.verbose ?? defaultOptions.verbose,
        environment: overrides.environment ?? defaultOptions.environment,
      });
    },
  };
}

/**
 * Main entry point for CLI seed execution.
 *
 * This function is intended to be called from a CLI script.
 * It runs seeds based on the current NODE_ENV and exits with
 * appropriate exit codes.
 *
 * @param seeds - Array of seed definitions to run
 *
 * @example
 * ```typescript
 * // scripts/seed.ts
 * import { main as runSeeds } from '@repo/database/seed';
 *
 * runSeeds([
 *   { name: 'users', seed: seedUsers },
 *   { name: 'organizations', seed: seedOrganizations },
 * ]);
 * ```
 */
export async function main(seeds: SeedDefinition[]): Promise<void> {
  const env = getSeedEnvironment();

  console.warn(`\n🌱 Database Seed - Environment: ${env}\n`);

  const result = await runSeed({
    seeds,
    verbose: true,
    environment: env,
  });

  if (!result.success) {
    console.error(`\n❌ Seed failed: ${result.error}\n`);
    process.exit(1);
  }

  console.warn(`\n✅ Seed complete!\n`);
  console.warn(`   Tables: ${result.tablesSeeded.join(", ")}`);
  console.warn(`   Records: ${result.totalRecords}`);
  console.warn(`   Duration: ${result.durationMs}ms\n`);
}
