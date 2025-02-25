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
        api: {
            versions: {
                '1.0.0': '/npm/api@1.0.0',
                '2.0.0': '/npm/api@2.0.0',
                '3.0.0': '/npm/api@3.0.0'
            }
        },
        minify: {
            versions: {
                '1.0.0': '/npm/minify@1.0.0'
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
    const [projectName, version] = project.split('@');

    req.projectName = projectName;
    req.version = version;

    if (!packages[type] || !packages[type][projectName] || !packages[type][projectName].versions[version]) {
        return res.status(404).jsonResponse({
            message: 'Not Found',
            error: `Version '${version}' does not exist for project '${projectName}' under '/${type}'.`,
            status: '404'
        });
    }
    next();
});

// Serve files from specific project versions
app.use('/:type/:project/*', (req, res) => {
    const { type } = req.params;
    const filePath = join(__dirname, type, req.projectName, req.version, req.params[0]);

    if (!fs.existsSync(filePath)) {
        return res.status(404).jsonResponse({
            message: 'Not Found',
            error: `File '${req.params[0]}' does not exist for version '${req.version}' of project '${req.projectName}' under '/${type}'.`,
            status: '404'
        });
    }
    res.sendFile(filePath);
});

// ----------- ----------- MAIN ENDPOINTS ----------- ----------- //

// Main route
app.get('/', (req, res) => {
    res.redirect('https://sylvain.pro');
});

// Display projects for a specific type
app.get('/:type', (req, res) => {
    const { type } = req.params;

    res.jsonResponse({
        message: `Projects under type '${type}'.`,
        projects: packages[type]
    });
});

// Project version details endpoint
app.get('/:type/:project', (req, res) => {
    const { type } = req.params;
    const projectName = req.projectName;
    const version = req.version;
    const projectPath = join(__dirname, type, projectName, version);

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
            name: projectName,
            version,
            current: projectName + '@' + version,
            files
        });
    });
});

// ----------- ----------- SERVER SETUP ----------- ----------- //

app.listen(4000, () => console.log('CDN is running on\n    - http://127.0.0.1:4000\n    - http://localhost:4000'));
