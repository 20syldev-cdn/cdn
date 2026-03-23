import type { LogEntry } from "./types.js";
/**
 * Removes entries older than the given TTL.
 *
 * @param logs - The log entries to filter
 * @param maxAge - Maximum age in seconds
 * @returns Entries that are still within the TTL window
 */
export declare function cleanByAge(logs: LogEntry[], maxAge: number): LogEntry[];
/**
 * Sorts log entries by a given field and order.
 *
 * @param logs - The log entries to sort
 * @param sort - The field name to sort by
 * @param order - Sort direction (`"asc"` or `"desc"`)
 * @returns A new sorted array of entries
 */
export declare function sortLogs(logs: LogEntry[], sort: string, order: "asc" | "desc"): LogEntry[];
/**
 * Filters log entries by exact key-value matches.
 *
 * @param logs - The log entries to filter
 * @param filters - Key-value pairs that entries must match
 * @returns Entries matching all filter criteria
 */
export declare function filterLogs(logs: LogEntry[], filters: Record<string, string>): LogEntry[];
