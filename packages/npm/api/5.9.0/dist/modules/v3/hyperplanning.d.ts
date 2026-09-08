/**
 * Parse an ICS calendar file and extract event information
 *
 * @param {string} url - URL to the ICS file
 * @param {string} [detail] - Detail level of returned information ('full', 'list', or undefined)
 * @returns {Promise<Array>} Array of calendar events
 * @throws {Error} If the ICS file is invalid or inaccessible
 */
export default function hyperplanning(url: string, detail?: string): Promise<any[]>;
