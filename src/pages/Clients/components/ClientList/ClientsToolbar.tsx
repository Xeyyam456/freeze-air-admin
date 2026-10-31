import { LayoutGrid, List, Search } from "lucide-react";
import type { ClientsToolbarProps } from "@/types/clients";

// Axtarış, say və "Kart / Cədvəl" keçidi (keçid mobildə gizlidir)
export function ClientsToolbar({ query, onQuery, shown, total, view, onView }: ClientsToolbarProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="search-box flex-1">
        <Search size={17} />
        <input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Ad, telefon, ünvan və ya əlaqəli şəxs" />
      </label>
      <span className="muted shrink-0 text-sm">{shown} / {total}</span>
      <div className="seg max-sm:hidden" role="tablist" aria-label="Görünüş">
        <button type="button" role="tab" aria-selected={view === "cards"} onClick={() => onView("cards")} title="Kart">
          <LayoutGrid size={16} />
        </button>
        <button type="button" role="tab" aria-selected={view === "table"} onClick={() => onView("table")} title="Cədvəl">
          <List size={16} />
        </button>
      </div>
    </div>
  );
}
