import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { fitX, rectOf, viewport } from "@/lib/zoom";
import { createPortal } from "react-dom";
import { Box, Boxes, Check, ChevronDown, type LucideIcon } from "lucide-react";
import { useEscapeLayer } from "@/components/Modal";

export type ModelOption = { value: string; label: string; hint?: string };

type Pos = { left: number; width: number; top?: number; bottom?: number };

// Model seçimi: standart <select> əvəzinə ikonlu, izahlı açılan siyahı (UnitSelect ilə eyni üslub).
// Seçim gizli sahə (name) ilə formaya gedir. Siyahı portal ilə body-yə çıxır, yer yoxdursa yuxarı açılır.
// all: "Bütün modellər" kimi ümumi seçim (boş dəyər) üçün ikon fərqli olur.
export function ModelDropdown({ value, onChange, options, name, placeholder = "Model seç...", all = false, icon: ItemIcon = Box, className = "" }: {
  value: string;
  onChange: (v: string) => void;
  options: ModelOption[];
  name?: string;
  placeholder?: string;
  all?: boolean;
  icon?: LucideIcon; // siyahı elementlərinin ikonu (standart: model qutusu)
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  useEscapeLayer(() => setOpen(false), open);

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = rectOf(btnRef.current);
    const need = Math.min(options.length * 40 + 12, 292);
    const below = viewport().h - r.bottom;
    setPos({ ...fitX(r.left, Math.max(r.width, 320)), ...(below >= need + 8 ? { top: r.bottom + 6 } : { bottom: viewport().h - r.top + 6 }) });
  }, [open, options.length]);

  // Kənara klik, sürüşmə və ölçü dəyişməsi siyahını bağlayır (siyahının öz sürüşməsi yox)
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!btnRef.current?.contains(t) && !listRef.current?.contains(t)) setOpen(false);
    };
    const onScroll = (e: Event) => { if (!listRef.current?.contains(e.target as Node)) setOpen(false); };
    const close = () => setOpen(false);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  const current = options.find((o) => o.value === value);
  const Icon = all && value === "" ? Boxes : ItemIcon;

  return (
    <>
      {name && <input type="hidden" name={name} value={value} />}
      <button ref={btnRef} type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open}
        className={`field flex items-center gap-2 text-left ${open ? "!border-primary shadow-[0_0_0_4px_var(--color-primary-soft)]" : ""} ${className}`}>
        {current ? (
          <>
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary-soft text-primary"><Icon size={13} /></span>
            <span className="min-w-0 flex-1 truncate font-semibold">{current.label}</span>
          </>
        ) : (
          <span className="muted min-w-0 flex-1 truncate">{placeholder}</span>
        )}
        <ChevronDown size={15} className={`muted shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && pos && createPortal(
        <div ref={listRef} role="listbox"
          style={{ position: "fixed", left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom }}
          className="nice-scroll z-[150] max-h-72 overflow-y-auto rounded-xl border border-line bg-surface p-1 shadow-[0_12px_32px_rgba(16,24,40,0.16)]">
          {options.map((o) => {
            const selected = o.value === value;
            const OptIcon = all && o.value === "" ? Boxes : ItemIcon;
            return (
              <button key={o.value} type="button" role="option" aria-selected={selected} onClick={() => { onChange(o.value); setOpen(false); }}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors ${selected ? "bg-primary-soft text-primary" : "hover:bg-bg"}`}>
                <OptIcon size={14} className="shrink-0 text-primary" />
                <span className="min-w-0 flex-1 truncate font-semibold">{o.label}</span>
                {o.hint && <span className="muted shrink-0 text-[11px]">{o.hint}</span>}
                {selected ? <Check size={14} className="shrink-0" /> : <span className="w-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </>
  );
}
