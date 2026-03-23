import { join } from 'path';
import { spawn } from 'child_process';

/**
 * Creates and sends a .tar.gz archive of a package version.
 *
 * @param {import('express').Response} res - Express response object
 * @param {string} type - Package type (e.g. 'npm', 'js')
 * @param {string} name - Project name
 * @param {string} version - Version string
 * @param {string} rootDir - Root directory containing packages
 */
export function sendArchive(res, type, name, version, rootDir) {
    const archiveName = `${name}-${version}.tar.gz`;
    res.setHeader('Content-Type', 'application/gzip');
    res.setHeader('Content-Disposition', `attachment; filename="${archiveName}"`);

    const tar = spawn('tar', ['-czf', '-', '-C', join(rootDir, type, name), version]);
    const chunks = [];
    tar.stdout.on('data', chunk => chunks.push(chunk));
    tar.stdout.on('end', () => res.end(Buffer.concat(chunks)));
    tar.stderr.on('data', (data) => console.error('tar error:', data.toString()));
    tar.on('error', () => {
        res.status(500).jsonResponse({
            message: 'Internal Server Error',
            error: 'Archive creation failed.',
            status: '500'
        });
    });
}
