import { getHashes, createHash } from 'crypto';
const ENCODINGS = new Set(['hex', 'base64']);
export default function hash(text, method, encoding = 'hex') {
    if (!text)
        throw new Error('Text is required');
    const methods = getHashes();
    if (!methods.includes(method))
        throw new Error(`Unsupported method. Use one of: ${methods.join(', ')}`);
    if (!ENCODINGS.has(encoding))
        throw new Error('Encoding must be one of: hex, base64');
    const result = createHash(method)
        .update(text)
        .digest(encoding);
    return { method, hash: result, encoding };
}
//# sourceMappingURL=hash.js.map