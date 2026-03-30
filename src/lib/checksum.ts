import crypto from 'crypto';
import fs from 'fs';
import { join } from 'path';
import type { ChecksumMap } from '../types/index.js';

/**
 * Computes SHA256 checksums for all files in a directory recursively.
 *
 * @param dirPath - Directory path to scan
 * @param basePath - Base path for relative file paths (defaults to dirPath)
 * @returns Map of relative file paths to their SHA256 hex digests
 */
export function getFilesSHA256(dirPath: string, basePath: string = dirPath): ChecksumMap {
    const results: ChecksumMap = {};
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);
        const relativePath = fullPath.replace(basePath + '/', '');
        if (entry.isDirectory()) {
            Object.assign(results, getFilesSHA256(fullPath, basePath));
        } else {
            const content = fs.readFileSync(fullPath);
            results[relativePath] = crypto.createHash('sha256').update(content).digest('hex');
        }
    }
    return results;
}
