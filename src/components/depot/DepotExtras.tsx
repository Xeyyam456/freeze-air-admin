import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ShoppingCart } from "lucide-react";
import { Modal, useEscapeLayer } from "@/components/Modal";
import { DHead } from "./DepotUi";
import { isLowStock, TEXT, withUnit, type Kind, type Tool } from "./depotUtils";


// Alınmalı: minimum qalıq həddinə çatan alət və materiallar (həddi olmayan siyahıya düşmür). Sətirdən "Mədaxil".
export function ShoppingModal({ tools, onReceipt, onClose }: { tools: Tool[]; onReceipt: (t: Tool) => void; onClose: () => void }) {
  const low = tools.filter(isLowStock).sort((a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name, "az"));
  return (
    <Modal onClose={onClose} labelledBy="shopping-title" className="!max-w-xl">
      <DHead id="shopping-title" icon={ShoppingCart} tone="amber" title="Alınmalı" sub="Minimum qalığa çatanlar: gələndə «Mədaxil» yaz" onClose={onClose} />
      {low.length === 0 ? (
        <p className="muted py-8 text-center text-sm">Heç nə azalmayıb. (Minimum qalıq alətin redaktəsində yazılır.)</p>
      ) : (
        <ul className="nice-scroll max-h-[min(460px,calc(100dvh-240px))] divide-y divide-line overflow-y-auto">
          {low.map((t) => {
            const have = t.available + t.pieces_total;
            const need = Math.max(1, (t.min_stock ?? 0) - have + 1);
            return (
              <li key={t.id} className="flex items-center gap-3 py-2.5">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{t.name}</span>
                  <span className="muted block text-xs">
                    {TEXT[t.kind as Kind].col} · depoda <b className={have ? "text-ink" : "text-danger"}>{withUnit(have, t)}</b>, minimum {withUnit(t.min_stock ?? 0, t)} · ən az {withUnit(need, t)} lazımdır
                  </span>
                </span>
                <button type="button" onClick={() => onReceipt(t)} className="btn btn-secondary btn-sm !h-8 shrink-0">Mədaxil</button>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}

// "Daha çox" menyusu (başlıqda): klik ilə açılan öz siyahımız (hover yox). Az işlənən əməliyyatlar burada gizlənir.
// Siyahı body-yə çıxır (portal, fixed): başlığın içində qalanda səhifənin arxasında görünürdü.
export function MoreMenu({ items, dark = false }: { items: { label: string; icon: typeof ShoppingCart; onClick: () => void; badge?: number }[]; dark?: boolean }) {
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
          const r = e.currentTarget.getBoundingClientRect();
          setPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
        }}
        className={`inline-flex h-10 items-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold transition-colors ${dark ? "bg-white/10 text-white hover:bg-white/20" : "border border-line bg-surface hover:bg-bg"}`}>
        Daha çox <ChevronDown size={15} className={pos ? "rotate-180" : ""} />
      </button>
      {pos && createPortal(
        <div data-more-menu role="menu" style={{ top: pos.top, right: pos.right }}
          className="fixed z-[90] w-56 rounded-xl border border-line bg-surface p-1.5 text-ink shadow-[0_16px_40px_rgba(16,24,40,0.18)]">
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
