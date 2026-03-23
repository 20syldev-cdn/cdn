import type { LoggerOptions, Logger } from "./types.js";
/**
 * Creates a new logger instance with the given options.
 *
 * @param options - Configuration for max entries, theme, TTL, CORS, etc
 * @returns A fully configured {@link Logger} instance
 */
export declare function createLogger(options?: LoggerOptions): Logger;
