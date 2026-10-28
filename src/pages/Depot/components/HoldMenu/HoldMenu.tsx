import { useEffect, useRef, useState } from "react";
import { rectOf, viewport } from "@/lib/zoom";
import { createPortal } from "react-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useEscapeLayer } from "@/shared/hooks/useEscapeLayer";
import { SOFT, type Tone } from "@/pages/Depot/components/ui";

// Ustanın üzərindəkilər: "3 alət ▾" düyməsi, basanda siyahı açılır (10 alət olsa da sətir səliqəli qalır).
// Siyahı body-yə çıxır (portal): cədvəlin içində kəsilməsin. Altda "Pəncərədə aç" → ustanın pəncərəsi.
export function HoldMenu({ items, tone, word, onOpen }: { items: { name: string; qty: string }[]; tone: Tone; word: string; onOpen: () => void }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  useEscapeLayer(() => setPos(null), pos !== null);
  useEffect(() => {
    if (!pos) return;
    const close = () => setPos(null);
    const onDown = (e: MouseEvent) => {
      if (!(e.target as Element).closest("[data-hold-menu]") && !btn.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [pos]);
  if (items.length === 0) return <span className="text-muted">—</span>;
  return (
    <>
      <button ref={btn} type="button" aria-expanded={pos !== null} aria-haspopup="true"
        onClick={(e) => {
          e.stopPropagation();
          if (pos) return setPos(null);
          const r = rectOf(e.currentTarget);
          setPos({ top: r.bottom + 6, left: Math.min(r.left, viewport().w - 300) });
        }}
        className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-semibold transition ${SOFT[tone]} hover:brightness-95`}>
        {items.length} {word} <ChevronDown size={14} className={`transition-transform ${pos ? "rotate-180" : ""}`} />
      </button>
      {pos && createPortal(
        <div data-hold-menu style={{ top: pos.top, left: pos.left }} onClick={(e) => e.stopPropagation()}
          className="fixed z-[90] w-[18rem] overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_18px_44px_-12px_rgba(16,24,40,0.3)]">
          <ul className="nice-scroll max-h-72 overflow-y-auto p-1.5">
            {items.map((i) => (
              <li key={i.name} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px]">
                <span className={`h-2 w-2 shrink-0 rounded-full ${tone === "teal" ? "bg-[#14b8a6]" : "bg-[#3b82f6]"}`} />
                <span className="min-w-0 flex-1 truncate font-semibold">{i.name}</span>
                {i.qty && <span className="shrink-0 tabular-nums text-muted">{i.qty}</span>}
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => { setPos(null); onOpen(); }}
            className="flex w-full items-center justify-center gap-1.5 border-t border-line bg-[#fafbfd] py-2.5 text-[13px] font-semibold text-primary hover:bg-bg">
            Pəncərədə aç <ArrowRight size={14} />
          </button>
        </div>,
        document.body,
      )}
    </>
  );
}
