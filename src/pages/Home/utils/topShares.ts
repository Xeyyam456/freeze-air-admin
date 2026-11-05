import { jobKey } from "@/lib/jobs";
import type { PanelPlaced } from "@/types/dashboard";
import { placeName } from "./placeName";

// Ayın işləri şirkətlər üzrə: ən çox 3 şirkət + "Digər" (qrup işi bir dəfə)
export function topShares(rows: (PanelPlaced & { id: number })[], groups: Map<number, string>) {
  const seen = new Set<string>();
  const by = new Map<string, number>();
  for (const r of rows) {
    const k = jobKey(r.id, groups);
    if (seen.has(k)) continue;
    seen.add(k);
    by.set(placeName(r), (by.get(placeName(r)) ?? 0) + 1);
  }
  const sorted = [...by.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 3).map(([label, value]) => ({ label, value }));
  const rest = sorted.slice(3).reduce((s, [, v]) => s + v, 0);
  return rest ? [...top, { label: "Digər", value: rest }] : top;
}
