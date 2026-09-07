/**
 * Generate a QR code for the provided URL.
 *
 * @param {string} url - The URL to encode in the QR code
 * @returns {Promise<string>} - Base64 encoded QR code image
 * @throws {Error} - If URL is invalid or QR code generation fails
 */
export default function qrcode(url: string): Promise<string>;
