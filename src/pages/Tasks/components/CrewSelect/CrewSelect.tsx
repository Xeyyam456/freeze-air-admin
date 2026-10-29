import { createPortal } from "react-dom";
import { Check, ChevronDown, Plus, Settings2, UsersRound } from "lucide-react";
import type { CrewSelectProps } from "@/types/tasks";
import { useCrewDropdown } from "../../hooks/useCrewDropdown";
import { crewLabel } from "../../utils/labels";
import { Faces } from "../Faces";

// Briqada seçimi: açılan siyahı (EmployeeSelect quruluşu: portal, yer yoxdursa yuxarı, kənara klik / Esc / sürüşmə bağlayır).
// Sətir: üzlər, ad, üzvlərin adları, ✓; altda "İdarə et" və "Yeni briqada".
export function CrewSelect({ crews, peopleOf, selectedId, onPick, onManage }: CrewSelectProps) {
  const { open, setOpen, pos, btnRef, listRef } = useCrewDropdown(crews.length);
  const current = crews.find((c) => c.id === selectedId) ?? null;

  return (
    <>
      <button ref={btnRef} type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open}
        className={`field flex items-center gap-2.5 text-left ${open ? "!border-primary shadow-[0_0_0_4px_var(--color-primary-soft)]" : ""}`}>
        {current ? (
          <>
            <Faces people={peopleOf(current).slice(0, 3)} size="!h-6 !w-6 !text-[8px]" />
            <span className="min-w-0 flex-1 truncate font-semibold">{crewLabel(current, peopleOf(current))}</span>
          </>
        ) : (
          <>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-bg text-muted"><UsersRound size={15} /></span>
            <span className="muted min-w-0 flex-1 truncate">Briqada seç... <span className="text-xs">({crews.length})</span></span>
          </>
        )}
        <ChevronDown size={15} className={`muted shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && pos && createPortal(
        <div ref={listRef}
          style={{ position: "fixed", left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom, maxHeight: pos.maxHeight }}
          className="z-[150] flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_16px_40px_rgba(16,24,40,0.18)]">
          <div role="listbox" className="min-h-0 flex-1 overflow-y-auto p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {crews.map((c) => {
              const people = peopleOf(c);
              const on = c.id === selectedId;
              return (
                <button key={c.id} type="button" role="option" aria-selected={on}
                  onClick={() => { onPick(on ? null : c); setOpen(false); }}
                  className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors ${on ? "bg-primary-soft" : "hover:bg-bg"}`}>
                  <Faces people={people.slice(0, 3)} size="!h-8 !w-8 !text-[9px]" ring={on ? "ring-primary-soft" : "ring-white"} />
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm font-bold ${on ? "text-primary" : ""}`}>{crewLabel(c, people)}</span>
                    <span className="muted block truncate text-[11px]">{people.map((p) => p.full_name).join(", ")}</span>
                  </span>
                  {on ? <Check size={15} className="shrink-0 text-primary" /> : <span className="w-[15px] shrink-0" />}
                </button>
              );
            })}
          </div>
          <div className="flex shrink-0 items-center justify-between gap-2 border-t border-line bg-bg px-3 py-2 text-xs">
            <button type="button" onClick={() => { setOpen(false); onManage(false); }} className="link flex items-center gap-1"><Settings2 size={13} /> İdarə et</button>
            <button type="button" onClick={() => { setOpen(false); onManage(true); }} className="link flex items-center gap-1"><Plus size={13} /> Yeni briqada</button>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
