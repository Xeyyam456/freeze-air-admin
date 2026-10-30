import type { DStatProps } from "@/types/depot";
import { SOFT } from "../../constants/tones";

// Göstərici kafeli (pəncərələrdə və ümumi baxışda)
export function DStat({ icon: Icon, tone, label, value, hint }: DStatProps) {
  return (
    <div className="min-w-0 rounded-2xl border border-line bg-surface p-3.5 max-sm:p-2.5">
      <span className={`inline-grid h-8 w-8 place-items-center rounded-xl ${SOFT[tone]}`}><Icon size={16} /></span>
      <p className="mt-2 text-xs font-semibold text-muted max-sm:text-[11px]">{label}</p>
      <p className="truncate text-xl font-extrabold tabular-nums leading-tight max-sm:whitespace-normal max-sm:text-[15px] max-sm:tracking-tight">{value}</p>
      {hint && <p className="muted truncate text-[11px]">{hint}</p>}
    </div>
  );
}
