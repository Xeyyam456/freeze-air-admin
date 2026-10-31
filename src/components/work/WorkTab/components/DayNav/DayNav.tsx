import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { DatePicker } from "@/shared/components/DatePicker";
import type { DayNavProps } from "@/types/workLogs";
import { dayIso } from "../../hooks/useWorkTab";
import { Button } from "@/shared/components/Button";

const chip = (active: boolean) =>
  `h-9 rounded-lg px-3 text-[13px] font-semibold transition-colors ${active ? "bg-primary text-white" : "bg-bg text-ink hover:bg-primary-soft"}`;

// Gün seçimi: Bu gün, Dünən, ‹ təqvim ›; usta özünə baxırsa "Yeni iş"
export function DayNav({ day, today, yesterday, canAdd, onDay, onAdd }: DayNavProps) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <button type="button" onClick={() => onDay(today)} className={chip(day === today)}>Bu gün</button>
      <button type="button" onClick={() => onDay(yesterday)} className={chip(day === yesterday)}>Dünən</button>
      <div className="flex flex-1 items-center gap-1">
        <button type="button" onClick={() => onDay(dayIso(-1, day))} className="icon-btn !h-9 !w-9" aria-label="Əvvəlki gün">
          <ChevronLeft size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <DatePicker value={day} onChange={onDay} max={today} small />
        </div>
        <button type="button" onClick={() => onDay(dayIso(1, day))} disabled={day >= today}
          className="icon-btn !h-9 !w-9 disabled:opacity-30" aria-label="Növbəti gün">
          <ChevronRight size={18} />
        </button>
      </div>
      {canAdd && (
        <Button type="button" onClick={onAdd} size="sm" className="!h-9">
          <Plus size={14} /> Yeni iş
        </Button>
      )}
    </div>
  );
}
