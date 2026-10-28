import { ShoppingCart } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import { DHead } from "@/pages/Depot/components/ui";
import { isLowStock, TEXT, withUnit, type Kind, type Tool } from "@/pages/Depot/utils";

// Alınmalı: minimum qalıq həddinə çatan alət və materiallar (həddi olmayan siyahıya düşmür). Sətirdən "Mədaxil".
export function ShoppingModal({ tools, onReceipt, onClose }: { tools: Tool[]; onReceipt: (t: Tool) => void; onClose: () => void }) {
  const low = tools.filter(isLowStock).sort((a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name, "az"));
  return (
    <Modal onClose={onClose} labelledBy="shopping-title" className="!max-w-xl">
      <DHead id="shopping-title" icon={ShoppingCart} tone="amber" title="Alınmalı" sub="Minimum qalığa çatanlar: gələndə «Mədaxil» yaz" onClose={onClose} />
      {low.length === 0 ? (
        <p className="muted py-8 text-center text-sm">Heç nə azalmayıb. (Minimum qalıq alətin redaktəsində yazılır.)</p>
      ) : (
        <ul className="nice-scroll max-h-[min(460px,calc(100dvh/var(--zoom)-240px))] divide-y divide-line overflow-y-auto">
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
