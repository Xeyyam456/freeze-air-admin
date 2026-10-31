import { Users } from "lucide-react";
import type { PartnerLineProps } from "@/types/employees";

// Qrup işi: kimlə birlikdə işləyib
export function PartnerLine({ partner: p }: PartnerLineProps) {
  return (
    <span className="mb-1.5 flex w-full items-center gap-1.5 rounded-lg bg-primary-soft/70 px-2 py-1 text-[11px] font-semibold text-primary"
      title={`${p.names} ilə birlikdə: bu ay ${p.month} iş`}>
      <Users size={12} className="shrink-0" />
      <span className="min-w-0 flex-1 truncate">{p.names} ilə birlikdə</span>
      <span className="shrink-0 tabular-nums">{p.today > 0 && <>bu gün {p.today} · </>}bu ay {p.month}</span>
    </span>
  );
}
