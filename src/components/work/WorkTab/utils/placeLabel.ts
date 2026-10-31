import type { EmployeeLog } from "@/types/workLogs";

// Yer: siyahıda olmayan yer | mağaza/filial (şirkət adı və kodu ilə) | şirkət
export function placeLabel(log: EmployeeLog) {
  if (log.place_text) return log.place_text;
  if (log.stores) return `${log.stores.companies?.name ?? ""} · ${log.stores.code} ${log.stores.name}`;
  return log.companies?.name ?? "Yer silinib";
}
