import type { LeaveRow } from "@/types/leaves";

// Aylara görə qrup ("YYYY-MM" → sorğular), yeni ay yuxarıda
export function groupByMonth(list: LeaveRow[]) {
  const byMonth = new Map<string, LeaveRow[]>();
  for (const l of [...list].sort((a, b) => b.date_from.localeCompare(a.date_from))) {
    const k = l.date_from.slice(0, 7);
    byMonth.set(k, [...(byMonth.get(k) ?? []), l]);
  }
  return [...byMonth];
}
