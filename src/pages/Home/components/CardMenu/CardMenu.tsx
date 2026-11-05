import { useEffect, useRef, useState } from "react";
import { Check, MoreHorizontal } from "lucide-react";
import { useEscapeLayer } from "@/shared/hooks/useEscapeLayer";
import type { CardMenuProps } from "@/types/dashboard";
import s from "./CardMenu.module.css";

// Kartın "…" menyusu: kliklə açılır, kənara klik və ya Esc bağlayır; bənd seçiləndə də bağlanır
export function CardMenu({ label, items }: CardMenuProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEscapeLayer(() => setOpen(false), open);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  return (
    <div ref={root} className={s.root}>
      <button type="button" className={`${s.trigger} ${open ? s.on : ""}`} onClick={() => setOpen((v) => !v)}
        aria-label={`${label}: menyu`} aria-haspopup="menu" aria-expanded={open}>
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className={s.menu} role="menu">
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <div key={it.label}>
                {it.section && it.section !== items[i - 1]?.section && <p className={s.section}>{it.section}</p>}
                <button type="button" role="menuitem" className={`${s.item} ${it.active ? s.active : ""}`}
                  onClick={() => { it.onSelect(); setOpen(false); }}>
                  {Icon ? <Icon size={15} /> : <span className={s.gap} />}
                  <span>{it.label}</span>
                  {it.active && <Check size={14} className={s.check} />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
