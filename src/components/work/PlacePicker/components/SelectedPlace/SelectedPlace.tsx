import { Home, MapPin, X } from "lucide-react";
import type { SelectedPlaceProps } from "@/types/workLogs";

// Seçilmiş yer: ad, izah, "Yeri dəyiş" (×)
export function SelectedPlace({ value, onClear }: SelectedPlaceProps) {
  return (
    <div className="flex items-center gap-3 rounded-[10px] border border-primary bg-primary-soft px-3 py-2">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface text-primary">{value.custom ? <Home size={16} /> : <MapPin size={16} />}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{value.label}</span>
        {value.sub && <span className="muted block truncate text-xs">{value.sub}</span>}
      </span>
      <button type="button" onClick={onClear} className="icon-btn !h-7 !w-7" aria-label="Yeri dəyiş" title="Yeri dəyiş"><X size={14} /></button>
    </div>
  );
}
