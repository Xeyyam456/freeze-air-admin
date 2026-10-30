import type { DActionProps } from "@/types/depot";
import { SOFT } from "../../constants/tones";

// Əməliyyat kafeli: ikon üstdə, yazı altda (Mədaxil, Silinmə, Təmirə, Hərəkətlər)
export function DAction({ icon: Icon, tone, label, onClick }: DActionProps) {
  return (
    <button type="button" onClick={onClick}
      className="group flex flex-col items-center gap-1.5 max-sm:gap-1 rounded-2xl border border-line bg-surface px-2 py-3 max-sm:py-2 text-[12px] max-sm:text-[11px] font-semibold text-ink/80 transition hover:-translate-y-0.5 hover:border-transparent hover:shadow-[0_10px_24px_-10px_rgba(16,24,40,0.25)]">
      <span className={`grid h-9 w-9 max-sm:h-7 max-sm:w-7 place-items-center rounded-xl transition-transform group-hover:scale-105 ${SOFT[tone]}`}><Icon size={17} /></span>
      {label}
    </button>
  );
}
