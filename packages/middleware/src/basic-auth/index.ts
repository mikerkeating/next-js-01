/**
 * Basic Auth middleware module.
 *
 * Provides a factory function for creating HTTP Basic Authentication
 * middleware for Next.js applications.
 *
 * @module basic-auth
 */

export { createBasicAuthProxy } from "./create-basic-auth-proxy";
export type { BasicAuthProxyOptions, BasicAuthProxyResult } from "./types";
export { timingSafeEqual, unauthorizedResponse } from "./utils";
