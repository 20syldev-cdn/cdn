# @20syldev/logger.ts

A minimalist **Node.js** module to generate, format, and serve structured logs as JSON.

## Installation

```console
npm install @20syldev/logger.ts
```

## Usage

### Import

```js
import { createLogger } from "@20syldev/logger.ts";
```

### Create a logger

```js
const logger = createLogger({
    maxEntries: 500,
    order: "desc",
    theme: "detailed",
});
```

### Log entries

```js
logger.log({
    method: "GET",
    url: "/api/users",
    status: 200,
    duration: "45ms",
});
```

### Log levels

Each entry carries a level: `debug`, `info`, `warn` or `error`. Use the dedicated
methods, or set `level` on the entry yourself.

```js
logger.debug({ method: "GET", url: "/debug/query", status: 200 });
logger.info({ method: "GET", url: "/api/users", status: 200 });
logger.warn({ method: "POST", url: "/api/upload", status: 413 });
logger.error({ method: "DELETE", url: "/api/data", status: 500 });
```

Set a minimum level to drop anything less severe. Entries logged through `.log()`
without an explicit `level` count as `info`.

```js
const logger = createLogger({ level: "warn" });

logger.info({ url: "/noisy" }); // → null, not stored
logger.error({ url: "/boom" }); // → stored
```

The `detailed` theme prints the level; any custom theme can use the `{level}`
placeholder, coloured through `levelDebug`, `levelInfo`, `levelWarn` and `levelError`.

### Log from Node.js request/response

```js
import http from "node:http";

const logger = createLogger();

http.createServer((req, res) => {
    const start = Date.now();
    res.end("OK");
    logger.request(req, res, { duration: `${Date.now() - start}ms` });
}).listen(8080);
```

### Serve logs as JSON API

```js
logger.serve(3000);
// → http://127.0.0.1:3000 returns JSON array of logs
```

Query parameters for ordering and filtering:

```
GET /?order=desc&sort=timestamp
GET /?limit=50&status=200&method=GET
GET /?_group=auth
GET /?level=warn
```

`level` is a minimum, not an exact match: `?level=warn` returns `warn` and `error`
entries.

### Health check

```
GET /health → { "ok": true, "count": 42 }
```

### Groups

```js
const auth = logger.group("auth");
auth.log({ method: "POST", url: "/login", status: 200 });
// Console: [auth] 12:34:56 ✓ POST /login → 200
// Entry includes _group: "auth"
```

### Events

```js
logger.on("log", (entry) => {
    if (entry.status >= 500) sendAlert(entry);
});

logger.on("clear", () => console.log("Logs cleared"));
```

### Console themes

Built-in themes: `minimal`, `colored` (default), `detailed`, `plain`.

```js
// Use a preset
const logger = createLogger({ theme: "detailed" });

// Custom theme
const logger = createLogger({
    theme: {
        format: "{time} {icon} {method} {url} → {status} ({duration})",
        colors: {
            timestamp: "\x1b[90m",
            method: "\x1b[36m",
            status2xx: "\x1b[32m",
            status5xx: "\x1b[31m",
        },
        icons: {
            success: "✓",
            serverError: "✗",
        },
    },
});

// Disable console output
const logger = createLogger({ console: false });

// Manual print
logger.print(entry);
```

## Details

### `createLogger(options)`

Creates a logger instance with the following options:

| Option       | Default       | Description                                                                                                   |
| ------------ | ------------- | ------------------------------------------------------------------------------------------------------------- |
| `maxEntries` | `1000`        | Maximum logs in memory (FIFO eviction)                                                                        |
| `cors`       | `"*"`         | CORS origin header for `serve()`                                                                              |
| `order`      | `"asc"`       | Default sort order (`"asc"` or `"desc"`)                                                                      |
| `sort`       | `"timestamp"` | Default sort field                                                                                            |
| `console`    | `true`        | Auto-print to console on each `.log()`                                                                        |
| `theme`      | `"colored"`   | Theme preset name, custom theme object, or `false` to disable                                                 |
| `maxAge`     | `null`        | TTL in seconds (auto-removes old entries)                                                                     |
| `level`      | `"debug"`     | Minimum level to store (`"debug"`, `"info"`, `"warn"`, `"error"`)                                             |
| `timeFormat` | `"time"`      | Timestamp format: `"time"`, `"iso"`, `"locale"`, `"date"`, `"datetime"`, `"utc"`, or `(date: Date) => string` |

### Methods

| Method                                                              | Description                                                                             |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `.log(entry)`                                                       | Adds a structured entry. Auto-adds `timestamp` if missing. Returns the entry or `null`. |
| `.debug(entry)` / `.info(entry)` / `.warn(entry)` / `.error(entry)` | Same as `.log()`, tagged with the matching level.                                       |
| `.request(req, res, extras)`                                        | Logs from Node.js HTTP objects. Returns the entry or `null`.                            |
| `.print(entry)`                                                     | Manually prints an entry to console.                                                    |
| `.entries()`                                                        | Returns all stored logs (sorted, TTL-filtered).                                         |
| `.clear()`                                                          | Removes all stored logs.                                                                |
| `.serve(port)`                                                      | Starts an HTTP server serving logs as JSON.                                             |
| `.group(name)`                                                      | Creates a sub-logger with a namespace.                                                  |
| `.on(event, cb)`                                                    | Listens to events (`"log"`, `"clear"`).                                                 |
| `.off(event, cb)`                                                   | Removes an event listener.                                                              |

### Public exports

Beyond `createLogger`, the module exposes utilities and types for advanced usage:

```js
import {
    createLogger,
    // Theme utilities
    themes, // Record of built-in theme presets
    resolveTheme, // Resolve a theme name or config into a Theme object
    defaultColors, // Default ANSI color palette
    defaultIcons, // Default status icons
    getLevelColor, // Resolve the ANSI color for a log level
    // Levels
    LOG_LEVELS, // Tuple of level names, least to most severe
    LEVEL_PRIORITY, // Record mapping each level to its numeric priority
    // Event bus
    createEventBus, // Standalone event emitter (used internally)
} from "@20syldev/logger.ts";
```

**TypeScript types:**

```ts
import type {
    LogEntry,
    LogLevel,
    Logger,
    SubLogger,
    LoggerOptions,
    Theme,
    CustomTheme,
    ThemeColors,
    ThemeIcons,
    TimeFormat,
    LoggerEvent,
    EventCallback,
    EventBus,
    ServeContext,
} from "@20syldev/logger.ts";
```
