import { useState } from "react";
import { ClipboardList, MapPin, Search, X } from "lucide-react";
import { formatDateAz } from "@/components/DatePicker";
import { Avatar } from "@/components/employees/EmployeeForms";
import { Modal } from "@/components/Modal";
import { createClient } from "@/lib/supabase/client";
import { fetchFileCounts, fetchGroupMap, mergeGroupLogs } from "@/lib/jobs";
import { FileBadges } from "./FileBadges";
import { useData } from "@/lib/useData";
import { timeOf, WorkLogModal } from "./WorkLogModal";

// Yerli tarix "YYYY-MM-DD"; offset gün qədər geri
function localDate(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const norm = (s: string | null | undefined) =>
  (s ?? "").toLowerCase().replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g");

async function fetchLogs() {
  const { data } = await createClient()
    .from("work_logs")
    .select("id, work_date, created_at, description, place_text, employees(full_name, photo_url), stores(name, companies(name)), companies(name)")
    .order("work_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(300);
  return data ?? [];
}

type Log = Awaited<ReturnType<typeof fetchLogs>>[number];

function placeOf(l: Log) {
  if (l.stores) return `${l.stores.companies?.name ?? ""} · ${l.stores.name}`;
  if (l.companies) return l.companies.name;
  return l.place_text ?? "—";
}

// Bütün iş qeydləri: günlərə görə qruplu, axtarışlı; klik → ətraflı pəncərə
// initialQuery: məs. usta adı ilə süzülmüş açmaq
export function AllLogsModal({ onClose, initialQuery = "" }: { onClose: () => void; initialQuery?: string }) {
  const logs = useData("all-logs", fetchLogs);
  // Qrup xəritəsi yalnız yüklənmiş işlərin dövrü üçün (əvvəl bütün tarixçə yüklənirdi)
  const oldest = logs?.at(-1)?.work_date ?? null;
  const groupMap = useData("group-map-all", () => (oldest ? fetchGroupMap(oldest) : Promise.resolve(new Map<number, string>())), [oldest]);
  const logIds = (logs ?? []).map((l) => l.id);
  const files = useData("file-counts-all", () => fetchFileCounts(logIds), [logIds.join()]); // ▶ Video / şəkil / akt (qrup üzrə)
  const [query, setQuery] = useState(initialQuery);
  const [openLog, setOpenLog] = useState<number | null>(null);

  const q = norm(query.trim());
  const list = mergeGroupLogs(logs ?? [], groupMap).filter((l) => !q || [l.employees?.full_name, placeOf(l), l.description].some((v) => norm(v).includes(q)));
  const groups: { day: string; items: Log[] }[] = [];
  for (const l of list) {
    const last = groups.at(-1);
    if (last?.day === l.work_date) last.items.push(l);
    else groups.push({ day: l.work_date, items: [l] });
  }
  const dayLabel = (day: string) => (day === localDate() ? "Bu gün" : day === localDate(-1) ? "Dünən" : formatDateAz(day));

  return (
    <>
      <Modal onClose={onClose} labelledBy="all-logs-title" className="flex !max-w-3xl flex-col !p-0">
        <div className="flex items-center justify-between gap-3 border-b border-line px-6 py-4">
          <div>
            <h2 id="all-logs-title" className="flex items-center gap-2 text-lg font-bold"><ClipboardList size={18} className="text-primary" /> Bütün iş qeydləri</h2>
            <p className="muted text-xs">{logs ? `${list.length} iş${q ? " tapıldı" : ""}` : "Yüklənir..."}</p>
          </div>
          <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
        </div>

        <div className="px-6 pt-4">
          <label className="relative block">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} autoFocus placeholder="Usta, iş yeri və ya görülən iş..."
              className="field !pl-10" aria-label="İş qeydi axtar" />
          </label>
        </div>

        <div className="nice-scroll mx-2 mb-2 mt-3 h-[min(560px,62dvh)] overflow-y-auto px-4 pb-2">
          {logs === null ? (
            <p className="muted py-10 text-center text-sm">Yüklənir...</p>
          ) : groups.length === 0 ? (
            <p className="muted py-10 text-center text-sm">{q ? "Heç nə tapılmadı." : "Hələ iş qeydi yoxdur."}</p>
          ) : (
            groups.map((g) => (
              <section key={g.day} className="mb-4">
                <h3 className="sticky top-0 z-10 flex items-center justify-between bg-surface/95 py-2 text-xs font-bold text-muted backdrop-blur">
                  {dayLabel(g.day)} <span className="rounded-full bg-bg px-2 py-0.5">{g.items.length} iş</span>
                </h3>
                <ul className="space-y-1">
                  {g.items.map((l) => (
                    <li key={l.id}>
                      <button type="button" onClick={() => setOpenLog(l.id)}
                        className="flex w-full items-start gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-bg max-sm:items-center max-sm:gap-2 max-sm:px-1 max-sm:py-1.5">
                        <Avatar employee={{ full_name: l.employees?.full_name ?? "?", photo_url: l.employees?.photo_url ?? null }} className="!h-9 !w-9 shrink-0 !text-xs max-sm:!h-8 max-sm:!w-8 max-sm:!text-[10px]" />
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-x-2 text-sm">
                            <span className="font-semibold max-sm:flex max-sm:min-w-0 max-sm:basis-full max-sm:flex-col max-sm:text-[13px] max-sm:leading-tight">{(l.employees?.full_name ?? "—").split(" + ").map((n, i, all) => <span key={n} className="max-sm:min-w-0"><span className="block sm:hidden">{n}</span><span className="max-sm:hidden">{n}{i < all.length - 1 && " + "}</span></span>)}</span>
                            <span className="flex min-w-0 items-center gap-1 text-xs font-semibold text-primary max-sm:basis-full max-sm:text-[11px]"><MapPin size={12} className="shrink-0" /> <span className="truncate">{placeOf(l)}</span></span>
                          </span>
                          <span className="muted mt-0.5 line-clamp-1 block text-sm max-sm:hidden">{l.description}</span>
                        </span>
                        <FileBadges files={files?.get(l.id)} />
                        <span className="shrink-0 text-sm font-semibold tabular-nums max-sm:text-xs">{timeOf(l.created_at)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      </Modal>
      {openLog && <WorkLogModal logId={openLog} onClose={() => setOpenLog(null)} />}
    </>
  );
}
