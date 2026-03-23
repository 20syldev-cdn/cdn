import type http from "node:http";
export type LogEntry = Record<string, unknown>;
export interface ThemeColors {
    timestamp?: string;
    method?: string;
    url?: string;
    status2xx?: string;
    status3xx?: string;
    status4xx?: string;
    status5xx?: string;
    duration?: string;
    group?: string;
    key?: string;
    value?: string;
}
export interface ThemeIcons {
    success?: string;
    redirect?: string;
    clientError?: string;
    serverError?: string;
    default?: string;
}
export interface Theme {
    format: string;
    colors: ThemeColors | null;
    icons: ThemeIcons | null;
}
export interface CustomTheme {
    format?: string;
    colors?: Partial<ThemeColors>;
    icons?: Partial<ThemeIcons>;
}
export type TimeFormat = "time" | "iso" | "locale" | "date" | "datetime" | "utc" | ((date: Date) => string);
export type LoggerEvent = "log" | "clear";
export type EventCallback = (data?: LogEntry) => void;
export interface LoggerOptions {
    maxEntries?: number;
    cors?: string;
    order?: "asc" | "desc";
    sort?: string;
    console?: boolean;
    theme?: string | CustomTheme | false;
    maxAge?: number | null;
    timeFormat?: TimeFormat;
}
export interface SubLogger {
    log: (entry: LogEntry) => LogEntry | null;
    request: (req: http.IncomingMessage, res: http.ServerResponse, extras?: LogEntry) => LogEntry | null;
    print: (entry: LogEntry) => void;
}
export interface Logger extends SubLogger {
    entries: () => LogEntry[];
    clear: () => void;
    serve: (port?: number) => http.Server;
    group: (name: string) => SubLogger;
    on: (event: LoggerEvent, callback: EventCallback) => void;
    off: (event: LoggerEvent, callback: EventCallback) => void;
}
