import cors from 'cors';
import express from 'express';
import fs from 'fs';
import { dirname, join } from 'path';
import { urlencoded, json } from 'express';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

// API structure, packages types and projects
const packages = {
    npm: {
        list: '/npm',
        api: {
            list: '/npm/api',
            versions: {
                '1.0.0': '/npm/api@1.0.0',
                '2.0.0': '/npm/api@2.0.0',
                '3.0.0': '/npm/api@3.0.0'
            }
        },
        minify: {
            list: '/npm/minify',
            versions: {
                '1.0.0': '/npm/minify@1.0.0'
            }
        },
        wrkit: {
            list: '/npm/wrkit',
            versions: {
                '1.0.0': '/npm/wrkit@1.0.0',
                '2.0.0': '/npm/wrkit@2.0.0',
                '2.1.0': '/npm/wrkit@2.1.0'
            }
        }
    }
};

// Define global variables
let requests = 0, resetTime = Date.now() + 10000;

// ----------- ----------- MIDDLEWARES SETUP ----------- ----------- //

// CORS & Express setup
app.use(cors({ methods: ['GET'] }));
app.use(urlencoded({ extended: true }));
app.use(json());

// Set favicon for API
app.use('/favicon.ico', express.static(join(__dirname, 'src', 'favicon.ico')));

// Display robots.txt
app.use('/robots.txt', express.static(join(__dirname, 'robots.txt')));

// Return formatted JSON
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.jsonResponse = (data) => {
        res.send(JSON.stringify(data, null, 2));
    };
    next();
});

// Too many requests
app.use((req, res, next) => {
    if (Date.now() > resetTime) requests = 0, resetTime = Date.now() + 10000;
    if (++requests > 1000) return res.status(429).jsonResponse({ message: 'Too Many Requests' });
    next();
});

// Internal Server Error
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).jsonResponse({
        message: 'Internal Server Error',
        error: err.message,
        status: '500'
    });
});

// Check if package type exists
app.use('/:type', (req, res, next) => {
    const { type } = req.params;

    if (!Object.keys(packages).includes(type)) {
        return res.status(404).jsonResponse({
            message: 'Not Found',
            error: `Package type '${type}' does not exist.`,
            status: '404'
        });
    }
    next();
});

// Check if project exists
app.use('/:type/:project', (req, res, next) => {
    const { type, project } = req.params;
    const [name, version] = project.split('@');

    req.name = name;
    req.version = version;

    if (!packages[type] || !packages[type][name]) {
        return res.status(404).jsonResponse({
            message: 'Not Found',
            error: `Project '${name}' does not exist in /${type}.`,
            status: '404'
        });
    }

    if (!version) {
        const versions = Object.keys(packages[type][name].versions).reduce((acc, ver) => {
            acc[ver] = `/${type}/${name}@${ver}`;
            return acc;
        }, {});

        return res.jsonResponse({
            message: `Available versions for the '${name}' project.`,
            versions
        });
    }

    if (!packages[type][name].versions[version]) {
        return res.status(404).jsonResponse({
            message: 'Not Found',
            error: `Version ${version} does not exist in the '${name}' project.`,
            status: '404'
        });
    }
    next();
});

// Serve files from specific project versions
app.use('/:type/:project/*', (req, res) => {
    const { type } = req.params;
    const filePath = join(__dirname, type, req.name, req.version, req.params[0]);

    if (!fs.existsSync(filePath)) {
        return res.status(404).jsonResponse({
            message: 'Not Found',
            error: `File '${req.params[0]}' does not exist in the ${req.version} version of the '${req.name}' project.`,
            status: '404'
        });
    }
    res.sendFile(filePath);
});

// ----------- ----------- MAIN ENDPOINTS ----------- ----------- //

// Main route
app.get('/', (req, res) => {
    res.jsonResponse({
        message: 'Use the following routes to access the projects and their versions.',
        packages
    });
});

// Display projects for a specific type
app.get('/:type', (req, res) => {
    const { type } = req.params;

    res.jsonResponse({
        message: `${type.split('')[0].toUpperCase() + type.slice(1)} projects.`,
        projects: packages[type]
    });
});

// Project version details endpoint
app.get('/:type/:project', (req, res) => {
    const { type } = req.params;
    const name = req.name;
    const version = req.version;
    const projectPath = join(__dirname, type, name, version);

    fs.readdir(projectPath, { withFileTypes: true }, (err, entries) => {
        if (err) {
            return res.status(500).jsonResponse({
                message: 'Internal Server Error',
                error: `Could not read directory: ${err.message}`,
                status: '500'
            });
        }
        const files = entries.map(ent => {
            const fullPath = join(projectPath, ent.name);
            const stat = fs.statSync(fullPath);
            return {
                name: ent.isDirectory() ? ent.name + '/' : ent.name,
                size: ent.isDirectory() ? null : stat.size,
                directory: ent.isDirectory()
            };
        });
        res.jsonResponse({
            name: name,
            version,
            current: name + '@' + version,
            files
        });
    });
});

// ----------- ----------- SERVER SETUP ----------- ----------- //

app.listen(4000, () => console.log('CDN is running on\n    - http://127.0.0.1:4000\n    - http://localhost:4000'));
