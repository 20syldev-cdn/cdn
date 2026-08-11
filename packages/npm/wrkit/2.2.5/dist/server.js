import express from "express";
import path from "path";
const publicDir = path.resolve("public");
export function createServer(logger) {
    const app = express();
    app.use((req, res, next) => {
        const start = Date.now();
        res.on("finish", () => {
            logger.log({
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode,
                duration: `${Date.now() - start}ms`,
            });
        });
        next();
    });
    app.use(express.static(publicDir));
    app.use((req, res) => res.status(500).sendFile(path.join(publicDir, "erreur.html")));
    app.get("/{*path}", (req, res) => res.sendFile(path.join(publicDir, "index.html")));
    return app;
}
//# sourceMappingURL=server.js.map