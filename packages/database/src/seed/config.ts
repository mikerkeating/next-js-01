/**
 * Seed Configuration
 *
 * Provides environment-based configuration for database seeding.
 * Different environments have different data volumes and settings.
 *
 * @example
 * ```typescript
 * import { getSeedConfig, getSeedEnvironment } from '@repo/database';
 *
 * const env = getSeedEnvironment();
 * const config = getSeedConfig(env);
 *
 * console.log(`Seeding ${config.counts.users} users for ${env}`);
 * ```
 *
 * @packageDocumentation
 */

/**
 * Valid seed environments.
 *
 * - development: Rich dataset for UI testing and development
 * - test: Minimal dataset for fast test execution
 * - staging: Production-like data for pre-production testing
 */
export type SeedEnvironment = "development" | "test" | "staging";

/**
 * Configuration for entity counts during seeding.
 * These are generic counts that product-specific seeds can use.
 */
export interface SeedCounts {
  /** Number of users to seed */
  users: number;
  /** Number of organizations to seed */
  organizations: number;
}

/**
 * Configuration options for seeding operations.
 */
export interface SeedConfig {
  /** The target environment for seeding */
  environment: SeedEnvironment;
  /** Entity counts for seeding */
  counts: SeedCounts;
  /** Whether to enable verbose logging */
  verbose: boolean;
}

/**
 * Default seed counts per environment.
 */
const SEED_COUNTS: Record<SeedEnvironment, SeedCounts> = {
  development: {
    users: 20,
    organizations: 5,
  },
  test: {
    users: 3,
    organizations: 1,
  },
  staging: {
    users: 50,
    organizations: 10,
  },
};

/**
 * Verbose settings per environment.
 */
const VERBOSE_SETTINGS: Record<SeedEnvironment, boolean> = {
  development: true,
  test: false,
  staging: true,
};

/**
 * Determines the seed environment from NODE_ENV.
 *
 * Maps NODE_ENV values to valid seed environments.
 * Returns 'development' as the default for unrecognized values.
 *
 * @returns The determined seed environment
 *
 * @example
 * ```typescript
 * // With NODE_ENV=test
 * const env = getSeedEnvironment();
 * // Returns: 'test'
 *
 * // With NODE_ENV=production (unrecognized)
 * const env = getSeedEnvironment();
 * // Returns: 'development' (default)
 * ```
 */
export function getSeedEnvironment(): SeedEnvironment {
  const nodeEnv = process.env.NODE_ENV;

  switch (nodeEnv) {
    case "development":
      return "development";
    case "test":
      return "test";
    case "staging":
      return "staging";
    default:
      return "development";
  }
}

/**
 * Gets the seed configuration for a specific environment.
 *
 * Returns pre-configured settings including entity counts and
 * verbose logging preferences based on the target environment.
 *
 * @param environment - The target seed environment
 * @returns The seed configuration for the specified environment
 *
 * @example
 * ```typescript
 * const config = getSeedConfig('test');
 * console.log(config.counts.users); // 3 (minimal for tests)
 * console.log(config.verbose); // false (quiet during tests)
 * ```
 */
export function getSeedConfig(environment: SeedEnvironment): SeedConfig {
  return {
    environment,
    counts: { ...SEED_COUNTS[environment] },
    verbose: VERBOSE_SETTINGS[environment],
  };
}
