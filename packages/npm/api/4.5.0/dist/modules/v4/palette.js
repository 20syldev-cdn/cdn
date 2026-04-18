import { hexToRgb, rgbToHsl, hslToRgb, rgbToHex } from '../../utils/colors.js';
function format(r, g, b) {
    const [h, s, l] = rgbToHsl(r, g, b);
    return {
        hex: rgbToHex(r, g, b),
        rgb: `rgb(${r}, ${g}, ${b})`,
        hsl: `hsl(${h.toFixed(1)}, ${(s * 100).toFixed(1)}%, ${(l * 100).toFixed(1)}%)`,
    };
}
function fromHueShifts(base, shifts) {
    const [h, s, l] = base;
    return shifts.map((shift) => {
        const newH = (h + shift + 360) % 360;
        const [r, g, b] = hslToRgb(newH, s, l);
        return format(r, g, b);
    });
}
export default function palette(color, type) {
    if (!color)
        throw new Error('A base color is required');
    if (!type)
        throw new Error('A palette type is required');
    const [r, g, b] = hexToRgb(color);
    const base = format(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    let colors;
    switch (type) {
        case 'complementary':
            colors = fromHueShifts(hsl, [0, 180]);
            break;
        case 'triadic':
            colors = fromHueShifts(hsl, [0, 120, 240]);
            break;
        case 'analogous':
            colors = fromHueShifts(hsl, [-60, -30, 0, 30, 60]);
            break;
        case 'tetradic':
            colors = fromHueShifts(hsl, [0, 90, 180, 270]);
            break;
        case 'split-complementary':
            colors = fromHueShifts(hsl, [0, 150, 210]);
            break;
        default:
            throw new Error('Type must be one of: complementary, triadic, analogous, tetradic, split-complementary');
    }
    return { base, type, colors };
}
//# sourceMappingURL=palette.js.map