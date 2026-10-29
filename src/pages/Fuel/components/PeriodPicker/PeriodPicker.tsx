import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import type { PeriodPickerProps } from "@/types/fuel";
import { PERIOD_LABEL } from "../../shared/period";

// Dövr seçimi (Gün | Həftə | Ay) və ‹ tarix ›; gələcəyə keçmir
export function PeriodPicker({ period, range, atEnd, onPeriod, onShift }: PeriodPickerProps) {
  return (
    <div className="ml-auto flex flex-wrap items-center gap-2 max-sm:w-full min-[341px]:max-sm:flex-nowrap max-sm:justify-between max-sm:gap-1.5 max-[340px]:flex-wrap max-[340px]:gap-y-2">
      <div className="flex shrink-0 gap-1 rounded-xl bg-white/10 p-1 max-sm:gap-0.5 max-[340px]:w-full" role="tablist" aria-label="Dövr">
        {(["day", "week", "month"] as const).map((p) => (
          <button key={p} type="button" role="tab" aria-selected={period === p} onClick={() => onPeriod(p)}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors max-sm:px-2.5 max-sm:py-1 max-sm:text-[13px] max-[340px]:!px-2 max-[340px]:flex-1 max-[340px]:!text-[13px] ${period === p ? "bg-white text-[#0b1324]" : "text-white/70 hover:text-white"}`}>
            {PERIOD_LABEL[p]}
          </button>
        ))}
      </div>
      <div className="flex min-w-0 items-center gap-1 rounded-xl bg-white/10 px-1 py-1 max-sm:gap-0 max-[340px]:w-full max-[340px]:justify-between">
        <button type="button" onClick={() => onShift(-1)} className="grid h-7 w-7 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white max-[340px]:w-5" aria-label="Əvvəlki"><ChevronLeft size={16} /></button>
        <span className="flex min-w-32 items-center justify-center gap-1.5 whitespace-nowrap text-sm font-semibold max-sm:min-w-0 max-sm:px-1 max-sm:text-[13px] max-[340px]:px-0 max-[340px]:text-[11.5px]"><CalendarDays size={14} className="text-frost max-[391px]:hidden" /> <span className="max-[391px]:hidden">{range.label}</span><span className="hidden min-[341px]:max-[391px]:inline">{range.short}</span><span className="hidden max-[340px]:inline">{range.full}</span></span>
        <button type="button" onClick={() => onShift(1)} disabled={atEnd} className="grid h-7 w-7 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30 max-[340px]:w-5" aria-label="Sonrakı"><ChevronRight size={16} /></button>
      </div>
    </div>
  );
}
