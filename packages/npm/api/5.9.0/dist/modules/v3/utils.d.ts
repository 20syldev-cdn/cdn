/**
 * Shared utility functions for the API modules
 */
/**
 * Return a random element from an array.
 *
 * @param {Array} arr - The array to choose from.
 * @returns {*} - A random element from the array.
 */
export function random(arr: any[]): any;
/**
 * Return a random number between min and max (inclusive).
 *
 * @param {number} min - The minimum number.
 * @param {number} max - The maximum number.
 * @returns {number} - A random number between min and max.
 */
export function randomNumber(min: number, max: number): number;
/**
 * Generate a random IP address.
 *
 * @returns {string} - A random IP address in the format "X.X.X.X".
 */
export function genIP(): string;
/**
 * Format a JavaScript Date object to ISO format without timezone.
 *
 * @param {Date} date - Date object to format
 * @returns {string} - Formatted date string
 */
export function formatDate(date: Date): string;
/**
 * Parse a space-separated env variable into an array, or return null.
 *
 * @param {string} key - The environment variable name.
 * @returns {string[]|null} - The parsed array or null.
 */
export function envList(key: string): string[] | null;
/**
 * Manage rate limiting for users
 *
 * @param {Object} rateLimits - Rate limits object
 * @param {string} userId - User ID
 * @param {number} timestamp - Current timestamp
 * @param {number} window - Time window in milliseconds
 * @param {number} limit - Maximum requests in window
 * @returns {boolean} - True if rate limit is exceeded
 * @throws {Error} - If rate limit is exceeded
 */
export function checkRateLimit(rateLimits: Object, userId: string, timestamp: number, window?: number, limit?: number): boolean;
