export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

export function rgbToHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")
  );
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function generateScale(startHex: string, endHex: string, steps: number) {
  const [sr, sg, sb] = hexToRgb(startHex);
  const [er, eg, eb] = hexToRgb(endHex);
  const arr: string[] = [];
  for (let i = 0; i < steps; i++) {
    const t = steps === 1 ? 0 : i / (steps - 1);
    const r = lerp(sr, er, t);
    const g = lerp(sg, eg, t);
    const b = lerp(sb, eb, t);
    arr.push(rgbToHex(r, g, b));
  }
  return arr;
}
