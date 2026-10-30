import { ChevronLeft, ChevronRight, FileSpreadsheet, Search } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { MONTHS_AZ } from "@/shared/utils/monthsAz";
import { shiftMonth } from "@/shared/utils/shiftMonth";
import type { BoardToolbarProps } from "@/types/attendance";

// Ay oxları, usta axtarışı, Excel düyməsi
export function BoardToolbar({ month, thisMonth, query, canExport, onMonth, onQuery, onExport }: BoardToolbarProps) {
  const [y, m] = month.split("-").map(Number);
  const isCurrent = month === thisMonth;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1 max-sm:flex-1">
        <button type="button" onClick={() => onMonth(shiftMonth(month, -1))} className="icon-btn" aria-label="Əvvəlki ay"><ChevronLeft size={18} /></button>
        <h2 className="min-w-40 text-center text-lg font-bold max-sm:min-w-0 max-sm:flex-1 max-sm:whitespace-nowrap">{MONTHS_AZ[m - 1]} {y}</h2>
        <button type="button" onClick={() => onMonth(shiftMonth(month, 1))} disabled={isCurrent} className="icon-btn disabled:opacity-30" aria-label="Sonrakı ay"><ChevronRight size={18} /></button>
        {!isCurrent && <Button variant="soft" size="sm" onClick={() => onMonth(thisMonth)} className="ml-1">Bu ay</Button>}
      </div>
      <div className="search min-w-56 flex-1 max-sm:order-last max-sm:min-w-0 max-sm:basis-full">
        <Search size={20} />
        <input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Usta adı ilə axtar..." aria-label="Usta axtarışı" />
      </div>
      <Button variant="soft" onClick={onExport} disabled={!canExport} className="!h-12 shrink-0" title="Davamiyyəti Excel fayla çıxar" aria-label="Excel">
        <FileSpreadsheet size={18} className="text-ok" /><span className="max-[400px]:hidden">Excel</span>
      </Button>
    </div>
  );
}
