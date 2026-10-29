import { Save, X } from "lucide-react";
import { Avatar } from "@/components/employees/EmployeeForms";
import type { SelectedListProps } from "@/types/tasks";

// Seçilən ustalar (bir usta və ya qrup): sətir-sətir, × ilə çıxır; altda "Daha bir usta"; 2+ nəfərdə "Briqada kimi saxla"
export function SelectedList({ selected, matching, matchingLabel, add, onRemove, onClear, onSaveCrew }: SelectedListProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex items-center justify-between gap-2 bg-bg px-3 py-1.5">
        <span className="text-xs font-semibold">
          {selected.length > 1 ? <>Qrup · {selected.length} nəfər</> : "Bir usta"}
          {matching && <span className="ml-1.5 rounded-full bg-primary-soft px-1.5 py-0.5 text-[10px] text-primary">{matchingLabel}</span>}
        </span>
        <button type="button" onClick={onClear} className="muted text-[11px] font-semibold hover:text-danger">Təmizlə</button>
      </div>
      <ul className="divide-y divide-line">
        {selected.map((e) => (
          <li key={e.id} className="flex items-center gap-2.5 px-3 py-2">
            <Avatar employee={e} className="!h-8 !w-8 !text-[10px] !shadow-none" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{e.full_name}</span>
              {e.specialty && <span className="muted block truncate text-[11px]">{e.specialty}</span>}
            </span>
            <button type="button" onClick={() => onRemove(e.id)}
              className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-bg hover:text-danger" aria-label={`${e.full_name} çıxar`}>
              <X size={14} />
            </button>
          </li>
        ))}
      </ul>
      <div className="border-t border-line p-2">{add}</div>
      {selected.length > 1 && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line bg-primary-soft/60 px-3 py-2 text-[11px] text-primary">
          <span className="flex-1">Biri «görüldü» basanda tapşırıq hamı üçün görülür.</span>
          {!matching && (
            <button type="button" onClick={onSaveCrew} className="flex items-center gap-1 font-bold hover:underline">
              <Save size={12} /> Briqada kimi saxla
            </button>
          )}
        </div>
      )}
    </div>
  );
}
