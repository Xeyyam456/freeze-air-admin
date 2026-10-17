
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Boxes, Check, ChevronDown, Droplets, Hash, Package, Ruler, Scroll, Weight, type LucideIcon } from "lucide-react";
import { useEscapeLayer } from "./Modal";

// Hər vahidin ikonu və qısa izahı (siyahıda olmayan vahid üçün ümumi qutu ikonu)
const META: Record<string, { icon: LucideIcon; hint: string }> = {
  "ədəd": { icon: Hash, hint: "Sayla" },
  kq: { icon: Weight, hint: "Çəki" },
  metr: { icon: Ruler, hint: "Uzunluq" },
  litr: { icon: Droplets, hint: "Həcm" },
  rulon: { icon: Scroll, hint: "Rulonla" },
  "bağlama": { icon: Boxes, hint: "Bağlamalarla" },
};
const metaOf = (u: string) => META[u] ?? { icon: Package, hint: "Xüsusi vahid" };

type Pos = { left: number; width: number; top?: number; bottom?: number };

// Vahid seçimi: standart <select> əvəzinə ikonlu, izahlı açılan siyahı. Seçim gizli sahə (name, standart "unit") ilə formaya gedir.
// Siyahı portal ilə body-yə çıxır ki, yan panelin və ya pəncərənin kənarında kəsilməsin; yer yoxdursa yuxarı açılır.
export function UnitSelect({ value, onChange, options, name = "unit" }: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  name?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  useEscapeLayer(() => setOpen(false), open);

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const need = options.length * 32 + 12;
    const below = window.innerHeight - r.bottom;
    setPos({ left: r.left, width: Math.max(r.width, 170), ...(below >= need + 8 ? { top: r.bottom + 6 } : { bottom: window.innerHeight - r.top + 6 }) });
  }, [open, options.length]);

  // Kənara klik, sürüşmə və ölçü dəyişməsi siyahını bağlayır
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!btnRef.current?.contains(t) && !listRef.current?.contains(t)) setOpen(false);
    };
    const close = () => setOpen(false);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);

  const current = metaOf(value);
  const CurrentIcon = current.icon;

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <button ref={btnRef} type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open}
        className={`field flex items-center gap-2 text-left ${open ? "!border-primary shadow-[0_0_0_4px_var(--color-primary-soft)]" : ""}`}>
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary-soft text-primary"><CurrentIcon size={13} /></span>
        <span className="min-w-0 flex-1 truncate font-semibold">{value}</span>
        <ChevronDown size={15} className={`muted shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && pos && createPortal(
        <div ref={listRef} role="listbox"
          style={{ position: "fixed", left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom }}
          className="z-[150] rounded-xl border border-line bg-surface p-1 shadow-[0_12px_32px_rgba(16,24,40,0.16)]">
          {options.map((u) => {
            const m = metaOf(u);
            const Icon = m.icon;
            const selected = u === value;
            return (
              <button key={u} type="button" role="option" aria-selected={selected} onClick={() => { onChange(u); setOpen(false); }}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${selected ? "bg-primary-soft text-primary" : "hover:bg-bg"}`}>
                <Icon size={14} className="shrink-0 text-primary" />
                <span className="flex-1 font-semibold">{u}</span>
                <span className="muted text-[11px]">{m.hint}</span>
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
