import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Server-side environment variables schema.
   * These are only available on the server and are never exposed to the client.
   */
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    // Database (optional for steel thread, required in future)
    DATABASE_URL: z.string().url().optional(),

    // Authentication (optional for steel thread, required in future)
    CLERK_SECRET_KEY: z.string().min(1).optional(),
    CLERK_WEBHOOK_SECRET: z.string().min(1).optional(),

    // Monitoring (optional)
    SENTRY_DSN: z.string().url().optional(),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),

    // Notifications (optional)
    SLACK_WEBHOOK_URL: z.string().url().optional(),

    // Basic Auth (optional - disabled when not set)
    // Used for pre-release protection before public release
    BASIC_AUTH_USERNAME: z.string().min(1).optional(),
    BASIC_AUTH_PASSWORD: z.string().min(1).optional(),

    // Encryption (optional for steel thread)
    ENCRYPTION_KEY: z
      .string()
      .length(44)
      .describe("Base64 encoded 32 bytes")
      .optional(),
  },

  /**
   * Client-side environment variables schema.
   * These are exposed to the client and must be prefixed with NEXT_PUBLIC_.
   */
  client: {
    // Application URL (optional - Vercel provides VERCEL_URL automatically)
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),

    // Authentication (optional for steel thread, required in future)
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),

    // Analytics (optional)
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  },

  /**
   * Runtime environment mapping.
   * Maps environment variables to the schema.
   */
  runtimeEnv: {
    // Server
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
    BASIC_AUTH_USERNAME: process.env.BASIC_AUTH_USERNAME,
    BASIC_AUTH_PASSWORD: process.env.BASIC_AUTH_PASSWORD,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,

    // Client
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  },

  /**
   * Skip validation during CI builds without secrets.
   * Set SKIP_ENV_VALIDATION=true to skip.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR=""` is treated as `SOME_VAR` not being set.
   */
  emptyStringAsUndefined: true,
});
