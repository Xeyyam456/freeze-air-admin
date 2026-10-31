import { useMemo, useState } from "react";
import { History, Search } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import { useData } from "@/lib/useData";
import { DHead } from "../DHead";
import type { Movement, HistoryModalProps } from "@/types/depot";
import { norm } from "@/shared/utils/norm";
import { dayOf, timeOf, dayLabel, KINDS, FILTERS, amount } from "../../utils/journal";
import { fetchJournal } from "@/services/depot/fetchJournal";
import { Input } from "@/shared/components/Input";

// Depo jurnalı: hər say dəyişikliyi (mədaxil, vermə, qaytarma, sərf, silinmə, sayım, təmir), kim edib, kim təsdiqləyib.
// toolId verilsə yalnız həmin alətin hərəkətləri.
export function HistoryModal({ kind, toolId, toolName, onClose }: HistoryModalProps) {
  const rows = useData("depot-journal", () => fetchJournal(kind, toolId), [kind, toolId]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>("all");
  const q = norm(query.trim());

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

      <div className="space-y-3 px-6 pt-4 max-sm:space-y-2 max-sm:px-3 max-sm:pt-3">
        <label className="relative block">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} autoFocus placeholder="Usta, ad və ya kim yazıb..." className="!pl-10 max-sm:!text-[13px] max-sm:placeholder:text-[12px]" aria-label="Jurnalda axtar" />
        </label>
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Hərəkət növü">
          {FILTERS.map(([v, label]) => (
            <button key={v} type="button" role="tab" aria-selected={filter === v} onClick={() => setFilter(v)}
              className={`h-8 max-sm:h-6 rounded-full px-3 max-sm:px-2.5 text-xs max-sm:text-[11px] font-semibold transition-colors ${filter === v ? "bg-navy text-white" : "bg-bg text-muted hover:text-ink"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="nice-scroll mx-2 mb-2 mt-3 h-[min(540px,58dvh)] overflow-y-auto px-4 pb-2 max-sm:mx-0 max-sm:mt-2 max-sm:px-3">
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
                    <li key={m.id} className="flex items-start gap-3 rounded-xl px-2 py-2.5 max-sm:gap-2 max-sm:px-1 max-sm:py-2">
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl max-sm:h-6 max-sm:w-6 max-sm:rounded-lg max-sm:[&_svg]:!h-3 max-sm:[&_svg]:!w-3 ${k.tone}`}><Icon size={16} /></span>
                      <span className="min-w-0 flex-1 text-sm max-sm:text-xs">
                        <span className="font-semibold">{m.tool_name}</span> <span className="font-bold tabular-nums">{amount(m)}</span>
                        <span className="mt-0.5 block text-[13px] max-sm:text-[11px]">
                          {who ? <><b className="font-semibold">{who}</b> {k.verb}</> : k.label}
                          {m.note && <span className="muted"> · {m.note}</span>}
                        </span>
                        {/* Kim yazıb / kim təsdiqləyib (köhnə qeydlərdə yoxdur) */}
                        {(m.actor_name || m.approved_name) && (
                          <span className="muted block text-[11px] max-sm:text-[10px]">
                            {m.actor_name && `yazdı: ${m.actor_name}`}
                            {m.approved_name && ` · təsdiqlədi: ${m.approved_name}`}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 text-sm max-sm:text-xs font-semibold tabular-nums">{timeOf(m.at)}</span>
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
