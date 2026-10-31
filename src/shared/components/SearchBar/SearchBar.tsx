import { Search, X } from "lucide-react";
import type { SearchBarProps } from "@/types/employees";

// Axtarış yuxarıda yapışıq qalır (Ustalar, Rəhbərlik)
export function SearchBar({ value, onChange, placeholder, label }: SearchBarProps) {
  return (
    <div className="sticky top-[var(--header-h)] z-20 -mx-1 bg-bg/90 px-1 py-2 backdrop-blur">
      <label className="flex h-11 items-center gap-2.5 rounded-xl bg-surface px-3.5 ring-1 ring-line focus-within:ring-2 focus-within:ring-primary">
        <Search size={18} className="shrink-0 text-muted" />
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={label}
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none" />
        {value && (
          <button type="button" onClick={() => onChange("")} className="text-muted hover:text-ink" aria-label="Axtarışı təmizlə">
            <X size={16} />
          </button>
        )}
      </label>
    </div>
  );
}
