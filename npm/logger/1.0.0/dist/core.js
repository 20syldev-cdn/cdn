import { hasTimestamp } from "./timestamp.js";
import { resolveTheme, formatEntry } from "./themes.js";
import { cleanByAge, sortLogs } from "./filters.js";
import { createEventBus } from "./events.js";
import { createServer } from "./server.js";
// ── Main export ──
/**
 * Creates a new logger instance with the given options.
 *
 * @param options - Configuration for max entries, theme, TTL, CORS, etc
 * @returns A fully configured {@link Logger} instance
 */
export function createLogger(options = {}) {
    const maxEntries = options.maxEntries ?? 1000;
    const cors = options.cors ?? "*";
    const defaultOrder = options.order ?? "asc";
    const defaultSort = options.sort ?? "timestamp";
    const consolePrint = options.console ?? true;
    const maxAge = options.maxAge ?? null;
    const theme = resolveTheme(options.theme ?? "colored");
    const timeFormat = options.timeFormat ?? "time";
    let logs = [];
    const { on, off, emit } = createEventBus();
    // ── TTL cleanup ──
    function cleanup() {
        if (maxAge) {
            logs = cleanByAge(logs, maxAge);
        }
    }
    // ── Core ──
    function log(entry, groupName) {
        if (!entry || typeof entry !== "object")
            return null;
        const record = hasTimestamp(entry)
            ? { ...entry }
            : { timestamp: Date.now(), ...entry };
        if (groupName)
            record._group = groupName;
        logs.push(record);
        cleanup();
        if (logs.length > maxEntries) {
            logs = logs.slice(-maxEntries);
        }
        if (consolePrint && theme) {
            process.stdout.write(formatEntry(record, theme, groupName, timeFormat) + "\n");
        }
        emit("log", record);
        return record;
    }
    function request(req, res, extras = {}) {
        return log({
            method: req.method,
            url: req.url,
            status: res.statusCode,
            ...extras,
        });
    }
    function print(entry) {
        if (theme) {
            process.stdout.write(formatEntry(entry, theme, entry?._group, timeFormat) + "\n");
        }
    }
    function entries() {
        cleanup();
        return sortLogs([...logs], defaultSort, defaultOrder);
    }
    function clear() {
        logs = [];
        emit("clear");
    }
    // ── Groups ──
    function group(name) {
        return {
            log: (entry) => log(entry, name),
            request: (req, res, extras = {}) => log({ method: req.method, url: req.url, status: res.statusCode, ...extras }, name),
            print: (entry) => {
                if (theme) {
                    process.stdout.write(formatEntry(entry, theme, name, timeFormat) + "\n");
                }
            },
        };
    }
    // ── HTTP server ──
    function serve(port = 3000) {
        return createServer({
            getLogs: () => [...logs],
            cleanup,
            defaultSort,
            defaultOrder,
            cors,
        }, port);
    }
    return { log, request, print, entries, clear, serve, group, on, off };
}
