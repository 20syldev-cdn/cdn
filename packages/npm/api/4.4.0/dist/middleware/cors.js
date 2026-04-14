import cors from 'cors';
import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export function setupCors(app) {
    app.set('trust proxy', 1);
    app.use(cors({ methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'] }));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use('/favicon.ico', express.static(join(__dirname, '..', '..', 'src', 'favicon.ico')));
    app.use('/robots.txt', express.static(join(__dirname, '..', '..', 'robots.txt')));
}
//# sourceMappingURL=cors.js.map