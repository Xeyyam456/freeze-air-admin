import type { RangeKind, WorkLog } from "@/types/workLogs";

export const WEEKDAYS = ["Bazar", "Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə", "Cümə axşamı", "Cümə", "Şənbə"];

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Hazır aralıqlar
export function range(kind: RangeKind) {
  const now = new Date();
  if (kind === "week") {
    const from = new Date(now);
    from.setDate(from.getDate() - 6);
    return { from: iso(from), to: iso(now) };
  }
  if (kind === "prev") {
    return { from: iso(new Date(now.getFullYear(), now.getMonth() - 1, 1)), to: iso(new Date(now.getFullYear(), now.getMonth(), 0)) };
  }
  return { from: iso(new Date(now.getFullYear(), now.getMonth(), 1)), to: iso(now) };
}

export function placeOf(l: WorkLog) {
  if (l.stores) return `${l.stores.companies?.name ?? ""} · ${l.stores.name}`;
  if (l.companies) return l.companies.name;
  return l.place_text ?? "—";
}
export const companyOf = (l: WorkLog) => l.stores?.company_id ?? l.company_id ?? null;
