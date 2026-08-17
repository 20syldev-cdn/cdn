import { MAX_URL_LENGTH } from '../../constants.js';
/**
 * Parses a URL into its structural components.
 *
 * @param url - Absolute URL to parse, including its scheme (e.g. https://example.com/path?a=1)
 * @returns Object with the original URL, scheme, host, port, path, query params (duplicates grouped into arrays) and fragment
 * @throws Error if the URL is empty, exceeds the maximum length, or cannot be parsed
 */
export default function parseUrl(url) {
    if (!url)
        throw new Error('Please provide a URL (?url={URL})');
    if (url.length > MAX_URL_LENGTH)
        throw new Error(`URL cannot exceed ${MAX_URL_LENGTH} characters`);
    let parsed;
    try {
        parsed = new URL(url);
    }
    catch {
        throw new Error('Invalid URL');
    }
    const params = {};
    for (const [key, value] of parsed.searchParams) {
        const current = params[key];
        if (current === undefined)
            params[key] = value;
        else if (Array.isArray(current))
            current.push(value);
        else
            params[key] = [current, value];
    }
    return {
        url,
        scheme: parsed.protocol.replace(':', ''),
        host: parsed.hostname,
        port: parsed.port ? parseInt(parsed.port, 10) : null,
        path: parsed.pathname,
        params,
        fragment: parsed.hash.replace('#', ''),
        valid: true,
    };
}
//# sourceMappingURL=url.js.map