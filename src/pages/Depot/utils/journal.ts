import { ArrowDownToLine, ArrowUpFromLine, ClipboardCheck, Flame, PackagePlus, Trash2, Wrench, type LucideIcon } from "lucide-react";
import { formatDateAz } from "@/components/DatePicker";
import type { Movement } from "@/types/depot";

// Yerli tarix "YYYY-MM-DD"; offset gün qədər geri
export function localDate(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
export const dayOf = (iso: string) => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};
export const timeOf = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
export const dayLabel = (day: string) => (day === localDate() ? "Bu gün" : day === localDate(-1) ? "Dünən" : formatDateAz(day));

// Hərəkət növləri: jurnalda ikon, rəng və fel
export const KINDS: Record<string, { label: string; verb: string; icon: LucideIcon; tone: string }> = {
  receipt: { label: "Mədaxil", verb: "depoya gəldi", icon: PackagePlus, tone: "text-ok bg-ok-soft" },
  give: { label: "Verildi", verb: "götürdü", icon: ArrowUpFromLine, tone: "text-primary bg-primary-soft" },
  return: { label: "Qaytarıldı", verb: "qaytardı", icon: ArrowDownToLine, tone: "text-ok bg-ok-soft" },
  used: { label: "Sərf", verb: "işlətdi", icon: Flame, tone: "text-[#b45309] bg-[#fff4e0]" },
  writeoff: { label: "Silindi", verb: "silindi", icon: Trash2, tone: "text-danger bg-danger-soft" },
  count: { label: "Sayım", verb: "sayımla düzəldi", icon: ClipboardCheck, tone: "text-[#6d28d9] bg-[#f1ebff]" },
  repair_out: { label: "Təmirə", verb: "təmirə getdi", icon: Wrench, tone: "text-[#b45309] bg-[#fff4e0]" },
  repair_in: { label: "Təmirdən", verb: "təmirdən qayıtdı", icon: Wrench, tone: "text-ok bg-ok-soft" },
};
export const FILTERS = [
  ["all", "Hamısı"], ["receipt", "Mədaxil"], ["give", "Verilən"], ["return", "Qaytarılan"], ["used", "Sərf"], ["writeoff", "Silinən"], ["repair", "Təmir"],
] as const;

export function amount(m: Movement) {
  const n = String(Math.round(Math.abs(m.quantity) * 100) / 100).replace(".", ",");
  const sign = m.kind === "count" ? (m.quantity > 0 ? "+" : "−") : "";
  return m.tool_kind === "material" || m.kind === "count" ? `${sign}${n} ${m.unit}` : Math.abs(m.quantity) > 1 ? `×${n}` : "";
}
