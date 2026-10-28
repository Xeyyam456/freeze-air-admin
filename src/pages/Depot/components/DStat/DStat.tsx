import type { DStatProps } from "@/types/depot";
import { SOFT } from "../../constants/tones";

// Göstərici kafeli (pəncərələrdə və ümumi baxışda)
export function DStat({ icon: Icon, tone, label, value, hint }: DStatProps) {
  return (
    <div className="min-w-0 rounded-2xl border border-line bg-surface p-3.5">
      <span className={`inline-grid h-8 w-8 place-items-center rounded-xl ${SOFT[tone]}`}><Icon size={16} /></span>
      <p className="mt-2 text-xs font-semibold text-muted">{label}</p>
      <p className="truncate text-xl font-extrabold tabular-nums leading-tight">{value}</p>
      {hint && <p className="muted truncate text-[11px]">{hint}</p>}
    </div>
  );
}
