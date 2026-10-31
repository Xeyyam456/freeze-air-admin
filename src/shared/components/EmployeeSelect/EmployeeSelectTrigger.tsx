import { ChevronDown, UserRound } from "lucide-react";
import { Avatar } from "@/shared/components/Avatar";
import type { EmployeeSelectTriggerProps } from "@/types/employees";

// Seçim düyməsi: seçilmiş usta (şəkil + ad) və ya yer tutan yazı
export function EmployeeSelectTrigger({ selected, value, placeholder, emptyLabel, open, btnRef, onToggle, onKey }: EmployeeSelectTriggerProps) {
  return (
    <button ref={btnRef} type="button" onClick={onToggle} onKeyDown={onKey} aria-haspopup="listbox" aria-expanded={open}
      className={`field flex items-center gap-2.5 text-left ${open ? "!border-primary shadow-[0_0_0_4px_var(--color-primary-soft)]" : ""}`}>
      {selected ? (
        <>
          <Avatar employee={selected} className="!h-7 !w-7 !text-[10px] !shadow-none" />
          <span className="min-w-0 flex-1 truncate font-semibold">{selected.full_name}</span>
        </>
      ) : (
        <>
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-bg text-muted"><UserRound size={15} /></span>
          <span className="muted min-w-0 flex-1 truncate">{value === null && emptyLabel ? emptyLabel : placeholder}</span>
        </>
      )}
      <ChevronDown size={15} className={`muted shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
    </button>
  );
}
