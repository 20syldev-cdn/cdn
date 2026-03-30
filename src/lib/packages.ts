import fs from 'fs';
import { join } from 'path';
import type { Packages, PackageProject, SearchResult } from '../types/index.js';

const EXCLUDED_DIRS = ['node_modules', 'src', 'scripts', 'lib', 'dist', 'public', '.github'];

/**
 * Dynamically scans the filesystem to discover all available packages.
 *
 * @param rootDir - Root directory to scan for package types
 * @returns Structured packages object with types, projects and versions
 */
export function getPackages(rootDir: string): Packages {
    const packages: Packages = {};

    try {
        const packageTypes = fs
            .readdirSync(rootDir, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory() && !dirent.name.startsWith('.'))
            .map((dirent) => dirent.name)
            .filter((name) => !EXCLUDED_DIRS.includes(name));

        packageTypes.forEach((type) => {
            const typePath = join(rootDir, type);
            packages[type] = { list: `/${type}` };

            const projects = fs
                .readdirSync(typePath, { withFileTypes: true })
                .filter((dirent) => dirent.isDirectory())
                .map((dirent) => dirent.name);

            projects.forEach((project) => {
                const projectPath = join(typePath, project);
                const projectEntry: PackageProject = {
                    list: `/${type}/${project}`,
                    versions: {},
                };

                const versions = fs
                    .readdirSync(projectPath, { withFileTypes: true })
                    .filter((dirent) => dirent.isDirectory())
                    .map((dirent) => dirent.name)
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

                projectEntry.versions['latest'] = `/${type}/${project}@latest`;
                versions.forEach((version) => {
                    projectEntry.versions[version] = `/${type}/${project}@${version}`;
                });

                packages[type][project] = projectEntry;
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
 * @param packages - The packages object from getPackages()
 * @param query - Search query string
 * @returns Matching packages with type, name, versions and url
 */
export function searchPackages(packages: Packages, query: string): SearchResult[] {
    const results: SearchResult[] = [];
    const q = query.toLowerCase();
    for (const type of Object.keys(packages)) {
        for (const project of Object.keys(packages[type])) {
            if (project === 'list') continue;
            if (project.toLowerCase().includes(q)) {
                const entry = packages[type][project] as PackageProject;
                results.push({
                    type,
                    name: project,
                    versions: Object.keys(entry.versions),
                    url: `/${type}/${project}`,
                });
            }
        }
    }
    return results;
}

/**
 * Counts the total number of packages across all types.
 *
 * @param packages - The packages object from getPackages()
 * @returns Total package count
 */
export function countPackages(packages: Packages): number {
    let count = 0;
    for (const type of Object.keys(packages)) {
        for (const key of Object.keys(packages[type])) {
            if (key !== 'list') count++;
        }
    }
    return count;
}
