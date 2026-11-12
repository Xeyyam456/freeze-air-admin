// Yazı zamanı ölçülən səviyyələr (0..100) → n sütunluq dalğa; səssizlik də görünsün deyə ən azı 6.
// Nümunə çoxdursa hər sütun öz hissəsinin ortasıdır, azdırsa sütunlar təkrarlanır
export function toPeaks(levels: number[], n = 48): number[] {
  if (!levels.length) return Array.from({ length: n }, () => 6);
  return Array.from({ length: n }, (_, i) => {
    const a = Math.floor((i * levels.length) / n);
    const b = Math.max(a + 1, Math.floor(((i + 1) * levels.length) / n));
    const part = levels.slice(a, b);
    return Math.round(Math.min(100, Math.max(6, part.reduce((s, x) => s + x, 0) / part.length)));
  });
}
