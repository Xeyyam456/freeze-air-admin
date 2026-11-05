// Zolaqda üst-üstə düşən hadisələri sətirlərə bölür: hər hadisə [başlanğıc, son] saat aralığıdır
// (an üçün kiçik en verilir ki, nöqtələr bir-birini örtməsin). Ən çox `max` sətir; artığı son sətrə düşür.
export function stackRows(items: { id: string; from: number; to: number }[], max = 4) {
  const ends: number[] = [];
  const rows = new Map<string, number>();
  for (const it of [...items].sort((a, b) => a.from - b.from)) {
    let row = ends.findIndex((end) => end <= it.from);
    if (row < 0) row = ends.length < max ? ends.length : max - 1;
    ends[row] = Math.max(ends[row] ?? 0, it.to);
    rows.set(it.id, row);
  }
  return { rows, count: Math.max(1, ends.length) };
}
