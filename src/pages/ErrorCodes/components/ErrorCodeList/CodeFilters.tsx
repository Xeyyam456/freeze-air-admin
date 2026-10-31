import { Search } from "lucide-react";
import { ModelDropdown } from "@/shared/components/ModelDropdown";
import type { CodeFiltersProps } from "@/types/errorCodes";

// Axtarış + model süzgəci dropdown-u
export function CodeFilters({ codes, models, counts, query, onQuery, modelFilter, onModelFilter }: CodeFiltersProps) {
  return (
    <div className="flex shrink-0 gap-3 max-sm:flex-col">
      <div className="search min-w-0 flex-1">
        <Search size={20} />
        <input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Kod və ya açıqlama..." aria-label="Xəta kodu axtarışı" className="max-sm:!text-[13px] max-sm:placeholder:text-[12px]" />
      </div>
      <div className="w-64 shrink-0 max-sm:w-full">
        <ModelDropdown all value={modelFilter} onChange={onModelFilter} className="!h-14 !rounded-[14px]"
          options={[{ value: "", label: "Bütün modellər", hint: `${codes.length} kod` }, ...models.map((m) => ({ value: String(m.id), label: m.name, hint: `${counts.get(m.id) ?? 0} kod` }))]} />
      </div>
    </div>
  );
}
