/**
 * Converts values between different temperature units
 *
 * @param {number|string} value - The value to convert
 * @param {string} from - The source unit (celsius, fahrenheit, or kelvin)
 * @param {string} to - The target unit (celsius, fahrenheit, or kelvin)
 * @returns {Object} - Object containing the conversion details
 * @throws {Error} - If conversion parameters are invalid
 */
export default function convert(value: number | string, from: string, to: string): Object;
