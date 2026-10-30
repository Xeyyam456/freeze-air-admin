import type { DStatProps } from "@/types/depot";
import { SOFT } from "../../constants/tones";

// Göstərici kafeli (pəncərələrdə və ümumi baxışda)
export function DStat({ icon: Icon, tone, label, value, hint }: DStatProps) {
  // "33,9 kq (3 balon)": əsas miqdar iri, mötərizədəki hissə altda kiçik (sarılıb 3 sətrə düşməsin)
  const cut = typeof value === "string" ? value.indexOf(" (") : -1;
  return (
    <div className="min-w-0 rounded-2xl border border-line bg-surface p-3.5 max-sm:p-2.5">
      <span className={`inline-grid h-8 w-8 place-items-center rounded-xl max-sm:hidden ${SOFT[tone]}`}><Icon size={16} /></span>
      <p className="mt-2 max-sm:mt-0 text-xs font-semibold text-muted max-sm:text-[11px]">{label}</p>
      <p className="truncate text-xl font-extrabold tabular-nums leading-tight max-sm:whitespace-normal max-sm:text-[15px] max-sm:tracking-tight">{cut > 0 ? (value as string).slice(0, cut) : value}</p>
      {cut > 0 && <p className="muted truncate text-[11px] font-semibold max-sm:text-[10px]">{(value as string).slice(cut + 1)}</p>}
      {hint && <p className="muted truncate text-[11px] max-sm:hidden">{hint}</p>}
    </div>
  );
}
