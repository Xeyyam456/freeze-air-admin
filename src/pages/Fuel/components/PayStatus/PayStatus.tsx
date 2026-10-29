import { AlertTriangle, Check } from "lucide-react";
import type { PayStatusProps } from "@/types/fuel";
import { timeBaku } from "../../shared/dates";

// Ustanın cavabı (0080): gözləyir / aldı / almadığını deyir
export function PayStatus({ p }: PayStatusProps) {
  if (p.status === "received") return <span className="inline-flex items-center gap-1 rounded-full bg-ok-soft px-2 py-0.5 text-[11px] font-bold text-ok" title={p.status_at ? `Təsdiqləyib: ${timeBaku(p.status_at)}` : undefined}><Check size={11} strokeWidth={3} /> Aldı</span>;
  if (p.status === "disputed") return <span className="inline-flex items-center gap-1 rounded-full bg-danger-soft px-2 py-0.5 text-[11px] font-bold text-danger"><AlertTriangle size={11} /> Almadığını deyir</span>;
  return <span className="rounded-full bg-bg px-2 py-0.5 text-[11px] font-bold text-muted">Gözləyir</span>;
}
