import { Building2, PenLine, Store } from "lucide-react";
import type { PlaceListProps } from "@/types/workLogs";
import { FIXED_GROUP } from "../../utils/place";

// Açılan siyahı: qruplar (sabit məkanlar, şəbəkələr), yerlər; sonda yazılan mətni "siyahıda olmayan yer" kimi yazmaq
export function PlaceList({ loading, groups, trimmed, empty, customIndex, active, onActive, onChoose }: PlaceListProps) {
  // Qruplar boyu ümumi sıra nömrəsi: hər qrupun başlanğıcı (klaviatura ilə gəzmək üçün)
  const starts = groups.map((_, gi) => groups.slice(0, gi).reduce((n, [, it]) => n + it.length, 0));
  return (
    <div className="absolute left-0 right-0 z-20 mt-1.5 overflow-hidden rounded-xl border border-line bg-surface shadow-[0_16px_40px_rgba(16,24,40,0.18)]">
      <div id="place-list" role="listbox" className="max-h-64 overflow-y-auto px-1.5 pb-1">
        {loading && <p className="muted px-3 py-4 text-center text-sm">Yüklənir...</p>}

        {groups.map(([group, items], gi) => (
          <div key={group} className="pb-1">
            <p className="sticky top-0 z-10 -mx-1.5 flex items-center gap-1.5 border-b border-line bg-[#f8f9fc] px-4 py-1.5 text-[11px] font-bold text-muted">
              {group === FIXED_GROUP ? <Building2 size={13} /> : <Store size={13} />} {group}
              <span className="ml-auto font-medium">{items.length}</span>
            </p>
            {items.map((p, pi) => {
              const i = starts[gi] + pi;
              return (
                <button key={p.key} type="button" role="option" aria-selected={i === active} data-index={i}
                  onMouseEnter={() => onActive(i)} onClick={() => onChoose(i, p)}
                  className={`mt-0.5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors ${
                    i === active ? "bg-primary-soft" : ""
                  }`}>
                  <span className={`min-w-0 flex-1 ${i === active ? "text-primary" : ""}`}>
                    <span className="block truncate text-[13px] font-semibold">{p.label}</span>
                    {p.sub && <span className="muted block truncate text-xs">{p.sub}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        ))}

        {trimmed && empty && (
          <p className="muted px-3 pb-1 pt-3 text-center text-xs">Siyahıda “{trimmed}” tapılmadı.</p>
        )}
      </div>

      {/* Siyahıda olmayan yer: yazılan mətn yer kimi saxlanır */}
      {trimmed && (
        <button type="button" data-index={customIndex} onMouseEnter={() => onActive(customIndex)}
          onClick={() => onChoose(customIndex)}
          className={`flex w-full items-center gap-2.5 border-t border-line px-4 py-2.5 text-left transition-colors ${
            customIndex === active ? "bg-primary-soft" : "hover:bg-bg"
          }`}>
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"><PenLine size={14} /></span>
          <span className="min-w-0 flex-1 text-[13px]">
            <span className="block truncate font-semibold">“{trimmed}”</span>
            <span className="muted block text-xs">Siyahıda olmayan yer kimi yaz</span>
          </span>
        </button>
      )}
    </div>
  );
}
