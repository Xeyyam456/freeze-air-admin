import { createPortal } from "react-dom";
import { PackageOpen, Search } from "lucide-react";
import type { ToolPickerMenuProps } from "@/types/shared";
import { PickerOption } from "./PickerOption";
import { useMenuPosition } from "./useMenuPosition";

// ToolPicker-in açılan siyahısı (axtarış + 5 sətir görünən sürüşən siyahı). Portal ilə body-yə çıxır (fixed): dar pəncərənin
// içində kəsilməsin.
export function ToolPickerMenu({ anchor, items, value, active, query, searchRef, icon, searchLabel, onActive, onQuery, onChoose, onClose }: ToolPickerMenuProps) {
  const style = useMenuPosition(anchor, onClose);
  if (!style) return null;

  return createPortal(
    <div data-picker-menu style={style} className="fixed z-[120] overflow-hidden rounded-xl border border-line bg-surface shadow-[0_16px_40px_rgba(16,24,40,0.18)]">
      <div className="flex items-center gap-2 border-b border-line px-3">
        <Search size={14} className="muted shrink-0" />
        <input ref={searchRef} value={query} onChange={(e) => onQuery(e.target.value)} placeholder={searchLabel} aria-label={searchLabel}
          className="h-10 w-full bg-transparent text-[13px] outline-none max-sm:h-8 max-sm:text-xs" />
        <span className="muted shrink-0 text-xs">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-1 px-3 py-5 text-center">
          <PackageOpen size={18} className="muted" />
          <p className="muted text-xs">Bu adla heç nə tapılmadı</p>
        </div>
      ) : (
        <ul role="listbox" className="nice-scroll max-h-[212px] overflow-y-auto p-1.5">
          {items.map((item, i) => (
            <PickerOption key={item.id} item={item} index={i} active={i === active} selected={item.id === value} icon={icon} onActive={onActive} onChoose={onChoose} />
          ))}
        </ul>
      )}
    </div>,
    document.body,
  );
}
