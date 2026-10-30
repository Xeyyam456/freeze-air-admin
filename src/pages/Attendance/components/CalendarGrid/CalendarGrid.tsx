import { Check } from "lucide-react";
import { presenceText } from "@/shared/utils/attendance/presenceText";
import type { CalendarGridProps } from "@/types/attendance";
import { CELL, LEGEND, WEEK } from "../../constants/calendar";

// Ayın təqvimi (bazar ertəsindən) + rəng izahı
export function CalendarGrid({ days, lead }: CalendarGridProps) {
  return (
    <>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEK.map((w) => <span key={w} className="muted pb-1 text-[11px] font-semibold">{w}</span>)}
        {Array.from({ length: lead }, (_, i) => <span key={`e${i}`} />)}
        {days
          ? days.map(({ day, status, presence }) => (
            <span key={day} title={presence ? `İşdə: ${presenceText(presence)}` : undefined}
              className={`flex h-9 flex-col items-center justify-center rounded-lg text-sm font-bold ${CELL[status]}`}>
              {status === "present" ? <Check size={14} strokeWidth={3} /> : Number(day.slice(8))}
              {status === "present" && <span className="text-[10px] font-semibold leading-none opacity-90">{Number(day.slice(8))}</span>}
            </span>
          ))
          : Array.from({ length: 30 }, (_, i) => <span key={i} className="h-9 rounded-lg bg-bg" />)}
      </div>
      <div className="mt-2.5 flex flex-nowrap items-center gap-x-4 gap-y-1 whitespace-nowrap max-sm:justify-between max-sm:gap-x-2 sm:flex-wrap">
        {LEGEND.map((l) => (
          <span key={l.s} className="muted flex items-center gap-1.5 text-xs max-sm:gap-1 max-sm:text-[11px]">
            <span className={`h-3 w-3 shrink-0 rounded max-sm:h-2.5 max-sm:w-2.5 ${CELL[l.s]}`} />
            {l.label.replace(" (istirahət)", "")}
            <span className="max-sm:hidden">{l.label.includes("(istirahət)") ? " (istirahət)" : ""}</span>
          </span>
        ))}
      </div>
    </>
  );
}
