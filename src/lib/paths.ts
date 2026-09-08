import { join, resolve, sep } from 'path';

/**
 * Joins untrusted segments onto a base directory and ensures the result stays
 * inside it. Blocks directory traversal through '..' segments and null bytes.
 *
 * @param base - Trusted base directory
 * @param segments - Untrusted path segments
 * @returns The resolved absolute path, or null if it escapes the base
 */
export function safeJoin(base: string, ...segments: string[]): string | null {
    if (segments.some((segment) => segment.includes('\0'))) return null;

    const root = resolve(base);
    const target = resolve(join(root, ...segments));

    if (target !== root && !target.startsWith(root + sep)) return null;

    return target;
}
