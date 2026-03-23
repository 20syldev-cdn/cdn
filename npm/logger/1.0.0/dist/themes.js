import { reset, ansi } from "./ansi.js";
import { getTimestampValue } from "./timestamp.js";
// ── Theme presets ──
export const defaultIcons = {
    success: "\u2713",
    redirect: "\u21bb",
    clientError: "\u2717",
    serverError: "\u2717",
    default: "\u25cf",
};
export const defaultColors = {
    timestamp: ansi.gray,
    method: ansi.cyan,
    url: ansi.white,
    status2xx: ansi.green,
    status3xx: ansi.blue,
    status4xx: ansi.yellow,
    status5xx: ansi.red,
    duration: ansi.gray,
    group: ansi.magenta,
    key: ansi.gray,
    value: ansi.white,
};
export const themes = {
    minimal: {
        format: "{status} {method} {url}",
        colors: null,
        icons: null,
    },
    colored: {
        format: "{time} {method} {url} {status} {duration}",
        colors: defaultColors,
        icons: null,
    },
    detailed: {
        format: "{time} {icon} {method} {url} \u2192 {status} {duration}",
        colors: defaultColors,
        icons: defaultIcons,
    },
    plain: {
        format: "{time} {method} {url} {status} {duration}",
        colors: null,
        icons: null,
    },
};
/**
 * Resolves a theme identifier or custom config into a full Theme object.
 *
 * @param theme - A preset name, a custom theme config, or `false` to disable
 * @returns The resolved theme, or `null` if theming is disabled
 */
export function resolveTheme(theme) {
    if (theme === undefined || theme === false || theme === "")
        return null;
    if (typeof theme === "string")
        return themes[theme] ?? themes.colored;
    return {
        format: theme.format ?? themes.colored.format,
        colors: theme.colors ? { ...defaultColors, ...theme.colors } : defaultColors,
        icons: theme.icons ? { ...defaultIcons, ...theme.icons } : null,
    };
}
/**
 * Returns the ANSI color code for a given HTTP status code.
 *
 * @param status - The HTTP status code as a string
 * @param colors - The theme color palette, or `null` if colors are disabled
 * @returns The matching ANSI escape sequence, or an empty string
 */
export function getStatusColor(status, colors) {
    if (!colors)
        return "";
    const code = parseInt(status, 10);
    if (code >= 500)
        return colors.status5xx ?? "";
    if (code >= 400)
        return colors.status4xx ?? "";
    if (code >= 300)
        return colors.status3xx ?? "";
    if (code >= 200)
        return colors.status2xx ?? "";
    return "";
}
/**
 * Returns the icon character for a given HTTP status code.
 *
 * @param status - The HTTP status code as a string
 * @param icons - The theme icon set, or `null` if icons are disabled
 * @returns The matching icon, or an empty string
 */
export function getStatusIcon(status, icons) {
    if (!icons)
        return "";
    const code = parseInt(status, 10);
    if (code >= 500)
        return icons.serverError ?? icons.default ?? "";
    if (code >= 400)
        return icons.clientError ?? icons.default ?? "";
    if (code >= 300)
        return icons.redirect ?? icons.default ?? "";
    if (code >= 200)
        return icons.success ?? icons.default ?? "";
    return icons.default ?? "";
}
/**
 * Formats the timestamp of a log entry according to the given time format.
 *
 * @param entry - The log entry containing a timestamp field
 * @param timeFormat - The desired output format (defaults to `"time"`)
 * @returns The formatted time string, or an empty string if no timestamp is found
 */
export function formatTime(entry, timeFormat = "time") {
    const ts = getTimestampValue(entry);
    if (!ts)
        return "";
    const d = new Date(ts);
    if (typeof timeFormat === "function")
        return timeFormat(d);
    switch (timeFormat) {
        case "iso":
            return d.toISOString();
        case "locale":
            return d.toLocaleString();
        case "date": {
            const yyyy = d.getFullYear();
            const mo = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            return `${yyyy}-${mo}-${dd}`;
        }
        case "datetime": {
            const yyyy = d.getFullYear();
            const mo = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            const hh = String(d.getHours()).padStart(2, "0");
            const mm = String(d.getMinutes()).padStart(2, "0");
            const ss = String(d.getSeconds()).padStart(2, "0");
            return `${yyyy}-${mo}-${dd} ${hh}:${mm}:${ss}`;
        }
        case "utc":
            return d.toUTCString();
        case "time":
        default: {
            const hh = String(d.getHours()).padStart(2, "0");
            const mm = String(d.getMinutes()).padStart(2, "0");
            const ss = String(d.getSeconds()).padStart(2, "0");
            return `${hh}:${mm}:${ss}`;
        }
    }
}
/**
 * Looks up the first matching field from a list of candidate key names (case-insensitive).
 *
 * @param entry - The log entry to search
 * @param names - Lowercase candidate key names to match against
 * @returns The stringified field value, or an empty string if no match is found
 */
export function findField(entry, names) {
    for (const name of names) {
        for (const key of Object.keys(entry)) {
            if (key.toLowerCase() === name)
                return String(entry[key]);
        }
    }
    return "";
}
/**
 * Formats a log entry into a styled terminal string using the given theme.
 *
 * @param entry - The log entry to format
 * @param theme - The theme defining format, colors, and icons
 * @param groupName - Optional group label to prepend
 * @param timeFormat - Optional time format override
 * @returns The formatted, colorized output line
 */
export function formatEntry(entry, theme, groupName, timeFormat) {
    const { format, colors, icons } = theme;
    const c = (color, text) => colors && color && text ? `${color}${text}${reset}` : text;
    const time = formatTime(entry, timeFormat);
    const method = findField(entry, ["method", "httpmethod", "http_method", "verb"]);
    const url = findField(entry, ["url", "path", "endpoint", "route", "uri"]);
    const status = findField(entry, ["status", "statuscode", "status_code", "code"]);
    const duration = findField(entry, [
        "duration",
        "elapsed",
        "latency",
        "responsetime",
        "response_time",
        "ms",
    ]);
    const icon = getStatusIcon(status, icons);
    let line = format
        .replace("{time}", c(colors?.timestamp, time))
        .replace("{method}", c(colors?.method, method))
        .replace("{url}", c(colors?.url, url))
        .replace("{status}", c(getStatusColor(status, colors), status))
        .replace("{duration}", c(colors?.duration, duration))
        .replace("{icon}", c(getStatusColor(status, colors), icon));
    if (groupName) {
        line = `${c(colors?.group, `[${groupName}]`)} ${line}`;
    }
    return line.replace(/ {2,}/g, " ").trim();
}
