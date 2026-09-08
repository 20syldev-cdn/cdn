import http from "node:http";
import type { LogEntry } from "./types.js";
export interface ServeContext {
    getLogs(): LogEntry[];
    cleanup(): void;
    defaultSort: string;
    defaultOrder: "asc" | "desc";
    cors: string;
}
/**
 * Creates and starts an HTTP server that exposes the logs as a JSON API.
 *
 * @param ctx - The serve context providing log access and configuration
 * @param port - The port to listen on (defaults to `3000`)
 * @returns The running {@link http.Server} instance
 */
export declare function createServer(ctx: ServeContext, port?: number): http.Server;
