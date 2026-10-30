import { useMemo, useState } from "react";
import { Search, Send } from "lucide-react";
import { giveTools } from "@/services/depot/assignments";
import { Modal } from "@/shared/components/Modal";
import { toast } from "@/lib/toast";
import { DHead } from "../DHead";
import { norm } from "@/shared/utils/norm";
import { parseQty, round2, withUnit } from "../../utils/quantity";
import { TEXT } from "../../constants/text";
import type { Tool, BulkGiveModalProps } from "@/types/depot";
import { Button } from "@/shared/components/Button";

// Bir ustaya bir neçə alət/material birdən: siyahıdan seç, hər birinin sayını yaz, bir düymə ilə ver
export function BulkGiveModal({ emp, kind, tools, onClose }: BulkGiveModalProps) {
  const [query, setQuery] = useState("");
  const [qty, setQty] = useState<Record<number, string>>({}); // seçilənlər: id → yazılan say (mətn: sahəni tam silib yenidən yazmaq olsun)
  const num = (id: number) => parseQty(qty[id] ?? "");
  const [pending, setPending] = useState(false);
  const available = useMemo(() => tools.filter((t) => t.available > 0), [tools]);
  const shown = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    return available.filter((t) => words.every((w) => norm(`${t.name} ${t.inventory_code}`).includes(w)));
  }, [available, query]);
  const chosen = available.filter((t) => qty[t.id] !== undefined);
  const okQty = (t: Tool) => num(t.id) > 0 && num(t.id) <= t.available && (t.kind === "material" || Number.isInteger(num(t.id)));
  const valid = chosen.length > 0 && chosen.every(okQty);

  const toggle = (t: Tool) => setQty((q) => {
    const next = { ...q };
    if (next[t.id] === undefined) next[t.id] = "1"; else delete next[t.id];
    return next;
  });

  async function give() {
    if (!valid) return;
    setPending(true);
    const r = await giveTools(emp.id, chosen.map((t) => ({ toolId: t.id, name: t.name, quantity: round2(num(t.id)) })));
    setPending(false);
    if (r?.error) return toast.error(r.error);
    toast.success(`${chosen.length} ${TEXT[kind].word} verildi`);
    onClose();
  }

  return (
    <Modal onClose={onClose} labelledBy="bulk-give-title" className="!max-w-lg">
      <DHead id="bulk-give-title" icon={Send} tone="blue" title={`${emp.full_name}: ${TEXT[kind].word} ver`} sub="İşarələ, sayını yaz, birdən ver" onClose={onClose} />

      <div className="search">
        <Search size={16} className="!left-4" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={TEXT[kind].search.split(" və ")[0] + " axtar..."} aria-label="Axtarış" autoFocus
          className="!h-10 !pl-10 !text-sm max-sm:!h-8 max-sm:!text-xs" />
      </div>

      {available.length === 0 ? (
        <p className="muted py-6 text-center text-sm">Depoda verilə bilən boş {TEXT[kind].word} yoxdur.</p>
      ) : (
        <ul className="nice-scroll mt-3 max-h-[min(360px,calc(100vh/var(--zoom)-340px))] divide-y divide-line overflow-y-auto">
          {shown.map((t) => {
            const on = qty[t.id] !== undefined;
            return (
              <li key={t.id} className="flex items-center gap-3 py-2 max-sm:gap-2 max-sm:py-1.5">
                <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 max-sm:gap-2">
                  <input type="checkbox" checked={on} onChange={() => toggle(t)} className="h-4 w-4 shrink-0 accent-[var(--color-primary)]" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm max-sm:text-xs font-semibold">{t.name}</span>
                    <span className="muted block text-[11px] max-sm:text-[10px]">depoda {withUnit(t.available, t)}</span>
                  </span>
                </label>
                {on && (
                  <span className="flex shrink-0 items-center gap-1.5 max-sm:gap-1">
                    <input inputMode="decimal" autoComplete="off" value={qty[t.id]} aria-label={`${t.name} sayı`}
                      onChange={(e) => setQty((q) => ({ ...q, [t.id]: e.target.value }))}
                      className={`field !h-8 !w-20 !px-2 !text-[13px] max-sm:!h-7 max-sm:!w-10 max-sm:!px-1 max-sm:text-center max-sm:!text-xs ${okQty(t) ? "" : "!border-danger"}`} />
                    <span className="muted text-xs max-sm:text-[10px]">{t.kind === "material" ? t.unit : "ədəd"}</span>
                  </span>
                )}
              </li>
            );
          })}
          {shown.length === 0 && <li className="muted py-6 text-center text-sm">Heç nə tapılmadı.</li>}
        </ul>
      )}

      <div className="mt-4 flex gap-2 border-t border-line pt-4 max-sm:mt-3 max-sm:pt-3">
        <Button disabled={pending || !valid} onClick={give} className="min-w-0 flex-1 max-sm:!h-8 max-sm:!px-2 max-sm:!text-xs">
          {pending ? "Gözləyin..." : chosen.length ? `Seçilənləri ver (${chosen.length})` : `Yuxarıdan ${TEXT[kind].word} seç`}
        </Button>
        <Button variant="cancel" onClick={onClose} className="max-sm:!h-8 max-sm:!px-3 max-sm:!text-xs">Ləğv et</Button>
      </div>
    </Modal>
  );
}
