import { useMemo, useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, ClipboardCheck, Flame, History, PackagePlus, Search, Trash2, Wrench, type LucideIcon } from "lucide-react";
import { formatDateAz } from "@/components/DatePicker";
import { Modal } from "@/components/Modal";
import type { Tables } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";
import { useData } from "@/lib/useData";
import { DHead } from "./DepotUi";

type Kind = "tool" | "material";
type Movement = Tables<"stock_movements"> & { employees: { full_name: string } | null };

const norm = (s: string | null | undefined) =>
  (s ?? "").toLowerCase().replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g");

// Yerli tarix "YYYY-MM-DD"; offset gün qədər geri
function localDate(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
const dayOf = (iso: string) => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};
const timeOf = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
const dayLabel = (day: string) => (day === localDate() ? "Bu gün" : day === localDate(-1) ? "Dünən" : formatDateAz(day));

// Hərəkət növləri: jurnalda ikon, rəng və fel
const KINDS: Record<string, { label: string; verb: string; icon: LucideIcon; tone: string }> = {
  receipt: { label: "Mədaxil", verb: "depoya gəldi", icon: PackagePlus, tone: "text-ok bg-ok-soft" },
  give: { label: "Verildi", verb: "götürdü", icon: ArrowUpFromLine, tone: "text-primary bg-primary-soft" },
  return: { label: "Qaytarıldı", verb: "qaytardı", icon: ArrowDownToLine, tone: "text-ok bg-ok-soft" },
  used: { label: "Sərf", verb: "işlətdi", icon: Flame, tone: "text-[#b45309] bg-[#fff4e0]" },
  writeoff: { label: "Silindi", verb: "silindi", icon: Trash2, tone: "text-danger bg-danger-soft" },
  count: { label: "Sayım", verb: "sayımla düzəldi", icon: ClipboardCheck, tone: "text-[#6d28d9] bg-[#f1ebff]" },
  repair_out: { label: "Təmirə", verb: "təmirə getdi", icon: Wrench, tone: "text-[#b45309] bg-[#fff4e0]" },
  repair_in: { label: "Təmirdən", verb: "təmirdən qayıtdı", icon: Wrench, tone: "text-ok bg-ok-soft" },
};
const FILTERS = [
  ["all", "Hamısı"], ["receipt", "Mədaxil"], ["give", "Verilən"], ["return", "Qaytarılan"], ["used", "Sərf"], ["writeoff", "Silinən"], ["count", "Sayım"], ["repair", "Təmir"],
] as const;

async function fetchJournal(kind: Kind, toolId?: number) {
  let q = createClient()
    .from("stock_movements")
    .select("*, employees(full_name)")
    .eq("tool_kind", kind)
    .order("at", { ascending: false })
    .limit(600);
  if (toolId) q = q.eq("tool_id", toolId);
  const { data } = await q;
  return (data ?? []) as Movement[];
}

function amount(m: Movement) {
  const n = String(Math.round(Math.abs(m.quantity) * 100) / 100).replace(".", ",");
  const sign = m.kind === "count" ? (m.quantity > 0 ? "+" : "−") : "";
  return m.tool_kind === "material" || m.kind === "count" ? `${sign}${n} ${m.unit}` : Math.abs(m.quantity) > 1 ? `×${n}` : "";
}

// Son hərəkətlər (Depo səhifəsinin sağ sütunu): hər iki növ, son 12; Realtime ilə yenilənir (revalidate)
export function RecentMovements({ onOpenAll, limit = 12 }: { onOpenAll: () => void; limit?: number }) {
  const rows = useData(async () => {
    const { data } = await createClient().from("stock_movements").select("*, employees(full_name)").order("at", { ascending: false }).limit(limit);
    return (data ?? []) as Movement[];
  }, [limit]);
  // Zaman xətti: solda rəngli ikonlar şaquli xətlə bağlanır; ad + miqdar çipi, növ nişanı və kim, sağda vaxt
  return (
    <section className="flex h-full flex-col rounded-3xl border border-line bg-surface p-5">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="flex-1 text-[15px] font-bold">Son hərəkətlər</h2>
        <button type="button" onClick={onOpenAll}
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-bg px-3 text-xs font-semibold text-ink/80 transition-colors hover:bg-primary hover:text-white">
          <History size={13} /> Bütün jurnal
        </button>
      </div>
      {rows === null ? (
        <ul className="space-y-3">{Array.from({ length: Math.min(limit, 5) }, (_, i) => <li key={i} className="h-11 animate-pulse rounded-xl bg-line/50" />)}</ul>
      ) : rows.length === 0 ? (
        <p className="muted rounded-2xl border border-dashed border-line py-6 text-center text-sm">Hələ hərəkət yoxdur.</p>
      ) : (
        <ol className="relative">
          <span aria-hidden className="absolute bottom-5 left-[17px] top-5 w-px bg-line" />
          {rows.map((m) => {
            const k = KINDS[m.kind] ?? KINDS.give;
            const Icon = k.icon;
            const qty = amount(m);
            return (
              <li key={m.id} className="relative flex items-center gap-3 rounded-xl py-2 pr-1 transition-colors hover:bg-bg">
                <span className={`relative z-[1] grid h-9 w-9 shrink-0 place-items-center rounded-full ring-4 ring-surface ${k.tone}`}><Icon size={15} /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <b className="truncate text-[13.5px] font-semibold">{m.tool_name}</b>
                    {qty && <span className="shrink-0 rounded-md bg-bg px-1.5 py-px text-[11px] font-bold tabular-nums text-ink/80">{qty}</span>}
                  </span>
                  <span className="flex min-w-0 items-center gap-1.5 text-[11.5px]">
                    <span className={`shrink-0 rounded-full px-1.5 py-px text-[10px] font-bold ${k.tone}`}>{k.label}</span>
                    <span className="muted truncate">{m.employees?.full_name ?? m.actor_name ?? ""}</span>
                  </span>
                </span>
                <span className="shrink-0 text-right text-[11px] tabular-nums leading-tight">
                  <b className="block font-semibold text-ink/80">{timeOf(m.at)}</b>
                  <span className="muted">{dayOf(m.at) === localDate() ? "bu gün" : dayLabel(dayOf(m.at))}</span>
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

// Depo jurnalı: hər say dəyişikliyi (mədaxil, vermə, qaytarma, sərf, silinmə, sayım, təmir), kim edib, kim təsdiqləyib.
// toolId verilsə yalnız həmin alətin hərəkətləri.
export function HistoryModal({ kind, toolId, toolName, onClose }: { kind: Kind; toolId?: number; toolName?: string; onClose: () => void }) {
  const rows = useData(() => fetchJournal(kind, toolId), [kind, toolId]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>("all");
  const q = norm(query.trim());
  const word = kind === "material" ? "material" : "alət";

  const groups = useMemo(() => {
    const list = (rows ?? []).filter((m) =>
      (filter === "all" || m.kind === filter || (filter === "repair" && m.kind.startsWith("repair")))
      && (!q || [m.employees?.full_name, m.tool_name, m.actor_name, m.approved_name, m.note].some((v) => norm(v).includes(q))));
    const out: { day: string; items: Movement[] }[] = [];
    for (const m of list) {
      const day = dayOf(m.at);
      const last = out.at(-1);
      if (last?.day === day) last.items.push(m);
      else out.push({ day, items: [m] });
    }
    return { out, count: list.length };
  }, [rows, q, filter]);

  return (
    <Modal onClose={onClose} labelledBy="depot-history-title" className="flex !max-w-2xl flex-col !p-0">
      <DHead flush id="depot-history-title" icon={History} tone="slate" onClose={onClose}
        title={toolName ? `Hərəkətlər: ${toolName}` : `Depo jurnalı: ${kind === "material" ? "materiallar" : "alətlər"}`}
        sub={rows ? `${groups.count} hərəkət${q || filter !== "all" ? " tapıldı" : ""}` : "Yüklənir..."} />

      <div className="space-y-3 px-6 pt-4">
        <label className="relative block">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} autoFocus placeholder={`Usta, ${word} adı və ya kim yazıb...`} className="field !pl-10" aria-label="Jurnalda axtar" />
        </label>
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Hərəkət növü">
          {FILTERS.map(([v, label]) => (
            <button key={v} type="button" role="tab" aria-selected={filter === v} onClick={() => setFilter(v)}
              className={`h-8 rounded-full px-3 text-xs font-semibold transition-colors ${filter === v ? "bg-navy text-white" : "bg-bg text-muted hover:text-ink"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="nice-scroll mx-2 mb-2 mt-3 h-[min(540px,58dvh)] overflow-y-auto px-4 pb-2">
        {rows === null ? (
          <p className="muted py-10 text-center text-sm">Yüklənir...</p>
        ) : groups.out.length === 0 ? (
          <p className="muted py-10 text-center text-sm">{q || filter !== "all" ? "Heç nə tapılmadı." : "Hələ hərəkət yoxdur."}</p>
        ) : (
          groups.out.map((g) => (
            <section key={g.day} className="mb-4">
              <h3 className="sticky top-0 z-10 flex items-center justify-between bg-surface/95 py-2 text-xs font-bold text-muted backdrop-blur">
                {dayLabel(g.day)} <span className="rounded-full bg-bg px-2 py-0.5">{g.items.length}</span>
              </h3>
              <ul className="space-y-1">
                {g.items.map((m) => {
                  const k = KINDS[m.kind] ?? KINDS.give;
                  const Icon = k.icon;
                  const who = m.employees?.full_name;
                  return (
                    <li key={m.id} className="flex items-start gap-3 rounded-xl px-2 py-2.5">
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${k.tone}`}><Icon size={16} /></span>
                      <span className="min-w-0 flex-1 text-sm">
                        <span className="font-semibold">{m.tool_name}</span> <span className="font-bold tabular-nums">{amount(m)}</span>
                        <span className="mt-0.5 block text-[13px]">
                          {who ? <><b className="font-semibold">{who}</b> {k.verb}</> : k.label}
                          {m.note && <span className="muted"> · {m.note}</span>}
                        </span>
                        {/* Kim yazıb / kim təsdiqləyib (köhnə qeydlərdə yoxdur) */}
                        {(m.actor_name || m.approved_name) && (
                          <span className="muted block text-[11px]">
                            {m.actor_name && `yazdı: ${m.actor_name}`}
                            {m.approved_name && ` · təsdiqlədi: ${m.approved_name}`}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 text-sm font-semibold tabular-nums">{timeOf(m.at)}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>
    </Modal>
  );
}
