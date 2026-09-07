/**
 * Generate time information based on specified parameters.
 *
 * @param {string} type - The type of time information ('live' or 'random')
 * @param {string} start - Start date for random generation (ISO format)
 * @param {string} end - End date for random generation (ISO format)
 * @param {string} format - Specific time format to return
 * @param {string} timezone - Timezone to use
 * @returns {object} - Time information in various formats
 * @throws {Error} - If inputs are invalid
 */
export default function time(type: string | undefined, start: string, end: string, format: string, timezone: string): object;
