import type { AllLog } from "@/types/dashboard";

export function allPlaceOf(l: AllLog) {
  if (l.stores) return `${l.stores.companies?.name ?? ""} · ${l.stores.name}`;
  if (l.companies) return l.companies.name;
  return l.place_text ?? "—";
}
