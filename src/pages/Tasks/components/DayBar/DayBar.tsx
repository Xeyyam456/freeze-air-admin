import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { formatDateAz } from "@/shared/utils/formatDateAz";
import type { DayBarProps } from "@/types/tasks";
import { shiftDay } from "../../utils/days";

// Gün seçimi (‹ gün ›, "Bu gün"), keçmiş gündə "Yalnız baxış", günün sayları
export function DayBar({ day, today, past, total, doneCount, onDay }: DayBarProps) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 max-sm:gap-x-1.5 max-sm:gap-y-2">
      <button type="button" onClick={() => onDay(shiftDay(day, -1))} className="icon-btn" aria-label="Əvvəlki gün"><ChevronLeft size={18} /></button>
      <h2 className="min-w-44 text-center text-lg font-bold max-sm:min-w-0 max-sm:flex-1">{day === today ? "Bu gün" : formatDateAz(day)}</h2>
      <button type="button" onClick={() => onDay(shiftDay(day, 1))} className="icon-btn" aria-label="Sonrakı gün"><ChevronRight size={18} /></button>
      {day !== today && <button type="button" onClick={() => onDay(today)} className="btn btn-soft btn-sm ml-1 max-sm:ml-0 max-sm:w-full max-sm:justify-center">Bu gün</button>}
      {past && <span className="muted ml-auto flex items-center gap-1.5 text-xs font-semibold" title="Keçmiş günün tapşırığı dəyişdirilmir"><Lock size={13} /> Yalnız baxış</span>}
      <span className={`${past ? "" : "ml-auto "}rounded-full bg-primary-soft px-3 py-1.5 text-sm font-bold text-primary max-sm:w-full max-sm:text-center max-sm:text-[13px]`}>Tapşırıq: {total} · görülən: {doneCount}</span>
    </div>
  );
}
