import type { LogEntry, ThemeColors, ThemeIcons, Theme, CustomTheme, TimeFormat } from "./types.js";
export declare const defaultIcons: ThemeIcons;
export declare const defaultColors: ThemeColors;
export declare const themes: Record<string, Theme>;
/**
 * Resolves a theme identifier or custom config into a full Theme object.
 *
 * @param theme - A preset name, a custom theme config, or `false` to disable
 * @returns The resolved theme, or `null` if theming is disabled
 */
export declare function resolveTheme(theme: string | CustomTheme | false | undefined): Theme | null;
/**
 * Returns the ANSI color code for a given HTTP status code.
 *
 * @param status - The HTTP status code as a string
 * @param colors - The theme color palette, or `null` if colors are disabled
 * @returns The matching ANSI escape sequence, or an empty string
 */
export declare function getStatusColor(status: string, colors: ThemeColors | null): string;
/**
 * Returns the icon character for a given HTTP status code.
 *
 * @param status - The HTTP status code as a string
 * @param icons - The theme icon set, or `null` if icons are disabled
 * @returns The matching icon, or an empty string
 */
export declare function getStatusIcon(status: string, icons: ThemeIcons | null): string;
/**
 * Formats the timestamp of a log entry according to the given time format.
 *
 * @param entry - The log entry containing a timestamp field
 * @param timeFormat - The desired output format (defaults to `"time"`)
 * @returns The formatted time string, or an empty string if no timestamp is found
 */
export declare function formatTime(entry: LogEntry, timeFormat?: TimeFormat): string;
/**
 * Looks up the first matching field from a list of candidate key names (case-insensitive).
 *
 * @param entry - The log entry to search
 * @param names - Lowercase candidate key names to match against
 * @returns The stringified field value, or an empty string if no match is found
 */
export declare function findField(entry: LogEntry, names: string[]): string;
/**
 * Formats a log entry into a styled terminal string using the given theme.
 *
 * @param entry - The log entry to format
 * @param theme - The theme defining format, colors, and icons
 * @param groupName - Optional group label to prepend
 * @param timeFormat - Optional time format override
 * @returns The formatted, colorized output line
 */
export declare function formatEntry(entry: LogEntry, theme: Theme, groupName?: string, timeFormat?: TimeFormat): string;
