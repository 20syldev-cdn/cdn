import cors from 'cors';
import express from 'express';
import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createLogger } from '@20syldev/logger.ts';
import { getPackages, searchPackages, countPackages } from './lib/packages.js';
import { getFilesSHA256 } from './lib/checksum.js';
import { sendArchive } from './lib/archive.js';
import type { PackageProject } from './types/index.js';
import type { Request, Response, NextFunction } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

const app = express();
const logger = createLogger({ theme: 'colored', order: 'desc' });
const pkg = JSON.parse(fs.readFileSync(join(ROOT_DIR, 'package.json'), 'utf-8'));
const startTime = Date.now();

// Dynamic packages object
const packages = getPackages(ROOT_DIR);

// Define global variables
let requests = 0,
    resetTime = Date.now() + 10000;

// ----------- ----------- MIDDLEWARES SETUP ----------- ----------- //

// CORS & Express setup
app.use(cors({ methods: ['GET'] }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set favicon for API
app.use('/favicon.ico', express.static(join(ROOT_DIR, 'public', 'favicon.ico')));

// Display robots.txt
app.use('/robots.txt', express.static(join(ROOT_DIR, 'robots.txt')));

// Return formatted JSON
app.use((req: Request, res: Response, next: NextFunction) => {
    res.jsonResponse = (data: unknown) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(data, null, 2));
    };
    next();
});

// Log requests
app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
        logger.request(req, res, { url: req.originalUrl, duration: `${Date.now() - start}ms` });
    });
    next();
});

// Too many requests
app.use((req: Request, res: Response, next: NextFunction) => {
    if (Date.now() > resetTime) {
        requests = 0;
        resetTime = Date.now() + 10000;
    }
    if (++requests > 1000) return res.status(429).jsonResponse({ message: 'Too Many Requests' });
    next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    const uptime = (Date.now() - startTime) / 1000;
    const mem = process.memoryUsage();
    res.jsonResponse({
        status: 'ok',
        version: pkg.version,
        uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
        packages: countPackages(packages),
        memory: {
            rss: `${(mem.rss / 1024 / 1024).toFixed(2)} MB`,
            heapUsed: `${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`,
            heapTotal: `${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        },
    });
});

// Search packages by name
app.get('/search', (req: Request, res: Response) => {
    const query = req.query.q as string | undefined;
    if (!query || query.trim().length === 0) {
        return res.status(400).jsonResponse({
            message: 'Bad Request',
            error: 'Missing required query parameter: q',
            status: '400',
        });
    }
    const results = searchPackages(packages, query.trim());
    res.jsonResponse({
        query: query.trim(),
        count: results.length,
        results,
    });
});

// List all downloadable packages
app.get('/download', (req: Request, res: Response) => {
    const downloads: Record<string, Record<string, unknown>> = {};
    for (const type of Object.keys(packages)) {
        downloads[type] = {};
        for (const project of Object.keys(packages[type])) {
            if (project === 'list' || project === 'download') continue;
            const entry = packages[type][project] as PackageProject;
            const versions = Object.keys(entry.versions).filter((v) => v !== 'latest');
            downloads[type][project] = {
                latest: `/download/${type}/${project}`,
                versions: versions.reduce<Record<string, string>>((acc, v) => {
                    acc[v] = `/download/${type}/${project}@${v}`;
                    return acc;
                }, {}),
            };
        }
    }
    res.jsonResponse({
        message: 'Available packages for download (.tar.gz).',
        downloads,
    });
});

// List downloadable packages for a specific type
app.get('/download/:type', (req: Request, res: Response) => {
    const type = req.params.type as string;

    if (!packages[type]) {
        return res.status(404).jsonResponse({
            message: 'Not Found',
            error: `Package type '${type}' does not exist.`,
            status: '404',
        });
    }

    const downloads: Record<string, unknown> = {};
    for (const project of Object.keys(packages[type])) {
        if (project === 'list' || project === 'download') continue;
        const entry = packages[type][project] as PackageProject;
        const versions = Object.keys(entry.versions).filter((v) => v !== 'latest');
        downloads[project] = {
            latest: `/download/${type}/${project}`,
            versions: versions.reduce<Record<string, string>>((acc, v) => {
                acc[v] = `/download/${type}/${project}@${v}`;
                return acc;
            }, {}),
        };
    }
    res.jsonResponse({
        message: `Downloadable ${type} packages (.tar.gz).`,
        downloads,
    });
});

// Browser-friendly download route
app.get('/download/:type/:project', (req: Request, res: Response) => {
    const type = req.params.type as string;
    const project = req.params.project as string;
    const [name, version] = project.split('@');

    if (!packages[type] || !packages[type][name]) {
        return res.status(404).jsonResponse({
            message: 'Not Found',
            error: `Project '${name}' does not exist in /${type}.`,
            status: '404',
        });
    }

    const entry = packages[type][name] as PackageProject;
    let resolvedVersion = version || 'latest';
    if (resolvedVersion === 'latest') {
        const versionKeys = Object.keys(entry.versions);
        resolvedVersion = versionKeys[versionKeys.length - 1];
    } else if (!entry.versions[resolvedVersion]) {
        return res.status(404).jsonResponse({
            message: 'Not Found',
            error: `Version ${resolvedVersion} does not exist in the '${name}' project.`,
            status: '404',
        });
    }

    sendArchive(res, type, name, resolvedVersion, ROOT_DIR);
});

// Check if package type exists
app.use('/:type', (req: Request, res: Response, next: NextFunction) => {
    const type = req.params.type as string;

    if (!Object.keys(packages).includes(type)) {
        return res.status(404).jsonResponse({
            message: 'Not Found',
            error: `Package type '${type}' does not exist.`,
            status: '404',
        });
    }
    next();
});

// Changelog endpoint for a project
app.get('/:type/:project/changelog', (req: Request, res: Response) => {
    const type = req.params.type as string;
    const project = req.params.project as string;

    if (!packages[type] || !packages[type][project]) {
        return res.status(404).jsonResponse({
            message: 'Not Found',
            error: `Project '${project}' does not exist in /${type}.`,
            status: '404',
        });
    }

    const entry = packages[type][project] as PackageProject;
    const versions = Object.keys(entry.versions).filter((v) => v !== 'latest');

    const changelog = versions.map((version) => {
        const versionPath = join(ROOT_DIR, type, project, version);
        const stat = fs.statSync(versionPath);
        return {
            version,
            date: stat.mtime.toISOString().split('T')[0],
            url: `/${type}/${project}@${version}`,
        };
    });

    res.setHeader('Cache-Control', 'public, max-age=300');
    res.jsonResponse({ name: project, type, versions: changelog.length, changelog });
});

// Check if project exists
app.use('/:type/:project', (req: Request, res: Response, next: NextFunction) => {
    const type = req.params.type as string;
    const project = req.params.project as string;
    const [name, version] = project.split('@');

    req.name = name;
    req.version = version;

    if (!packages[type] || !packages[type][name]) {
        return res.status(404).jsonResponse({
            message: 'Not Found',
            error: `Project '${name}' does not exist in /${type}.`,
            status: '404',
        });
    }

    if (!version) {
        const entry = packages[type][name] as PackageProject;
        const versions = Object.keys(entry.versions).reduce<Record<string, string>>((acc, ver) => {
            acc[ver] = `/${type}/${name}@${ver}`;
            return acc;
        }, {});

        return res.jsonResponse({
            message: `Available versions for the '${name}' project.`,
            versions,
        });
    }

    if (version === 'latest') {
        const entry = packages[type][name] as PackageProject;
        const versionKeys = Object.keys(entry.versions);
        req.version = versionKeys[versionKeys.length - 1];
    } else {
        const entry = packages[type][name] as PackageProject;
        if (!entry.versions[version]) {
            return res.status(404).jsonResponse({
                message: 'Not Found',
                error: `Version ${version} does not exist in the '${name}' project.`,
                status: '404',
            });
        }
    }
    next();
});

// Serve files from specific project versions
app.use('/:type/:project/*file', (req: Request, res: Response) => {
    const type = req.params.type as string;
    const file = ([] as string[]).concat(req.params.file as string).join('/');
    const filePath = join(ROOT_DIR, type, req.name, req.version, file);

    if (!fs.existsSync(filePath)) {
        return res.status(404).jsonResponse({
            message: 'Not Found',
            error: `File '${file}' does not exist in the ${req.version} version of the '${req.name}' project.`,
            status: '404',
        });
    }

    if (fs.statSync(filePath).isDirectory()) {
        const entries = fs.readdirSync(filePath, { withFileTypes: true });
        const files = entries.map((ent) => {
            const fullPath = join(filePath, ent.name);
            const stat = fs.statSync(fullPath);
            return {
                name: ent.isDirectory() ? ent.name + '/' : ent.name,
                size: ent.isDirectory() ? null : stat.size,
                directory: ent.isDirectory(),
            };
        });
        return res.jsonResponse({
            name: req.name,
            version: req.version,
            path: file.replace(/\/$/, ''),
            files,
        });
    }

    const stat = fs.statSync(filePath);
    const etag = `"${stat.size.toString(16)}-${stat.mtimeMs.toString(16)}"`;
    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    if (req.headers['if-none-match'] === etag) {
        return res.status(304).end();
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.sendFile(filePath);
});

// ----------- ----------- MAIN ENDPOINTS ----------- ----------- //

// Main route
app.get('/', (req: Request, res: Response) => {
    res.jsonResponse({
        message: 'Use the following routes to access the projects and their versions.',
        health: '/health',
        search: '/search?q=',
        download: '/download',
        packages,
    });
});

// Display projects for a specific type
app.get('/:type', (req: Request, res: Response) => {
    const type = req.params.type as string;

    res.jsonResponse({
        message: `${type[0].toUpperCase() + type.slice(1)} projects.`,
        projects: packages[type],
    });
});

// Project version details endpoint
app.get('/:type/:project', (req: Request, res: Response) => {
    const type = req.params.type as string;
    const name = req.name;
    const version = req.version;
    const projectPath = join(ROOT_DIR, type, name, version);

    // SHA256 checksums for all files
    if (req.query.checksums !== undefined) {
        const checksums = getFilesSHA256(projectPath);
        return res.jsonResponse({
            name,
            version,
            algorithm: 'sha256',
            checksums,
        });
    }

    // Download as .tar.gz archive
    if (req.query.download !== undefined) {
        return sendArchive(res, type, name, version, ROOT_DIR);
    }

    fs.readdir(projectPath, { withFileTypes: true }, (err, entries) => {
        if (err) {
            return res.status(500).jsonResponse({
                message: 'Internal Server Error',
                error: `Could not read directory: ${err.message}`,
                status: '500',
            });
        }
        const files = entries.map((ent) => {
            const fullPath = join(projectPath, ent.name);
            const stat = fs.statSync(fullPath);
            return {
                name: ent.isDirectory() ? ent.name + '/' : ent.name,
                size: ent.isDirectory() ? null : stat.size,
                directory: ent.isDirectory(),
            };
        });
        res.jsonResponse({
            name: name,
            version,
            current: name + '@' + version,
            files,
        });
    });
});

// Internal Server Error
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).jsonResponse({
        message: 'Internal Server Error',
        error: err.message,
        status: '500',
    });
});

// ----------- ----------- SERVER SETUP ----------- ----------- //

app.listen(4000, () => console.log('CDN is running on\n    - http://127.0.0.1:4000\n    - http://localhost:4000'));
