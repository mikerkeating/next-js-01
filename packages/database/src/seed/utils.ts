/**
 * Seed Utilities
 *
 * Provides helper functions for seeding operations including logging,
 * progress tracking, and error handling.
 *
 * @example
 * ```typescript
 * import { createSeedLogger, createProgressTracker } from '@repo/database';
 *
 * const logger = createSeedLogger({ verbose: true, prefix: '[SEED]' });
 * const tracker = createProgressTracker(['users', 'organizations']);
 *
 * logger.seeding('users', 10);
 * // ... seed users
 * tracker.complete('users');
 * logger.seeded('users', 10, 150);
 *
 * console.log(tracker.getProgress()); // { total: 2, completed: 1, percentage: 50 }
 * ```
 *
 * @packageDocumentation
 */

/**
 * Error codes for seed-related failures.
 */
export type SeedErrorCode = "SEED_FAILED" | "CLEAR_FAILED" | "INVALID_CONFIG" | "CONNECTION_ERROR";

/**
 * Custom error class for seed failures.
 * Provides additional context through error codes for programmatic handling.
 */
export class SeedError extends Error {
  /** Unique error code for programmatic handling */
  readonly code: SeedErrorCode;

  constructor(message: string, code: SeedErrorCode, cause?: Error) {
    super(message);
    this.name = "SeedError";
    this.code = code;
    this.cause = cause;
  }
}

/**
 * Logger options for seed operations.
 */
export interface SeedLoggerOptions {
  /** Whether to output log messages. Default: true */
  verbose?: boolean;
  /** Prefix for all log messages. Default: '' */
  prefix?: string;
}

/**
 * Logger interface for seed operations.
 */
export interface SeedLogger {
  /** Log an informational message */
  info(message: string): void;
  /** Log an error message (always shown) */
  error(message: string): void;
  /** Log a success message */
  success(message: string): void;
  /** Log start of seeding a table */
  seeding(tableName: string, count: number): void;
  /** Log completion of seeding a table */
  seeded(tableName: string, count: number, durationMs: number): void;
}

/**
 * Creates a logger for seed operations.
 *
 * The logger respects the verbose setting for info/success messages,
 * but always logs error messages.
 *
 * @param options - Logger configuration options
 * @returns A SeedLogger instance
 *
 * @example
 * ```typescript
 * const logger = createSeedLogger({ verbose: true, prefix: '[DB]' });
 *
 * logger.info('Starting seed process');
 * logger.seeding('users', 10);
 * logger.seeded('users', 10, 150);
 * logger.success('Seed complete');
 * ```
 */
export function createSeedLogger(options: SeedLoggerOptions = {}): SeedLogger {
  const { verbose = true, prefix = "" } = options;

  const formatMessage = (message: string): string => {
    return prefix ? `${prefix} ${message}` : message;
  };

  return {
    info(message: string): void {
      if (verbose) {
        console.log(formatMessage(message));
      }
    },

    error(message: string): void {
      console.error(formatMessage(message));
    },

    success(message: string): void {
      if (verbose) {
        console.log(formatMessage(`✓ ${message}`));
      }
    },

    seeding(tableName: string, count: number): void {
      if (verbose) {
        console.log(formatMessage(`Seeding ${tableName} with ${count} records...`));
      }
    },

    seeded(tableName: string, count: number, durationMs: number): void {
      if (verbose) {
        console.log(formatMessage(`✓ Seeded ${tableName}: ${count} records in ${durationMs}ms`));
      }
    },
  };
}

/**
 * Progress information for seed operations.
 */
export interface SeedProgress {
  /** Total number of tables to seed */
  total: number;
  /** Number of tables completed */
  completed: number;
  /** Completion percentage (0-100) */
  percentage: number;
}

/**
 * Interface for tracking seed progress across tables.
 */
export interface ProgressTracker {
  /** Mark a table as completed */
  complete(tableName: string): void;
  /** Get current progress summary */
  getProgress(): SeedProgress;
  /** Get list of pending table names */
  getPending(): string[];
  /** Get list of completed table names */
  getCompleted(): string[];
}

/**
 * Creates a progress tracker for seed operations.
 *
 * Tracks which tables have been seeded and calculates completion percentage.
 *
 * @param tables - Array of table names to track
 * @returns A ProgressTracker instance
 *
 * @example
 * ```typescript
 * const tracker = createProgressTracker(['users', 'organizations', 'posts']);
 *
 * tracker.complete('users');
 * console.log(tracker.getProgress());
 * // { total: 3, completed: 1, percentage: 33 }
 *
 * console.log(tracker.getPending());
 * // ['organizations', 'posts']
 * ```
 */
export function createProgressTracker(tables: string[]): ProgressTracker {
  const tableSet = new Set(tables);
  const completed = new Set<string>();

  return {
    complete(tableName: string): void {
      if (tableSet.has(tableName)) {
        completed.add(tableName);
      }
    },

    getProgress(): SeedProgress {
      const total = tableSet.size;
      const completedCount = completed.size;
      const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

      return {
        total,
        completed: completedCount,
        percentage,
      };
    },

    getPending(): string[] {
      return tables.filter((t) => !completed.has(t));
    },

    getCompleted(): string[] {
      return tables.filter((t) => completed.has(t));
    },
  };
}
