import type { SortActiveProps } from "@/types/site";
import { Input } from "@/shared/components/Input";

// Sıra və "Saytda göstər": bütün redaktorlarda eyni
export function SortActive({ sort, active, boxed = false }: SortActiveProps) {
  return (
    <div className={boxed ? "flex items-center justify-between gap-3 rounded-xl bg-bg px-3 py-2" : "flex flex-wrap items-center gap-6"}>
      <label className="flex items-center gap-2 text-sm font-semibold">
        Sıra <Input name="sort" type="number" defaultValue={sort} className="!h-8 !w-16 !px-2" />
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input name="is_active" type="checkbox" defaultChecked={active} className="h-4 w-4 accent-[var(--color-primary)]" />
        Saytda göstər
      </label>
    </div>
  );
}
