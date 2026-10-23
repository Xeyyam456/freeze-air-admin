import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ShoppingCart } from "lucide-react";
import { Modal, useEscapeLayer } from "@/components/Modal";
import { toast } from "@/lib/toast";
import { DHead } from "./DepotUi";
import { dateAz, daysSince, fmt, isLowStock, STALE_DAYS, TEXT, timeAz, unitOf, withUnit, type Holding, type Kind, type Tool } from "./depotUtils";

// Excel: anbarın bu anki vəziyyəti (hər alət/material bir sətir) + ustalarda olanlar (write-excel-file, digər ixraclarla eyni üslub)
const NAVY = "#0a1a33", BLUE = "#1f6feb", LINE = "#d9dfeb", ZEBRA = "#f4f7fc", MUTED = "#667085", RED = "#dc2626", AMBER = "#b45309", OK = "#16a34a";
const border = { borderColor: LINE, borderStyle: "thin" as const };
const head = (value: string, align: "left" | "center" = "center") =>
  ({ value, fontWeight: "bold" as const, textColor: "#ffffff", backgroundColor: BLUE, align, alignVertical: "center" as const, height: 30, wrap: true, ...border });
const span = (cols: number, value: string, style: Record<string, unknown>) => [{ value, columnSpan: cols, ...style }, ...Array(cols - 1).fill(null)];

export async function exportStock(tools: Tool[], holdings: Holding[]) {
  if (tools.length === 0) return toast.error("Depo boşdur.");
  const now = new Date();
  const stamp = `${dateAz(now.toISOString())} ${timeAz(now.toISOString())}`;
  const byTool = new Map<number, Holding[]>();
  for (const h of holdings) byTool.set(h.tool_id, [...(byTool.get(h.tool_id) ?? []), h]);
  const sorted = [...tools].sort((a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name, "az"));

  const C1 = 12;
  const stock = [
    span(C1, "Freeze Air Service — Depo vəziyyəti", { fontWeight: "bold", fontSize: 16, textColor: "#ffffff", backgroundColor: NAVY, alignVertical: "center", height: 34, indent: 1 }),
    span(C1, `Tarix: ${stamp} · ${tools.length} ad · materialda "Depoda" = tam hissə, parçalar ayrıca`, { fontSize: 10, textColor: MUTED, alignVertical: "center", height: 20, indent: 1 }),
    Array(C1).fill(null),
    [head("№"), head("Növ"), head("Ad", "left"), head("Vahid"), head("Cəmi"), head("Depoda"), head("Ustalarda"), head("Təmirdə"), head("Parçalar"), head("Minimum"), head("Vəziyyət"), head("Kimdədir", "left")],
    ...sorted.map((t, i) => {
      const base = { alignVertical: "center" as const, height: 22, ...(i % 2 ? { backgroundColor: ZEBRA } : {}), ...border };
      const num = (v: number) => ({ ...base, value: v, type: Number, align: "center" as const, textColor: v ? "#111827" : MUTED });
      const low = isLowStock(t);
      const status = t.available + t.pieces_total === 0 ? { v: "Bitib", c: RED } : low ? { v: "Azdır", c: AMBER } : { v: "Var", c: OK };
      const who = (byTool.get(t.id) ?? []).map((h) => `${h.employees?.full_name ?? "?"} (${fmt(h.quantity)})`).join(", ");
      return [
        { ...base, value: i + 1, type: Number, align: "center" as const, textColor: MUTED },
        { ...base, value: t.kind === "material" ? "Material" : "Alət", textColor: MUTED },
        { ...base, value: t.name, fontWeight: "bold" as const },
        { ...base, value: unitOf(t), align: "center" as const },
        num(t.quantity + t.pieces_total), { ...num(t.available), fontWeight: "bold" as const }, num(t.given_out), num(t.in_repair), num(t.pieces_total),
        { ...base, value: t.min_stock ?? "", align: "center" as const, textColor: MUTED },
        { ...base, value: status.v, textColor: status.c, fontWeight: "bold" as const, align: "center" as const },
        { ...base, value: who, wrap: true },
      ];
    }),
  ];

  const C2 = 7;
  const held = [...holdings].sort((a, b) => (a.employees?.full_name ?? "").localeCompare(b.employees?.full_name ?? "", "az") || a.taken_at.localeCompare(b.taken_at));
  const toolOf = new Map(tools.map((t) => [t.id, t]));
  const people = [
    span(C2, "Ustalarda olanlar", { fontWeight: "bold", fontSize: 16, textColor: "#ffffff", backgroundColor: NAVY, alignVertical: "center", height: 34, indent: 1 }),
    Array(C2).fill(null),
    [head("Usta", "left"), head("Ad", "left"), head("Növ"), head("Miqdar"), head("Götürüb"), head("Gün"), head("Təsdiq")],
    ...held.map((h, i) => {
      const t = toolOf.get(h.tool_id);
      const base = { alignVertical: "center" as const, height: 22, ...(i % 2 ? { backgroundColor: ZEBRA } : {}), ...border };
      const d = daysSince(h.taken_at);
      return [
        { ...base, value: h.employees?.full_name ?? "?", fontWeight: "bold" as const },
        { ...base, value: t?.name ?? "—" },
        { ...base, value: t?.kind === "material" ? "Material" : "Alət", textColor: MUTED, align: "center" as const },
        { ...base, value: `${fmt(h.quantity)} ${t ? unitOf(t) : ""}`, align: "center" as const },
        { ...base, value: dateAz(h.taken_at), align: "center" as const },
        { ...base, value: d, type: Number, align: "center" as const, textColor: d >= STALE_DAYS ? AMBER : "#111827" },
        { ...base, value: h.received_at ? "Aldı" : h.disputed_at ? "Almadım deyir" : "Gözləyir", align: "center" as const,
          textColor: h.received_at ? OK : h.disputed_at ? RED : AMBER, fontWeight: "bold" as const },
      ];
    }),
  ];

  const write = (await import("write-excel-file/browser")).default;
  await write([
    { data: stock, sheet: "Depo", columns: [{ width: 5 }, { width: 10 }, { width: 30 }, { width: 9 }, ...Array(6).fill({ width: 11 }), { width: 11 }, { width: 44 }], stickyRowsCount: 4, showGridLines: false, orientation: "landscape" },
    { data: people, sheet: "Ustalarda", columns: [{ width: 24 }, { width: 30 }, { width: 10 }, { width: 13 }, { width: 12 }, { width: 7 }, { width: 15 }], stickyRowsCount: 3, showGridLines: false, orientation: "landscape" },
  ], { fontFamily: "Calibri", fontSize: 11 }).toFile(`depo-${now.toISOString().slice(0, 10)}.xlsx`);
  toast.success("Depo vəziyyəti Excel fayla yazıldı");
}

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
