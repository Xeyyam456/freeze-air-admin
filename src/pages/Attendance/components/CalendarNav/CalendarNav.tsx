import { IconButton } from "@/shared/components/IconButton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MONTHS_AZ } from "@/shared/utils/monthsAz";
import { shiftMonth } from "@/shared/utils/shiftMonth";
import type { CalendarNavProps } from "@/types/attendance";

// Ay oxları (gələcək aya keçmir)
export function CalendarNav({ month, thisMonth, onMonth }: CalendarNavProps) {
  const [y, m] = month.split("-").map(Number);
  return (
    <div className="mb-2 flex items-center gap-2">
      <IconButton onClick={() => onMonth(shiftMonth(month, -1))} aria-label="Əvvəlki ay"><ChevronLeft size={18} /></IconButton>
      <p className="flex-1 text-center font-bold">{MONTHS_AZ[m - 1]} {y}</p>
      <IconButton onClick={() => onMonth(shiftMonth(month, 1))} disabled={month >= thisMonth} className="disabled:opacity-30" aria-label="Sonrakı ay"><ChevronRight size={18} /></IconButton>
    </div>
  );
}
