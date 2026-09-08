/**
 * Generate a captcha image from the provided text
 *
 * @param {string} text - Text to render in the captcha image
 * @returns {Buffer} - PNG image buffer of the rendered captcha
 * @throws {Error} - If text is not provided
 */
export default function captcha(text: string): Buffer;
