export function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
export function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function genIP() {
    return `${randomNumber(0, 255)}.${randomNumber(0, 255)}.${randomNumber(0, 255)}.${randomNumber(0, 255)}`;
}
export function formatDate(date) {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().replace('Z', '');
}
export function envList(key) {
    const v = process.env[key];
    return v && v !== 'undefined' ? v.split(' ') : null;
}
export function checkRateLimit(rateLimits, userId, timestamp, window = 10000, limit = 50) {
    rateLimits[userId] = (rateLimits[userId] ?? []).filter((ts) => timestamp - ts < window);
    if (rateLimits[userId].length > limit) {
        const remainingTime = Math.ceil((rateLimits[userId][0] + window - timestamp) / 1000);
        throw new Error(`Rate limit exceeded. Try again in ${remainingTime} seconds.`);
    }
    rateLimits[userId].push(timestamp);
    return false;
}
//# sourceMappingURL=utils.js.map