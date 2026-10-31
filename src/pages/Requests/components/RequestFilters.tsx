import { Search } from "lucide-react";
import type { RequestFiltersProps } from "@/types/requests";
import { Input } from "@/shared/components/Input";

const TABS = [["new", "Yeni"], ["handled", "Baxılıb"], ["all", "Hamısı"]] as const;

// Filtr tabları (say ilə) və axtarış
export function RequestFilters({ filter, onFilter, counts, query, onQuery }: RequestFiltersProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="inline-flex gap-1 rounded-xl bg-line/60 p-1 max-sm:flex max-sm:w-full" role="tablist">
        {TABS.map(([f, label]) => (
          <button key={f} type="button" role="tab" aria-selected={filter === f} onClick={() => onFilter(f)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors max-sm:flex-1 max-sm:justify-center max-sm:gap-1.5 max-sm:px-2 ${
              filter === f ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
            }`}>
            {label}
            <span className={`rounded-full px-1.5 text-xs ${f === "new" && counts.new ? "bg-danger text-white" : "bg-primary-soft text-primary"}`}>{counts[f]}</span>
          </button>
        ))}
      </div>
      <label className="relative w-full max-w-sm sm:w-auto sm:min-w-[12rem] sm:flex-1">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <Input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Ad, telefon, e-poçt və ya mesaj..."
          className="!pl-10" aria-label="Müraciət axtar" />
      </label>
    </div>
  );
}
