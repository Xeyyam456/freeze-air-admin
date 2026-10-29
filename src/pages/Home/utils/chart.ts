export const MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];
export const WEEKDAYS = ["Bazar", "Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə", "Cümə axşamı", "Cümə", "Şənbə"];

// Y oxu: yuvarlaq, az xətt
export function niceTop(max: number) {
  const step = [1, 2, 5, 10, 20, 50, 100].find((s) => max / s <= 4) ?? 200;
  return Math.max(step, Math.ceil(max / step) * step);
}

const clamp = (v: number) => Math.min(100, Math.max(0, v));

// Hamar əyri (Catmull-Rom → Bézier); koordinatlar faizlə (0..100), əyri sahədən kənara çıxmır
export function smoothPath(pts: [number, number][]) {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0][0]} ${pts[0][1]}`;
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1y = clamp(p1[1] + (p2[1] - p0[1]) / 6);
    const c2y = clamp(p2[1] - (p3[1] - p1[1]) / 6);
    d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${c1y}, ${p2[0] - (p3[0] - p1[0]) / 6} ${c2y}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}
