// Y oxu üçün 0-dan başlayan 4–5 "yuvarlaq" bölgü (1, 2, 5 × 10ⁿ addımı): max=13 → 0, 5, 10, 15
export function niceTicks(max: number) {
  const raw = max / 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  // Saylar tam ədəddir: addım ən azı 1 (0.5 kimi bölgü olmasın)
  const step = Math.max(1, [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? pow * 10);
  const ticks: number[] = [];
  for (let t = 0; t <= max + step * 0.001 || ticks.length < 2; t += step) ticks.push(Math.round(t * 100) / 100);
  if (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + step);
  return ticks;
}
