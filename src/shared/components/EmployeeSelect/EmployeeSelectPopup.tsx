import { createPortal } from "react-dom";
import { Search } from "lucide-react";
import type { EmployeeSelectPopupProps } from "@/types/employees";
import { EmployeeSelectOption } from "./EmployeeSelectOption";

// Siyahı portal ilə body-yə çıxır (modal və kartların kəsməsindən qorunur)
export function EmployeeSelectPopup(p: EmployeeSelectPopupProps) {
  const { pos } = p;
  return createPortal(
    <div ref={p.listRef}
      style={{ position: "fixed", left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom, maxHeight: pos.maxHeight }}
      className="z-[150] flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_16px_40px_rgba(16,24,40,0.18)]">
      {p.showSearch && (
        <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
          <Search size={15} className="muted shrink-0" />
          <input autoFocus value={p.query} onKeyDown={p.onKey} aria-label="Usta axtar" placeholder="Ad və ya ixtisas..."
            onChange={(e) => p.onSearch(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
        </div>
      )}
      <div role="listbox" className="nice-scroll min-h-0 flex-1 overflow-y-auto p-1.5 max-sm:p-1 [scrollbar-gutter:auto]">
        {p.options.length === 0 && <p className="muted px-3 py-4 text-center text-sm">Usta tapılmadı</p>}
        {p.options.map((o, i) => (
          <EmployeeSelectOption key={o?.id ?? "none"} option={o} index={i} selected={(o?.id ?? null) === p.value}
            active={i === p.active} emptyLabel={p.emptyLabel} hint={(o && p.hint?.(o.id)) || null}
            onHover={p.onHover} onPick={p.onPick} />
        ))}
      </div>
    </div>,
    document.body,
  );
}
