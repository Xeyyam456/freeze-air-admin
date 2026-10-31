import { Check } from "lucide-react";
import type { PickerOptionProps } from "@/types/shared";

export function PickerOption({ item, index, active, selected, icon: Icon, onActive, onChoose }: PickerOptionProps) {
  return (
    <li role="option" aria-selected={selected}>
      <button type="button" onMouseEnter={() => onActive(index)} onClick={() => onChoose(item)}
        className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors ${active ? "bg-primary-soft text-primary" : "hover:bg-bg"}`}>
        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md ${active ? "bg-surface" : "bg-bg"} text-primary`}><Icon size={13} /></span>
        <span className="min-w-0 flex-1">
          <span className="block truncate">{item.name}</span>
          {item.hint && <span className="muted hidden text-[10.5px] font-semibold leading-tight max-sm:block">{item.hint}</span>}
        </span>
        {item.hint && <span className="muted shrink-0 text-[11px] font-semibold max-sm:hidden">{item.hint}</span>}
        {selected && <Check size={15} className="shrink-0 text-primary" />}
      </button>
    </li>
  );
}
