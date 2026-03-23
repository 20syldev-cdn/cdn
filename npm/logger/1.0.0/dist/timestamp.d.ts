import type { LogEntry } from "./types.js";
export declare const timestampKeys: string[];
/**
 * Checks whether the entry contains a recognized timestamp key.
 *
 * @param entry - The log entry to inspect
 * @returns `true` if a timestamp field is found
 */
export declare function hasTimestamp(entry: LogEntry): boolean;
/**
 * Extracts the timestamp value from a log entry as a Unix millisecond epoch.
 *
 * @param entry - The log entry to read
 * @returns The timestamp in milliseconds, or `0` if none is found
 */
export declare function getTimestampValue(entry: LogEntry): number;
