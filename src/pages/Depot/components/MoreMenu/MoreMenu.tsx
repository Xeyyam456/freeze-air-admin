import { useEffect, useRef, useState } from "react";
import { rectOf, viewport } from "@/lib/zoom";
import { createPortal } from "react-dom";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import { useEscapeLayer } from "@/shared/hooks/useEscapeLayer";
import type { MoreMenuProps } from "@/types/depot";

// "Daha çox" menyusu (başlıqda): klik ilə açılan öz siyahımız (hover yox). Az işlənən əməliyyatlar burada gizlənir.
// Siyahı body-yə çıxır (portal, fixed): başlığın içində qalanda səhifənin arxasında görünürdü.
export function MoreMenu({ items, dark = false }: MoreMenuProps) {
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  useEscapeLayer(() => setPos(null), pos !== null);
  useEffect(() => {
    if (!pos) return;
    const close = () => setPos(null);
    const onDown = (e: MouseEvent) => {
      if (!(e.target as Element).closest("[data-more-menu]") && !btn.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [pos]);
  return (
    <>
      <button ref={btn} type="button" aria-expanded={pos !== null} aria-haspopup="menu"
        onClick={(e) => {
          if (pos) return setPos(null);
          const r = rectOf(e.currentTarget);
          setPos({ top: r.bottom + 8, right: Math.max(12, Math.min(viewport().w - r.right, viewport().w - 224 - 12)) });
        }}
        className={`inline-flex h-10 items-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold transition-colors max-sm:w-10 max-sm:justify-center max-sm:px-0 ${dark ? "bg-white/10 text-white hover:bg-white/20" : "border border-line bg-surface hover:bg-bg"}`}>
        <span className="max-sm:hidden">Daha çox</span><MoreHorizontal size={18} className="sm:hidden" aria-label="Daha çox" /><ChevronDown size={15} className={`max-sm:hidden ${pos ? "rotate-180" : ""}`} />
      </button>
      {pos && createPortal(
        <div data-more-menu role="menu" style={{ top: pos.top, right: pos.right }}
          className="fixed z-[90] w-56 max-w-[calc(100vw-24px)] rounded-xl border border-line bg-surface p-1.5 text-ink shadow-[0_16px_40px_rgba(16,24,40,0.18)]">
          {items.map(({ label, icon: Icon, onClick, badge }) => (
            <button key={label} type="button" role="menuitem" onClick={() => { setPos(null); onClick(); }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold hover:bg-bg">
              <Icon size={16} className="text-muted" /> <span className="flex-1">{label}</span>
              {!!badge && <span className="rounded-full bg-danger px-1.5 text-[11px] text-white">{badge}</span>}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </>
  );
}
