import fs from 'fs';
import { join } from 'path';

/**
 * Dynamically scans the filesystem to discover all available packages.
 *
 * @param {string} rootDir - Root directory to scan for package types
 * @returns {Object} Structured packages object with types, projects and versions
 */
export function getPackages(rootDir) {
    const packages = {};

    try {
        const packageTypes = fs.readdirSync(rootDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
            .map(dirent => dirent.name)
            .filter(name => !['node_modules', 'src', 'scripts', 'lib'].includes(name));

        packageTypes.forEach(type => {
            const typePath = join(rootDir, type);
            packages[type] = { list: `/${type}` };

            const projects = fs.readdirSync(typePath, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);

            projects.forEach(project => {
                const projectPath = join(typePath, project);
                packages[type][project] = {
                    list: `/${type}/${project}`,
                    versions: {}
                };

                const versions = fs.readdirSync(projectPath, { withFileTypes: true })
                    .filter(dirent => dirent.isDirectory())
                    .map(dirent => dirent.name)
                    .sort((a, b) => {
                        const aParts = a.split('.').map(Number);
                        const bParts = b.split('.').map(Number);
                        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
                            const aPart = aParts[i] || 0;
                            const bPart = bParts[i] || 0;
                            if (aPart !== bPart) return aPart - bPart;
                        }
                        return 0;
                    });

                packages[type][project].versions['latest'] = `/${type}/${project}@latest`;
                versions.forEach(version => {
                    packages[type][project].versions[version] = `/${type}/${project}@${version}`;
                });
            });
        });
    } catch (error) {
        console.error('Error scanning packages:', error);
    }

    return packages;
}

/**
 * Searches packages by name using case-insensitive matching.
 *
 * @param {Object} packages - The packages object from getPackages()
 * @param {string} query - Search query string
 * @returns {Array<Object>} Matching packages with type, name, versions and url
 */
export function searchPackages(packages, query) {
    const results = [];
    const q = query.toLowerCase();
    for (const type of Object.keys(packages)) {
        for (const project of Object.keys(packages[type])) {
            if (project === 'list') continue;
            if (project.toLowerCase().includes(q)) {
                results.push({
                    type,
                    name: project,
                    versions: Object.keys(packages[type][project].versions),
                    url: `/${type}/${project}`
                });
            }
        }
    }
    return results;
}

/**
 * Counts the total number of packages across all types.
 *
 * @param {Object} packages - The packages object from getPackages()
 * @returns {number} Total package count
 */
export function countPackages(packages) {
    let count = 0;
    for (const type of Object.keys(packages)) {
        for (const key of Object.keys(packages[type])) {
            if (key !== 'list') count++;
        }
    }
    return count;
}
