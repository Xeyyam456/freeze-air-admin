import { useEffect, useMemo, useRef, useState } from "react";
import { rectOf, viewport } from "@/lib/zoom";
import { createPortal } from "react-dom";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, Clock, Hourglass, Package, PackagePlus, Search, Users, Warehouse, Wrench, X } from "lucide-react";
import { Avatar } from "@/components/employees/EmployeeForms";
import { useEscapeLayer } from "@/shared/hooks/useEscapeLayer";
import { urlQuery } from "@/lib/urlQuery";
import { IconTile, PersonModal, QuickGiveModal, SOFT, ToolModal, type Tone } from "@/pages/Depot/components/ui";
import { RecentMovements } from "./HistoryModal";
import {
  daysSince, fmt, isLowStock, isPacked, lossText, norm, pieceWord, REASONS, round2, STALE_DAYS, unitOf,
  type DepotEmployee, type DepotRequest, type Holding, type Kind, type Piece, type Loss, type Repair, type Tool,
} from "@/pages/Depot/utils";

// Depo lövhəsi (2026-10-23 sadələşdirilib; istifadəçi: "çox qəlizdir, uşaq belə rahat istifadə edə bilməlidir").
// Üç böyük tab (Alətlər / Materiallar / Ustalar) + axtarış + sadə siyahı (hər alət bir sətir; ayrıca kartlar "kobud" göründü):
// ad, depoda nə qədər, ustalarda, "Ver". Sətrə basanda alətin pəncərəsi (Kimdədir, Mədaxil, Silinmə...), ustaya basanda ustanın pəncərəsi açılır.
// Süzgəc çipləri, sıralama, cədvəl, toplu seçim və QR etiket istifadəçi istəyi ilə çıxarılıb: yenidən əlavə etmə.

export type DepotTab = Kind | "people";
// "home": ümumi baxış (depo açılanda ilk bu görünür), sonra seçilən siyahı
export type DepotView = DepotTab | "home";

// Depoda (boş) nə qədər var: materialda tam hissə + parçalar
const inStock = (t: Tool) => t.available + t.pieces_total;

// Vəziyyət: rəngli nöqtə + yazı
function StatusDot({ tone, label }: { tone: Tone; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${SOFT[tone]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" /> {label}
    </span>
  );
}

// Ustanın üzərindəkilər: "3 alət ▾" düyməsi, basanda siyahı açılır (10 alət olsa da sətir səliqəli qalır).
// Siyahı body-yə çıxır (portal): cədvəlin içində kəsilməsin. Altda "Pəncərədə aç" → ustanın pəncərəsi.
function HoldMenu({ items, tone, word, onOpen }: { items: { name: string; qty: string }[]; tone: Tone; word: string; onOpen: () => void }) {
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

// Ustalar cədvəlinin sətri: şəkil + ad + say xülasəsi, üzərindəki alətlər və materiallar (açılan siyahı), vəziyyət
function PersonRow({ emp, holds, toolInfo, onOpen }: {
  emp: DepotEmployee; holds: Holding[]; toolInfo: Map<number, Tool>; onOpen: (kind: Kind) => void;
}) {
  const tools = holds.filter((h) => toolInfo.get(h.tool_id)?.kind !== "material");
  const mats = holds.filter((h) => toolInfo.get(h.tool_id)?.kind === "material");
  const toolsN = tools.reduce((n, h) => n + h.quantity, 0);
  const waiting = holds.filter((h) => !h.received_at && !h.disputed_at).length;
  const st: { tone: Tone; label: string } = holds.some((h) => h.disputed_at && !h.received_at) ? { tone: "red", label: "«Almadım» deyib" }
    : waiting ? { tone: "amber", label: `${waiting} «Aldım» gözləyir` } : holds.length ? { tone: "green", label: "Qaydasındadır" } : { tone: "slate", label: "Heç nə yoxdur" };
  const item = (h: Holding) => {
    const t = toolInfo.get(h.tool_id);
    return { name: t?.name ?? "—", qty: t?.kind === "material" ? `${fmt(h.quantity)} ${t.unit}` : h.quantity > 1 ? `×${h.quantity}` : "" };
  };
  const first: Kind = !tools.length && mats.length ? "material" : "tool";
  return (
    <tr tabIndex={0} onClick={() => onOpen(first)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && e.target === e.currentTarget && onOpen(first)}
      className="group cursor-pointer border-t border-line transition-colors hover:bg-[#faf8ff] focus-visible:outline-2 focus-visible:outline-primary">
      <td className="py-3 pl-5 pr-3 max-sm:pl-3 max-sm:pr-1">
        <span className="flex items-center gap-3 max-sm:gap-2.5">
          <span className="relative shrink-0">
            <Avatar employee={emp} className="!h-10 !w-10 !text-xs ring-2 ring-[#ede9fe] max-sm:!h-9 max-sm:!w-9" />
            {holds.length > 0 && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#8b5cf6] ring-2 ring-surface" />}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[14.5px] font-semibold group-hover:text-[#6d28d9] max-sm:text-[13px]">{emp.full_name}</span>
            <span className="muted block truncate text-xs max-sm:text-[11px]">{toolsN ? `${toolsN} ədəd alət` : "alət yoxdur"} · {mats.length ? `${mats.length} növ material` : "material yoxdur"}</span>
          </span>
        </span>
      </td>
      <td className="px-3 py-3 max-sm:hidden"><HoldMenu items={tools.map(item)} tone="blue" word="alət" onOpen={() => onOpen("tool")} /></td>
      <td className="px-3 py-3 max-sm:hidden"><HoldMenu items={mats.map(item)} tone="teal" word="material" onOpen={() => onOpen("material")} /></td>
      <td className="px-3 py-3 max-md:hidden"><StatusDot tone={st.tone} label={st.label} /></td>
      <td className="py-3 pl-3 pr-5 text-right max-sm:pr-3">
        <span className="inline-grid h-8 w-8 place-items-center rounded-full bg-bg text-muted transition group-hover:bg-[#7c3aed] group-hover:text-white"><ArrowRight size={15} /></span>
      </td>
    </tr>
  );
}

// Material sətri (alətdən fərqli sütunlar): ad + ölçü çipi ("metr", "1 balon = 11,3 kq"), depoda (tam; qablıda balon sayı),
// parçalar / açıq balonlar, ustalarda, doluluq zolağı (depoda / ustalarda; minimum qalıq xətti), vəziyyət, "Ver"
function MaterialRow({ t, losses, canManage, onOpen, onGive }: { t: Tool; losses: Loss[]; canManage: boolean; onOpen: () => void; onGive: () => void }) {
  const n = inStock(t);
  const low = n > 0 && isLowStock(t);
  const out = n === 0 && t.given_out === 0;
  const st: { tone: Tone; label: string } = out ? { tone: "red", label: losses.length ? REASONS[losses[0].reason ?? "other"] ?? "Silinib" : "Qalmayıb" }
    : n === 0 ? { tone: "blue", label: "Hamısı ustada" } : low ? { tone: "amber", label: "Azalıb" } : { tone: "green", label: "Depoda var" };
  const packed = isPacked(t);
  const measure = packed ? `1 ${t.pack_name} = ${fmt(t.pack_size)} ${t.unit}` : t.unit;
  const full = packed ? Math.floor(round2(t.available / t.pack_size)) : null;
  const total = n + t.given_out;
  const pct = (v: number) => `${total ? (v / total) * 100 : 0}%`;
  return (
    <tr tabIndex={0} onClick={onOpen} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && e.target === e.currentTarget && onOpen()}
      className="group cursor-pointer border-t border-line transition-colors hover:bg-[#f5fbfa] focus-visible:outline-2 focus-visible:outline-primary">
      <td className="py-3 pl-5 pr-3">
        <span className="flex items-center gap-3">
          <IconTile icon={Package} tone="teal" size={36} />
          <span className="min-w-0">
            <span className="block truncate text-[14.5px] font-semibold group-hover:text-[#0f766e]">{t.name}</span>
            <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
              <span className="rounded-md bg-[#e7f8f5] px-1.5 py-px text-[11px] font-semibold text-[#0f766e]">{measure}</span>
              {losses.length > 0 && <span className="truncate text-xs font-medium text-[#dc2626]">{lossText(losses, t.unit)}</span>}
            </span>
          </span>
        </span>
      </td>
      <td className="px-3 py-3 text-right tabular-nums">
        <b className={`text-[16px] ${t.available > 0 ? "" : "text-muted"}`}>{fmt(t.available)}</b> <span className="text-xs text-muted">{t.unit}</span>
        {full !== null && full > 0 && <span className="muted block text-[11px]">{full} {t.pack_name}</span>}
      </td>
      <td className="px-3 py-3 text-right tabular-nums max-lg:hidden">
        {t.pieces_count > 0
          ? <><b>{fmt(t.pieces_total)}</b> <span className="text-xs text-muted">{t.unit}</span><span className="muted block text-[11px]">{t.pieces_count} {pieceWord(t)}</span></>
          : <span className="text-muted">—</span>}
      </td>
      <td className="px-3 py-3 text-right tabular-nums">
        {t.given_out > 0 ? <><b>{fmt(t.given_out)}</b> <span className="text-xs text-muted">{t.unit}</span></> : <span className="text-muted">—</span>}
      </td>
      <td className="px-3 py-3 max-xl:hidden">
        <span className="relative flex h-2 w-full overflow-hidden rounded-full bg-line" title={`depoda ${fmt(n)} · ustalarda ${fmt(t.given_out)} ${t.unit}`}>
          <span className="h-full bg-[#14b8a6]" style={{ width: pct(n) }} />
          <span className="h-full bg-[#3b82f6]" style={{ width: pct(t.given_out) }} />
        </span>
        <span className="muted mt-1 block text-[11px]">{t.min_stock != null ? `min. ${fmt(t.min_stock)} ${t.unit}` : "minimum yoxdur"}</span>
      </td>
      <td className="px-3 py-3 max-md:hidden"><StatusDot tone={st.tone} label={st.label} /></td>
      <td className="py-3 pl-3 pr-5 text-right">
        {canManage && t.available > 0 && (
          <button type="button" onClick={(e) => { e.stopPropagation(); onGive(); }} className="btn btn-sm !h-8 !px-4 bg-[#0d9488] text-white hover:bg-[#0f766e]">Ver</button>
        )}
      </td>
    </tr>
  );
}

// Cədvəl sətri: ad (ikon), depoda, ustalarda, vəziyyət, "Ver". Sətrə basanda alətin pəncərəsi açılır.
function ToolRow({ t, losses, canManage, onOpen, onGive }: { t: Tool; losses: Loss[]; canManage: boolean; onOpen: () => void; onGive: () => void }) {
  const material = t.kind === "material";
  const n = inStock(t);
  const low = n > 0 && isLowStock(t);
  // 0 olanda: hamısı ustadadırsa bu normaldır, heç yerdə yoxdursa qırmızı
  const out = n === 0 && t.given_out + t.in_repair === 0;
  // Hamısı silinibsə vəziyyət son silinmənin səbəbidir (məs. "Xarab olub")
  const st: { tone: Tone; label: string } = out ? { tone: "red", label: losses.length ? REASONS[losses[0].reason ?? "other"] ?? "Silinib" : "Qalmayıb" }
    : n === 0 ? { tone: "blue", label: "Hamısı ustada" } : low ? { tone: "amber", label: "Azalıb" } : { tone: "green", label: "Depoda var" };
  const Icon = material ? Package : Wrench;
  const u = unitOf(t);
  return (
    <tr tabIndex={0} onClick={onOpen} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && e.target === e.currentTarget && onOpen()}
      className="group cursor-pointer border-t border-line transition-colors hover:bg-[#f7f9fd] focus-visible:outline-2 focus-visible:outline-primary">
      <td className="py-2.5 pl-5 pr-3">
        <span className="flex items-center gap-3">
          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${material ? SOFT.teal : SOFT.blue}`}><Icon size={15} /></span>
          <span className="min-w-0">
            <span className="block truncate text-[14.5px] font-semibold group-hover:text-primary">{t.name}</span>
            {losses.length > 0 && <span className="block truncate text-xs font-medium text-[#dc2626]">{lossText(losses, unitOf(t))}</span>}
          </span>
        </span>
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums">
        <b className={`text-[15px] ${n > 0 ? "" : "text-muted"}`}>{fmt(n)}</b> <span className="text-xs text-muted">{u}</span>
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums">
        {t.given_out > 0 ? <><b className="text-[15px]">{fmt(t.given_out)}</b> <span className="text-xs text-muted">{u}</span></> : <span className="text-muted">—</span>}
      </td>
      <td className="px-3 py-2.5 max-md:hidden"><StatusDot tone={st.tone} label={st.label} /></td>
      <td className="py-2.5 pl-3 pr-5 text-right">
        {canManage && t.available > 0 && (
          <button type="button" onClick={(e) => { e.stopPropagation(); onGive(); }} className="btn btn-primary btn-sm !h-8 !px-4">Ver</button>
        )}
      </td>
    </tr>
  );
}

// Ümumi baxış kafeli: rəngli ikon, başlıq, iri rəqəm, kiçik göstəricilər, (alətdə) paylanma zolağı; basanda siyahı açılır
function HubTile({ icon, tone, title, big, unit, rows, bar, onClick }: {
  icon: typeof Wrench; tone: Tone; title: string; big: number; unit: string;
  rows: { label: string; value: string; dot: string }[]; bar?: { n: number; c: string }[]; onClick: () => void;
}) {
  const total = (bar ?? []).reduce((s, p) => s + p.n, 0);
  return (
    <button type="button" onClick={onClick}
      className="group flex flex-col rounded-3xl border border-line bg-surface p-5 text-left transition hover:-translate-y-0.5 hover:border-transparent hover:shadow-[0_18px_40px_-16px_rgba(16,24,40,0.28)]">
      <span className="flex items-center gap-3">
        <IconTile icon={icon} tone={tone} />
        <span className="flex-1 text-[17px] font-bold">{title}</span>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-bg text-muted transition group-hover:bg-primary group-hover:text-white"><ArrowRight size={17} /></span>
      </span>
      <span className="mt-5 text-[40px] font-extrabold leading-none tracking-tight tabular-nums">
        {fmt(big)}<span className="ml-2 text-base font-semibold tracking-normal text-muted">{unit}</span>
      </span>
      {bar && (
        <span className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-line">
          {total > 0 && bar.filter((p) => p.n > 0).map((p, i) => <span key={i} className={`h-full ${p.c}`} style={{ width: `${(p.n / total) * 100}%` }} />)}
        </span>
      )}
      <span className="mt-4 grid gap-1.5">
        {rows.map((r) => (
          <span key={r.label} className="flex items-center gap-2 text-[13px]">
            <span className={`h-2 w-2 shrink-0 rounded-full ${r.dot}`} />
            <span className="flex-1 text-muted">{r.label}</span>
            <b className="tabular-nums">{r.value}</b>
          </span>
        ))}
      </span>
    </button>
  );
}

// Diqqət: dörd sətir həmişə görünür (yanındakı "Son hərəkətlər" ilə eyni hündürlükdə, simmetrik); 0 olanlar sakit, yaşıl ✓ ilə
function AttentionCard({ items }: { items: { icon: typeof Wrench; tone: Tone; label: string; hint: string; n: number; onClick: () => void }[] }) {
  const clear = items.every((i) => i.n === 0);
  return (
    <section className="flex h-full flex-col rounded-3xl border border-line bg-surface p-5">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="flex-1 text-[15px] font-bold">Diqqət</h2>
        {clear && <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#ecfbf1] px-3 text-xs font-semibold text-[#15803d]"><CheckCircle2 size={13} /> Hər şey qaydasındadır</span>}
      </div>
      <ul className="grid flex-1 content-between gap-2">
        {items.map((i) => {
          const on = i.n > 0;
          return (
            <li key={i.label}>
              <button type="button" onClick={i.onClick} disabled={!on}
                className={`flex w-full items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left transition ${on ? "border-line hover:bg-bg" : "cursor-default border-transparent bg-bg/60"}`}>
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${on ? SOFT[i.tone] : SOFT.green}`}>
                  {on ? <i.icon size={17} /> : <CheckCircle2 size={17} />}
                </span>
                <span className="min-w-0 flex-1">
                  <b className={`block text-sm ${on ? "" : "font-semibold text-ink/60"}`}>{i.label}</b>
                  <span className="muted block truncate text-xs">{on ? i.hint : "yoxdur"}</span>
                </span>
                <span className={`text-xl font-extrabold tabular-nums ${on ? "" : "text-muted/60"}`}>{i.n}</span>
                <ArrowRight size={16} className={on ? "text-muted" : "invisible"} />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const TAB_ICON = { tool: Wrench, material: Package, people: Users } as const;

export function DepotBoard({ tab, onTab, tools: allTools, holdings, pieces, employees, requests, repairs, losses = [], canManage, openToolId, onOpenTool, onReceipt, onShopping, onJournal }: {
  tab: DepotView;
  onTab: (t: DepotView) => void;
  tools: Tool[];
  holdings: Holding[];
  pieces: Piece[];
  employees: DepotEmployee[];
  requests: DepotRequest[];
  repairs: Repair[];
  losses?: Loss[];
  canManage: boolean;
  openToolId: number | null;
  onOpenTool: (id: number | null) => void;
  onReceipt: (t: Tool | null) => void;
  onShopping: () => void;
  onJournal: () => void;
}) {
  const [query, setQuery] = useState(urlQuery);
  const [person, setPerson] = useState<{ id: number; kind: Kind } | null>(null);
  const [quickId, setQuickId] = useState<number | null>(null);

  const toolInfo = useMemo(() => new Map(allTools.map((t) => [t.id, t])), [allTools]);
  const byTool = useMemo(() => {
    const m: Record<number, Holding[]> = {};
    for (const h of holdings) (m[h.tool_id] ??= []).push(h);
    return m;
  }, [holdings]);
  const byEmployee = useMemo(() => {
    const m: Record<number, Holding[]> = {};
    for (const h of holdings) (m[h.employee_id] ??= []).push(h);
    return m;
  }, [holdings]);
  const masters = employees.filter((e) => !e.is_management);
  const words = norm(query).split(/\s+/).filter(Boolean);
  const match = (s: string) => words.every((w) => norm(s).includes(w));

  const kind: Kind = tab === "material" ? "material" : "tool";
  const shown = tab === "people" || tab === "home" ? [] : allTools.filter((t) => t.kind === tab && match(`${t.name} ${t.inventory_code ?? ""}`));
  const people = tab === "people" ? masters.filter((e) => match(e.full_name)) : [];
  const counts: Record<DepotTab, number> = {
    tool: allTools.filter((t) => t.kind === "tool").length,
    material: allTools.filter((t) => t.kind === "material").length,
    people: masters.length,
  };

  // Ümumi baxış: alətlər ədədlə (depoda / ustalarda / təmirdə), materiallar növlə, ustalar
  const toolsOnly = allTools.filter((t) => t.kind === "tool");
  const mats = allTools.filter((t) => t.kind === "material");
  const sum = (list: Tool[], f: (t: Tool) => number) => list.reduce((n, t) => n + f(t), 0);
  const tDepot = sum(toolsOnly, (t) => t.available), tGiven = sum(toolsOnly, (t) => t.given_out), tRepair = sum(toolsOnly, (t) => t.in_repair);
  const holdersCount = new Set(holdings.map((h) => h.employee_id)).size;
  const lowN = allTools.filter((t) => inStock(t) > 0 && isLowStock(t)).length;
  const outN = allTools.filter((t) => inStock(t) === 0 && t.given_out + t.in_repair === 0).length;
  const unconfirmedN = holdings.filter((h) => !h.received_at && !h.disputed_at).length;
  const staleN = holdings.filter((h) => daysSince(h.taken_at) >= STALE_DAYS).length;

  const open = allTools.find((t) => t.id === openToolId) ?? null;
  const quick = allTools.find((t) => t.id === quickId) ?? null;
  const openPerson = person ? employees.find((e) => e.id === person.id) ?? null : null;

  return (
    <div className="space-y-4">
      {quick && quick.available > 0 && <QuickGiveModal tool={quick} employees={employees} onClose={() => setQuickId(null)} />}
      {open && (
        <ToolModal tool={open} holders={byTool[open.id] ?? []} pieces={pieces.filter((p) => p.tool_id === open.id)}
          repairs={repairs.filter((r) => r.tool_id === open.id)} losses={losses.filter((l) => l.tool_id === open.id)} requests={requests} employees={employees} canManage={canManage}
          onReceipt={() => onReceipt(open)} onClose={() => onOpenTool(null)} />
      )}
      {openPerson && person && (
        <PersonModal emp={openPerson} kind={person.kind} holds={byEmployee[openPerson.id] ?? []}
          toolInfo={toolInfo} tools={allTools} requests={requests} canManage={canManage} onClose={() => setPerson(null)} />
      )}

      {tab === "home" ? (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <HubTile icon={Wrench} tone="blue" title="Alətlər" big={tDepot + tGiven + tRepair} unit="ədəd" onClick={() => onTab("tool")}
              bar={[{ n: tDepot, c: "bg-[#22c55e]" }, { n: tGiven, c: "bg-[#3b82f6]" }, { n: tRepair, c: "bg-[#f59e0b]" }]}
              rows={[
                { label: "Depoda", value: fmt(tDepot), dot: "bg-[#22c55e]" },
                { label: "Ustalarda", value: fmt(tGiven), dot: "bg-[#3b82f6]" },
                { label: "Təmirdə", value: fmt(tRepair), dot: "bg-[#f59e0b]" },
              ]} />
            <HubTile icon={Package} tone="teal" title="Materiallar" big={mats.length} unit="növ" onClick={() => onTab("material")}
              rows={[
                { label: "Depoda var", value: String(mats.filter((t) => inStock(t) > 0).length), dot: "bg-[#22c55e]" },
                { label: "Ustalarda var", value: String(mats.filter((t) => t.given_out > 0).length), dot: "bg-[#3b82f6]" },
                { label: "Qalmayıb", value: String(mats.filter((t) => inStock(t) === 0).length), dot: "bg-[#ef4444]" },
              ]} />
            <HubTile icon={Users} tone="violet" title="Ustalar" big={masters.length} unit="usta" onClick={() => onTab("people")}
              rows={[
                { label: "Üzərində alət/material olan", value: String(holdersCount), dot: "bg-[#8b5cf6]" },
                { label: "«Aldım» gözləyir", value: String(unconfirmedN), dot: "bg-[#f59e0b]" },
                { label: `${STALE_DAYS}+ gündür ustada`, value: String(staleN), dot: "bg-[#94a3b8]" },
              ]} />
          </div>
          <div className="grid items-stretch gap-4 lg:grid-cols-2">
            <AttentionCard items={[
              { icon: AlertTriangle, tone: "amber", label: "Azalıb", hint: "minimum qalığa çatıb: alınmalıdır", n: lowN, onClick: onShopping },
              { icon: Warehouse, tone: "red", label: "Qalmayıb", hint: "heç yerdə yoxdur", n: outN, onClick: () => onTab(outN && mats.some((t) => inStock(t) === 0 && t.given_out === 0) ? "material" : "tool") },
              { icon: Hourglass, tone: "blue", label: "«Aldım» gözləyir", hint: "usta hələ təsdiqləməyib", n: unconfirmedN, onClick: () => onTab("people") },
              { icon: Clock, tone: "slate", label: `${STALE_DAYS}+ gündür ustada`, hint: "uzun müddət qaytarılmayan", n: staleN, onClick: () => onTab("people") },
            ]} />
            <RecentMovements onOpenAll={onJournal} limit={5} />
          </div>
        </>
      ) : (
      <>
      <div className="rounded-3xl border border-line bg-surface">
        <div className="flex flex-wrap items-center gap-3.5 p-4 max-sm:gap-x-2 max-sm:gap-y-3 max-sm:p-3 sm:p-5">
          <button type="button" onClick={() => onTab("home")} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line text-ink/70 transition-colors hover:bg-bg hover:text-ink max-sm:h-8 max-sm:w-8" title="Ümumi baxış" aria-label="Ümumi baxış">
            <ArrowLeft size={18} />
          </button>
          <span className="contents max-sm:[&>span]:!h-8 max-sm:[&>span]:!w-8 max-sm:[&>span]:!rounded-xl"><IconTile icon={TAB_ICON[tab]} tone={tab === "tool" ? "blue" : tab === "material" ? "teal" : "violet"} /></span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold leading-tight">{tab === "tool" ? "Alətlər" : tab === "material" ? "Materiallar" : "Ustalar"}</h2>
            <p className="muted truncate text-[13px] max-sm:text-[11px]">
              {tab === "tool" ? (<><span className="whitespace-nowrap">{counts.tool} növ · depoda {fmt(tDepot)}</span><span> · </span><span className="whitespace-nowrap">ustalarda {fmt(tGiven)}{tRepair ? ` · təmirdə ${tRepair}` : ""}</span></>)
                : tab === "material" ? `${counts.material} növ · depoda var ${mats.filter((t) => inStock(t) > 0).length}`
                : `${masters.length} usta · ${holdersCount} nəfərin üzərində əşya var`}
            </p>
          </div>
          <label className="relative w-full sm:w-72">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={tab === "people" ? "Usta axtar..." : "Ad ilə axtar..."} aria-label="Axtar"
              className="field !h-10 !rounded-xl !pl-10 !text-sm" />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink" aria-label="Təmizlə"><X size={15} /></button>
            )}
          </label>
        </div>
        <div className="flex gap-1 border-t border-line px-3 max-sm:px-1 sm:px-4" role="tablist" aria-label="Depo">
          {(["tool", "material", "people"] as const).map((v) => {
            const Icon = TAB_ICON[v];
            return (
              <button key={v} type="button" role="tab" aria-selected={tab === v} onClick={() => onTab(v)}
                className={`-mb-px inline-flex h-12 items-center gap-2 border-b-2 px-3 text-sm font-semibold transition-colors max-sm:min-w-0 max-sm:flex-1 max-sm:justify-center max-sm:gap-1 max-sm:px-1 max-sm:text-[12.5px] ${tab === v ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"}`}>
                <Icon size={16} className="max-sm:hidden" /> {v === "tool" ? "Alətlər" : v === "material" ? "Materiallar" : "Ustalar"}
                <span className={`rounded-full px-1.5 text-[11px] font-bold ${tab === v ? "bg-primary-soft text-primary" : "bg-bg text-muted"}`}>{counts[v]}</span>
              </button>
            );
          })}
        </div>
        {/* Cədvəl (istifadəçi seçimi: "Cədvəl (pro)"): başlıq kartının içində, sütun başlıqları sürüşmədə yapışıq */}
        {tab === "people" ? (
          people.length === 0 ? <p className="muted border-t border-line py-10 text-center text-sm">Heç kim tapılmadı.</p> : (
            <table className="w-full border-t border-line text-sm">
              <thead className="sticky top-[var(--header-h)] z-10 bg-[#f8fafc] text-left text-xs font-semibold text-muted">
                <tr>
                  <th className="py-3 pl-5 pr-3 max-sm:pl-3">Usta</th>
                  <th className="w-44 px-3 py-3 max-sm:hidden">Alətlər</th>
                  <th className="w-44 px-3 py-3 max-sm:hidden">Materiallar</th>
                  <th className="w-44 px-3 py-3 max-md:hidden">Vəziyyət</th>
                  <th className="w-12 py-3 pl-3 pr-5 max-sm:pr-3" />
                </tr>
              </thead>
              <tbody>
                {people.map((e) => (
                  <PersonRow key={e.id} emp={e} holds={byEmployee[e.id] ?? []} toolInfo={toolInfo} onOpen={(k) => setPerson({ id: e.id, kind: k })} />
                ))}
              </tbody>
            </table>
          )
        ) : counts[kind] === 0 ? (
          <div className="border-t border-line py-14 text-center">
            <span className="mx-auto block w-fit"><IconTile icon={Warehouse} tone="slate" /></span>
            <p className="mt-3 font-semibold">Hələ {kind === "material" ? "material" : "alət"} yoxdur</p>
            {canManage && (
              <button type="button" onClick={() => onReceipt(null)} className="btn btn-primary mx-auto mt-4"><PackagePlus size={16} /> Mədaxil</button>
            )}
          </div>
        ) : shown.length === 0 ? (
          <p className="muted border-t border-line py-10 text-center text-sm">Heç nə tapılmadı.</p>
        ) : (
          <table className="w-full border-t border-line text-sm">
            <thead className="sticky top-[var(--header-h)] z-10 bg-[#f8fafc] text-left text-xs font-semibold text-muted">
              {kind === "material" ? (
                <tr>
                  <th className="py-3 pl-5 pr-3">Material</th>
                  <th className="w-32 px-3 py-3 text-right">Depoda (tam)</th>
                  <th className="w-32 px-3 py-3 text-right max-lg:hidden">Parça / açıq</th>
                  <th className="w-28 px-3 py-3 text-right">Ustalarda</th>
                  <th className="w-40 px-3 py-3 max-xl:hidden">Doluluq</th>
                  <th className="w-36 px-3 py-3 max-md:hidden">Vəziyyət</th>
                  <th className="w-24 py-3 pl-3 pr-5" />
                </tr>
              ) : (
                <tr>
                  <th className="py-3 pl-5 pr-3">Ad</th>
                  <th className="w-32 px-3 py-3 text-right">Depoda</th>
                  <th className="w-32 px-3 py-3 text-right">Ustalarda</th>
                  <th className="w-40 px-3 py-3 max-md:hidden">Vəziyyət</th>
                  <th className="w-24 py-3 pl-3 pr-5" />
                </tr>
              )}
            </thead>
            <tbody>
              {shown.map((t) => kind === "material"
                ? <MaterialRow key={t.id} t={t} losses={losses.filter((l) => l.tool_id === t.id)} canManage={canManage} onOpen={() => onOpenTool(t.id)} onGive={() => setQuickId(t.id)} />
                : <ToolRow key={t.id} t={t} losses={losses.filter((l) => l.tool_id === t.id)} canManage={canManage} onOpen={() => onOpenTool(t.id)} onGive={() => setQuickId(t.id)} />)}
            </tbody>
          </table>
        )}
      </div>
      </>
      )}
    </div>
  );
}
