import { ChevronLeft, ChevronRight } from "lucide-react";
import { iso } from "@/shared/utils/isoDate";
import { MONTHS_AZ } from "@/shared/utils/monthsAz";
import { localDate } from "@/shared/utils/localDate";
import type { CalendarProps } from "@/types/shared";

const WEEKDAYS = ["B.e", "Ç.a", "Ç", "C.a", "C", "Ş", "B"]; // həftə bazar ertəsindən
const navBtn = "grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-bg hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent";

// Ay başlığı (‹ ›), gün şəbəkəsi və "Bu gün" / "Təmizlə"
export function Calendar({ view, value, min, max, required, onShift, onPick }: CalendarProps) {
  const today = localDate();
  const offset = (new Date(view.y, view.m, 1).getDay() + 6) % 7; // bazar ertəsi = 0
  const days = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const nextDisabled = !!max && iso(view.y, view.m + 1, 1) > max;
  const prevDisabled = !!min && iso(view.y, view.m, 1) <= min;

  return (
    <>
      <div className="mb-2 flex items-center justify-between">
        <button type="button" onClick={() => onShift(-1)} disabled={prevDisabled} className={navBtn} aria-label="Əvvəlki ay"><ChevronLeft size={18} /></button>
        <span className="text-sm font-bold">{MONTHS_AZ[view.m]} {view.y}</span>
        <button type="button" onClick={() => onShift(1)} disabled={nextDisabled} className={navBtn} aria-label="Növbəti ay"><ChevronRight size={18} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w) => <span key={w} className="muted py-1 text-[11px] font-semibold">{w}</span>)}
        {cells.map((d, i) => {
          if (d === null) return <span key={`e${i}`} />;
          const v = iso(view.y, view.m, d);
          const disabled = (!!max && v > max) || (!!min && v < min);
          return (
            <button key={v} type="button" disabled={disabled} onClick={() => onPick(v)}
              className={`h-9 rounded-lg text-[13px] font-medium transition-colors disabled:cursor-default disabled:opacity-25 ${
                v === value ? "bg-primary font-bold text-white shadow-sm"
                  : v === today ? "bg-primary-soft font-bold text-primary"
                  : "hover:bg-bg"
              }`}>
              {d}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
        <button type="button" onClick={() => onPick(today)} disabled={(!!max && today > max) || (!!min && today < min)} className="link text-[13px]">Bu gün</button>
        {!required && value && (
          <button type="button" onClick={() => onPick("")} className="text-[13px] font-semibold text-danger hover:underline">Təmizlə</button>
        )}
      </div>
    </>
  );
}
