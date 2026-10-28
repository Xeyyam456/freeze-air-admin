import { fmt } from "./quantity";
import { REASONS } from "../constants/requests";
import type { DepotRequest } from "@/types/depot";

// Sənədin əsas sətri: nə, nə qədər
export function summary(r: DepotRequest) {
  const u = r.tool_kind === "material" ? r.unit : "ədəd";
  switch (r.type) {
    case "receipt": return `+${fmt(r.quantity ?? 0)} ${u} depoya`;
    case "writeoff": return `−${fmt(r.quantity ?? 0)} ${u} · ${REASONS[r.reason ?? "other"]}`;
    case "count": {
      const d = (r.quantity ?? 0) - (r.expected ?? 0);
      return `sistemdə ${fmt(r.expected ?? 0)}, sayılan ${fmt(r.quantity ?? 0)} ${u} (${d > 0 ? "+" : "−"}${fmt(Math.abs(d))})`;
    }
    case "return": return r.tool_kind === "material"
      ? `işlədib ${fmt(r.used ?? 0)} ${u}, qaytarır ${fmt(r.returned ?? 0)} ${u}`
      : `qaytarır ${fmt(r.quantity ?? 0)} ${u}`;
    case "request": return `istəyir ${fmt(r.quantity ?? 0)} ${u}`;
  }
  return "";
}
