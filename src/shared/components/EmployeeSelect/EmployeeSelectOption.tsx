import { Check, UserRound } from "lucide-react";
import { Avatar } from "@/shared/components/Avatar";
import type { EmployeeSelectOptionProps } from "@/types/employees";

// Siyahının bir sətri: şəkil, ad, ixtisas, ipucu və seçili işarəsi
export function EmployeeSelectOption({ option: o, index, selected, active, emptyLabel, hint, onHover, onPick }: EmployeeSelectOptionProps) {
  return (
    <button type="button" role="option" aria-selected={selected} data-index={index}
      onMouseEnter={() => onHover(index)} onClick={() => onPick(o)}
      className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors max-sm:gap-2 max-sm:rounded-lg max-sm:px-2 max-sm:py-1 ${
        active ? "bg-bg" : ""} ${selected ? "!bg-primary-soft" : ""}`}>
      {o ? (
        <Avatar employee={o} className="!h-9 !w-9 !text-[11px] !shadow-none max-sm:!h-7 max-sm:!w-7 max-sm:!text-[9px]" />
      ) : (
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-bg text-muted max-sm:h-7 max-sm:w-7"><UserRound size={14} /></span>
      )}
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-sm font-semibold max-sm:text-[13px] max-sm:leading-tight ${selected ? "text-primary" : ""}`}>{o ? o.full_name : emptyLabel}</span>
        {o?.specialty && <span className="muted block truncate text-xs max-sm:text-[11px] max-sm:leading-tight">{o.specialty}</span>}
      </span>
      {hint && <span className="shrink-0 rounded-full bg-bg px-2 py-0.5 text-[11px] font-semibold text-muted">{hint}</span>}
      {selected ? <Check size={15} className="shrink-0 text-primary" /> : <span className="w-[15px] shrink-0" />}
    </button>
  );
}
