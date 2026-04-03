import http from "node:http";
import { sortLogs, filterLogs } from "./filters.js";
/**
 * Creates and starts an HTTP server that exposes the logs as a JSON API.
 *
 * @param ctx - The serve context providing log access and configuration
 * @param port - The port to listen on (defaults to `3000`)
 * @returns The running {@link http.Server} instance
 */
export function createServer(ctx, port = 3000) {
    const corsHeaders = {
        "Access-Control-Allow-Origin": ctx.cors,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };
    const server = http.createServer((req, res) => {
        if (req.method === "OPTIONS") {
            res.writeHead(204, corsHeaders);
            res.end();
            return;
        }
        const url = new URL(req.url, `http://localhost:${port}`);
        if (req.method === "GET" && url.pathname === "/") {
            ctx.cleanup();
            const params = Object.fromEntries(url.searchParams);
            const order = params.order ?? ctx.defaultOrder;
            const sort = params.sort ?? ctx.defaultSort;
            const raw = params.limit ? parseInt(params.limit, 10) : NaN;
            const limit = Number.isFinite(raw) && raw > 0 ? raw : null;
            const filters = {};
            for (const [key, value] of Object.entries(params)) {
                if (!["order", "sort", "limit"].includes(key)) {
                    filters[key] = value;
                }
            }
            let result = ctx.getLogs();
            result = filterLogs(result, filters);
            result = sortLogs(result, sort, order);
            if (limit && limit > 0)
                result = result.slice(0, limit);
            res.writeHead(200, { ...corsHeaders, "Content-Type": "application/json" });
            res.end(JSON.stringify(result));
            return;
        }
        if (req.method === "GET" && url.pathname === "/health") {
            res.writeHead(200, { ...corsHeaders, "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: true, count: ctx.getLogs().length }));
            return;
        }
        res.writeHead(404, corsHeaders);
        res.end();
    });
    server.listen(port, () => {
        console.log(`[logger.ts] Serving on http://localhost:${port}`);
    });
    return server;
}
