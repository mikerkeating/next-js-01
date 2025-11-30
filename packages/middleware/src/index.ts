/**
 * @repo/middleware - Shared middleware utilities for Next.js applications.
 *
 * @module @repo/middleware
 */

export { createBasicAuthProxy, timingSafeEqual, unauthorizedResponse } from "./basic-auth";
export type { BasicAuthProxyOptions, BasicAuthProxyResult } from "./basic-auth";
