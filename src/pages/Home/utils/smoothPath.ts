// Nöqtələrdən hamar SVG xətti (monoton kub, Fritsch–Carlson): əyri məlumatda olmayan zirvə və ya sıfırın altına enmə yaratmır
export function smoothPath(pts: [number, number][]) {
  const n = pts.length;
  if (n < 3) return pts.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
  const d = pts.slice(1).map(([x, y], i) => (y - pts[i][1]) / (x - pts[i][0]));
  const m = pts.map((_, i) => (i === 0 ? d[0] : i === n - 1 ? d[n - 2] : d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2));
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const h = a * a + b * b;
    if (h > 9) { const t = 3 / Math.sqrt(h); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
  }
  let path = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const dx = (x1 - x0) / 3;
    path += ` C${x0 + dx},${y0 + m[i] * dx} ${x1 - dx},${y1 - m[i + 1] * dx} ${x1},${y1}`;
  }
  return path;
}
