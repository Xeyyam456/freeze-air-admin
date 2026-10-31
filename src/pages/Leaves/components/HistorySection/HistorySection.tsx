import { History, Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/ConfirmButton";
import { EmployeeSelect } from "@/shared/components/EmployeeSelect";
import { MONTHS_AZ } from "@/shared/utils/monthsAz";
import type { HistorySectionProps } from "@/types/leaves";
import { FilterChip } from "../FilterChip";
import { HistoryRow } from "../HistoryRow";

const CHIPS = [["all", "Hamısı"], ["approved", "Təsdiqlənən"], ["rejected", "Rədd edilən"], ["cancelled", "Ləğv edilən"]] as const;

// Tarixçə: vəziyyət və usta süzgəci, aylara görə
export function HistorySection({ people, filter, who, counts, total, byMonth, closed, onFilter, onWho, onRemove }: HistorySectionProps) {
  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 className="mr-auto flex items-center gap-2 text-base font-bold"><History size={18} className="text-primary" /> Tarixçə</h2>
        <div className="w-60 max-sm:w-full"><EmployeeSelect value={who} onChange={onWho} employees={people} emptyLabel="Bütün ustalar" /></div>
        <div className="contents max-sm:grid max-sm:w-full max-sm:grid-cols-2 max-sm:gap-2">
          {CHIPS.map(([value, label]) => <FilterChip key={value} active={filter === value} label={label} count={counts[value]} onClick={() => onFilter(value)} />)}
        </div>
        {closed.length > 0 && (
          <ConfirmButton onConfirm={() => onRemove(closed.map((l) => l.id))} success={false} className="btn btn-soft btn-sm text-danger max-sm:w-full max-sm:justify-center"
            title="Rədd və ləğv edilən sorğuları sil" confirmLabel="Bəli, sil"
            question={`${closed.length} rədd və ya ləğv edilmiş sorğu silinəcək. Davamiyyətə təsir etmir.`}>
            <Trash2 size={14} /> Rədd və ləğv edilənləri sil ({closed.length})
          </ConfirmButton>
        )}
      </div>
      {byMonth.length === 0 ? (
        <p className="card muted py-8 text-center text-sm">{total ? "Bu süzgəcə uyğun sorğu yoxdur." : "Tarixçə hələ boşdur."}</p>
      ) : (
        <div className="space-y-5">
          {byMonth.map(([k, list]) => (
            <div key={k}>
              <p className="muted mb-2 text-xs font-semibold uppercase tracking-wider">{MONTHS_AZ[Number(k.slice(5, 7)) - 1]} {k.slice(0, 4)} · {list.length}</p>
              <ul className="card divide-y divide-line overflow-hidden !p-0">{list.map((l) => <HistoryRow key={l.id} leave={l} onRemove={onRemove} />)}</ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
