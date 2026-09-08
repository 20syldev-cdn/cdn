import type { LogEntry, LoggerEvent, EventCallback } from "./types.js";
export interface EventBus {
    on(event: LoggerEvent, callback: EventCallback): void;
    off(event: LoggerEvent, callback: EventCallback): void;
    emit(event: LoggerEvent, data?: LogEntry): void;
}
export declare function createEventBus(): EventBus;
