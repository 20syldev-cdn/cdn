import { MAX_JWT_LENGTH } from '../../constants.js';
/**
 * Decodes a JSON Web Token (header + payload) without verifying the signature.
 * WARNING: The signature is NOT verified. Use this for inspection only, not for security decisions.
 */
export default function jwt(token) {
    if (!token)
        throw new Error('Please provide a token (?token={token})');
    if (token.length > MAX_JWT_LENGTH)
        throw new Error(`Token cannot exceed ${MAX_JWT_LENGTH} characters`);
    const parts = token.split('.');
    if (parts.length !== 3)
        throw new Error('Invalid JWT format. Expected 3 parts separated by "."');
    const [headerB64, payloadB64, signature] = parts;
    let header;
    let payload;
    try {
        header = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf-8'));
    }
    catch {
        throw new Error('Invalid JWT header: not valid base64url JSON');
    }
    try {
        payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    }
    catch {
        throw new Error('Invalid JWT payload: not valid base64url JSON');
    }
    const result = { header, payload, signature };
    if (typeof payload.exp === 'number') {
        result.expired = Date.now() / 1000 > payload.exp;
    }
    return result;
}
//# sourceMappingURL=jwt.js.map