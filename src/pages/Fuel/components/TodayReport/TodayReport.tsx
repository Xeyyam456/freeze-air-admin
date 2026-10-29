import type { TodayReportProps } from "@/types/fuel";
import { dayName } from "../../shared/dates";
import { azn } from "../../shared/money";
import { todayState } from "../../utils/todayState";

// Bu günün hesabatı: dövr filtrindən asılı deyil
export function TodayReport({ today, row }: TodayReportProps) {
  const st = todayState(row);
  return (
    <div className="rounded-2xl bg-white/[0.07] px-5 py-4 ring-1 ring-white/10 max-xl:px-4 max-xl:py-3">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/60">
        <span className={`h-2 w-2 rounded-full ${st.tone === "done" ? "bg-[#4ade80]" : st.tone === "open" ? "bg-amber-400" : "bg-white/30"}`} />
        Bu gün · {dayName(today)}
      </p>
      <div className="mt-2 flex flex-wrap items-end gap-x-8 gap-y-2 max-sm:grid max-sm:grid-cols-[1fr_auto] max-sm:items-baseline max-sm:gap-x-3">
        <p className="text-3xl font-extrabold tabular-nums leading-none max-xl:text-2xl">{row?.km ?? 0} <span className="text-base font-bold text-white/60">km</span></p>
        <p className="tabular-nums text-white/80 max-sm:text-right">{row?.liters != null ? `${Number(row.liters).toFixed(2)} L` : "— L"}</p>
        <p className="text-2xl font-extrabold tabular-nums text-[#4ade80] max-xl:text-xl">{row?.cost != null ? azn(Number(row.cost)) : "—"}</p>
        <p className="min-w-0 truncate text-right text-[11px] text-white/60 sm:hidden">{st.text}</p>
      </div>
      <p className="mt-2 text-xs text-white/60 max-sm:hidden">{st.text}</p>
    </div>
  );
}
