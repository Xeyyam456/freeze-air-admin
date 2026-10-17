import { useMemo, useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, History, Search, X } from "lucide-react";
import { formatDateAz } from "@/components/DatePicker";
import { Avatar } from "@/components/employees/EmployeeForms";
import { Modal } from "@/components/Modal";
import { createClient } from "@/lib/supabase/client";
import { useData } from "@/lib/useData";

type Kind = "tool" | "material";

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

// Təhvil sətirləri: götürmə (taken_at) və qaytarma (returned_at) ayrı hadisə kimi göstərilir.
// Hissə-hissə qaytarma bağlı sətir kimi qalır, material təhvilində işlənən ayrıca yazılır.
async function fetchHistory(kind: Kind) {
  const { data } = await createClient()
    .from("tool_assignments")
    .select("id, quantity, used, taken_at, returned_at, tools!inner(name, kind, unit, pack_name, pack_size), employees(full_name, photo_url)")
    .eq("tools.kind", kind)
    .order("taken_at", { ascending: false })
    .limit(400);
  return data ?? [];
}

type Row = Awaited<ReturnType<typeof fetchHistory>>[number];
type Event = { key: string; at: string; type: "take" | "return"; row: Row };

function amount(row: Row, n: number) {
  const t = row.tools;
  if (!t) return String(n);
  if (t.kind === "material") {
    const packs = t.pack_size && t.pack_name && n > 0 && n % t.pack_size === 0 ? ` (${n / t.pack_size} ${t.pack_name})` : "";
    return `${n} ${t.unit}${packs}`;
  }
  return n > 1 ? `×${n}` : "";
}

// Depo tarixçəsi: kim nə vaxt hansı aləti/materialı götürüb və qaytarıb (son 400 təhvil); günlərə görə qruplu, axtarışlı
export function HistoryModal({ kind, onClose }: { kind: Kind; onClose: () => void }) {
  const rows = useData(() => fetchHistory(kind), [kind]);
  const [query, setQuery] = useState("");
  const q = norm(query.trim());
  const word = kind === "material" ? "material" : "alət";

  const groups = useMemo(() => {
    const events: Event[] = [];
    for (const r of rows ?? []) {
      events.push({ key: `t${r.id}`, at: r.taken_at, type: "take", row: r });
      if (r.returned_at) events.push({ key: `r${r.id}`, at: r.returned_at, type: "return", row: r });
    }
    events.sort((a, b) => b.at.localeCompare(a.at));
    const list = events.filter((e) => !q || [e.row.employees?.full_name, e.row.tools?.name].some((v) => norm(v).includes(q)));
    const out: { day: string; items: Event[] }[] = [];
    for (const e of list) {
      const day = dayOf(e.at);
      const last = out.at(-1);
      if (last?.day === day) last.items.push(e);
      else out.push({ day, items: [e] });
    }
    return { out, count: list.length };
  }, [rows, q]);

  return (
    <Modal onClose={onClose} labelledBy="depot-history-title" className="flex !max-w-2xl flex-col !p-0">
      <div className="flex items-center justify-between gap-3 border-b border-line px-6 py-4">
        <div>
          <h2 id="depot-history-title" className="flex items-center gap-2 text-lg font-bold"><History size={18} className="text-primary" /> Depo tarixçəsi: {kind === "material" ? "materiallar" : "alətlər"}</h2>
          <p className="muted text-xs">{rows ? `${groups.count} hadisə${q ? " tapıldı" : ""}` : "Yüklənir..."}</p>
        </div>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>

      <div className="px-6 pt-4">
        <label className="relative block">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} autoFocus placeholder={`Usta və ya ${word} adı...`} className="field !pl-10" aria-label="Tarixçədə axtar" />
        </label>
      </div>

      <div className="nice-scroll mx-2 mb-2 mt-3 h-[min(560px,62dvh)] overflow-y-auto px-4 pb-2">
        {rows === null ? (
          <p className="muted py-10 text-center text-sm">Yüklənir...</p>
        ) : groups.out.length === 0 ? (
          <p className="muted py-10 text-center text-sm">{q ? "Heç nə tapılmadı." : "Hələ təhvil yoxdur."}</p>
        ) : (
          groups.out.map((g) => (
            <section key={g.day} className="mb-4">
              <h3 className="sticky top-0 z-10 flex items-center justify-between bg-surface/95 py-2 text-xs font-bold text-muted backdrop-blur">
                {dayLabel(g.day)} <span className="rounded-full bg-bg px-2 py-0.5">{g.items.length}</span>
              </h3>
              <ul className="space-y-1">
                {g.items.map((e) => {
                  const r = e.row;
                  const take = e.type === "take";
                  const used = r.used ?? 0;
                  return (
                    <li key={e.key} className="flex items-start gap-3 rounded-xl px-2 py-2.5">
                      <Avatar employee={{ full_name: r.employees?.full_name ?? "?", photo_url: r.employees?.photo_url ?? null }} className="!h-9 !w-9 shrink-0 !text-xs" />
                      <span className="min-w-0 flex-1 text-sm">
                        <span className="font-semibold">{r.employees?.full_name ?? "—"}</span>{" "}
                        <span className={`inline-flex items-center gap-1 text-xs font-bold ${take ? "text-primary" : "text-ok"}`}>
                          {take ? <ArrowUpFromLine size={12} /> : <ArrowDownToLine size={12} />} {take ? "götürdü" : "qaytardı"}
                        </span>
                        <span className="mt-0.5 block">
                          {r.tools?.name} {amount(r, r.quantity)}
                          {!take && kind === "material" && used > 0 && (
                            <span className="muted"> · işlədi {used} {r.tools?.unit}{r.quantity - used > 0 ? `, qalan ${r.quantity - used} ${r.tools?.unit} depoya` : ""}</span>
                          )}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-semibold tabular-nums">{timeOf(e.at)}</span>
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
