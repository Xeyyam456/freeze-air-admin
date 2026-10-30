import { ChevronLeft, ChevronRight } from "lucide-react";
import { MONTHS_AZ } from "@/shared/utils/monthsAz";
import { shiftMonth } from "@/shared/utils/shiftMonth";
import type { CalendarNavProps } from "@/types/attendance";

// Ay oxları (gələcək aya keçmir)
export function CalendarNav({ month, thisMonth, onMonth }: CalendarNavProps) {
  const [y, m] = month.split("-").map(Number);
  return (
    <div className="mb-2 flex items-center gap-2">
      <button type="button" onClick={() => onMonth(shiftMonth(month, -1))} className="icon-btn" aria-label="Əvvəlki ay"><ChevronLeft size={18} /></button>
      <p className="flex-1 text-center font-bold">{MONTHS_AZ[m - 1]} {y}</p>
      <button type="button" onClick={() => onMonth(shiftMonth(month, 1))} disabled={month >= thisMonth} className="icon-btn disabled:opacity-30" aria-label="Sonrakı ay"><ChevronRight size={18} /></button>
    </div>
  );
}
