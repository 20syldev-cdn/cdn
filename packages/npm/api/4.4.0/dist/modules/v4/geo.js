const EARTH_RADIUS_KM = 6371;
const CARDINALS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
function toRad(deg) {
    return (deg * Math.PI) / 180;
}
function toDeg(rad) {
    return (rad * 180) / Math.PI;
}
function parseCoord(value, name, min, max) {
    const n = Number(value);
    if (isNaN(n))
        throw new Error(`${name} must be a number`);
    if (n < min || n > max)
        throw new Error(`${name} must be between ${min} and ${max}`);
    return n;
}
export default function geo(lat1, lon1, lat2, lon2) {
    const a = parseCoord(lat1, 'lat1', -90, 90);
    const b = parseCoord(lon1, 'lon1', -180, 180);
    const c = parseCoord(lat2, 'lat2', -90, 90);
    const d = parseCoord(lon2, 'lon2', -180, 180);
    const dLat = toRad(c - a);
    const dLon = toRad(d - b);
    const sa = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a)) * Math.cos(toRad(c)) * Math.sin(dLon / 2) ** 2;
    const distance = 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(sa));
    const y = Math.sin(toRad(d - b)) * Math.cos(toRad(c));
    const x = Math.cos(toRad(a)) * Math.sin(toRad(c)) - Math.sin(toRad(a)) * Math.cos(toRad(c)) * Math.cos(toRad(d - b));
    const bearing = (toDeg(Math.atan2(y, x)) + 360) % 360;
    const cardinal = CARDINALS[Math.round(bearing / 22.5) % 16];
    return {
        distance: {
            km: +distance.toFixed(3),
            miles: +(distance * 0.621371).toFixed(3),
            nauticalMiles: +(distance * 0.539957).toFixed(3),
        },
        bearing: { degrees: +bearing.toFixed(2), cardinal },
        from: { lat: a, lon: b },
        to: { lat: c, lon: d },
    };
}
//# sourceMappingURL=geo.js.map