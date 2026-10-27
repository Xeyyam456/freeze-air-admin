import { useMemo, useState } from "react";
import { Building2, CalendarDays, ChevronDown, ClipboardList, Download, MapPin, Play, Search, SlidersHorizontal, Users } from "lucide-react";
import { DatePicker, formatDateAz } from "@/components/DatePicker";
import { Avatar } from "@/components/employees/EmployeeForms";
import { Page } from "@/components/Page";
import { EmployeeSelect } from "@/components/employees/EmployeeSelect";
import { ModelDropdown } from "@/components/errors/ModelDropdown";
import { WithSidePanel } from "@/components/SidePanel";
import { timeOf, WorkLogModal } from "@/components/work/WorkLogModal";
import { toast } from "@/lib/toast";
import { createClient } from "@/lib/supabase/client";
import { fetchGroupMap, jobKey, mergeGroupLogs, type FileCount } from "@/lib/jobs";
import { FileBadges } from "@/components/work/FileBadges";
import { useData } from "@/lib/useData";

const WEEKDAYS = ["Bazar", "Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə", "Cümə axşamı", "Cümə", "Şənbə"];
const LIMIT = 2000;

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const norm = (s: string | null | undefined) =>
  (s ?? "").toLowerCase().replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g");

// Hazır aralıqlar
function range(kind: "month" | "prev" | "week") {
  const now = new Date();
  if (kind === "week") {
    const from = new Date(now);
    from.setDate(from.getDate() - 6);
    return { from: iso(from), to: iso(now) };
  }
  if (kind === "prev") {
    return { from: iso(new Date(now.getFullYear(), now.getMonth() - 1, 1)), to: iso(new Date(now.getFullYear(), now.getMonth(), 0)) };
  }
  return { from: iso(new Date(now.getFullYear(), now.getMonth(), 1)), to: iso(now) };
}

async function fetchLogs(from: string, to: string) {
  const { data } = await createClient()
    .from("work_logs")
    .select("id, work_date, created_at, description, place_text, employee_id, company_id, employees(full_name, photo_url), stores(name, code, company_id, companies(name)), companies(name), work_files(kind)")
    .gte("work_date", from).lte("work_date", to)
    .order("work_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(LIMIT);
  return data ?? [];
}

async function fetchFilters() {
  const supabase = createClient();
  const [employees, companies] = await Promise.all([
    supabase.from("employees").select("id, full_name, photo_url, specialty").eq("is_management", false).order("full_name").then((r) => r.data ?? []),
    supabase.from("companies").select("id, name, kind").order("name").then((r) => r.data ?? []),
  ]);
  return { employees, companies };
}

type Log = Awaited<ReturnType<typeof fetchLogs>>[number];

function placeOf(l: Log) {
  if (l.stores) return `${l.stores.companies?.name ?? ""} · ${l.stores.name}`;
  if (l.companies) return l.companies.name;
  return l.place_text ?? "—";
}
const companyOf = (l: Log) => l.stores?.company_id ?? l.company_id ?? null;

// Rəngli, formatlı .xlsx: başlıq zolağı, xülasə sətri, donmuş başlıq, zebra, bölgülər, uzun mətn sarılır
type ExportInfo = { from: string; to: string; employee: string; company: string; query: string };

async function exportXlsx(logs: Log[], info: ExportInfo) {
  const { default: writeXlsxFile } = await import("write-excel-file/browser");
  const NAVY = "#0b1324", BLUE = "#0a7ea4", LINE = "#d9dfeb", ZEBRA = "#f4f7fc", MUTED = "#667085";
  const cols = 5;
  const span = (value: string, style: Record<string, unknown>) => [{ value, columnSpan: cols, ...style }, ...Array(cols - 1).fill(null)];
  const days = new Set(logs.map((l) => l.work_date)).size;
  const masters = new Set(logs.map((l) => l.employee_id)).size;
  const places = new Set(logs.map(placeOf)).size;
  const filters = [`Tarix: ${formatDateAz(info.from)} – ${formatDateAz(info.to)}`, `Usta: ${info.employee}`, `Yer: ${info.company}`, info.query ? `Axtarış: "${info.query}"` : null].filter(Boolean).join("   ·   ");

  const border = { borderColor: LINE, borderStyle: "thin" as const };
  const head = (value: string, align: "left" | "center" = "left") => ({ value, fontWeight: "bold" as const, textColor: "#ffffff", backgroundColor: BLUE, align, alignVertical: "center" as const, height: 24, ...border });

  const data = [
    span("Freeze Air Service — Görülən işlər", { fontWeight: "bold", fontSize: 16, textColor: "#ffffff", backgroundColor: NAVY, alignVertical: "center", height: 34, indent: 1 }),
    span(filters, { fontSize: 10, textColor: MUTED, alignVertical: "center", height: 20, indent: 1 }),
    span(`İş sayı: ${logs.length}     İş görülən gün: ${days}     Usta: ${masters}     Fərqli yer: ${places}`, { fontWeight: "bold", textColor: BLUE, backgroundColor: "#e3f3f8", alignVertical: "center", height: 26, indent: 1 }),
    Array(cols).fill(null),
    [head("Tarix", "center"), head("Saat", "center"), head("Usta"), head("İş yeri"), head("Görülən iş")],
    ...logs.map((l, i) => {
      const bg = i % 2 ? { backgroundColor: ZEBRA } : {};
      const [y, m, d] = l.work_date.split("-").map(Number);
      const base = { alignVertical: "top" as const, ...bg, ...border };
      return [
        { ...base, value: new Date(Date.UTC(y, m - 1, d)), type: Date, format: "dd.mm.yyyy", align: "center" as const },
        { ...base, value: timeOf(l.created_at), align: "center" as const, textColor: MUTED },
        { ...base, value: l.employees?.full_name ?? "—", fontWeight: "bold" as const },
        { ...base, value: placeOf(l), textColor: BLUE, wrap: true },
        { ...base, value: l.description ?? "", wrap: true },
      ];
    }),
    [{ value: "Cəmi", columnSpan: 4, fontWeight: "bold" as const, align: "right" as const, backgroundColor: "#e3f3f8", ...border }, null, null, null, { value: `${logs.length} iş`, fontWeight: "bold" as const, textColor: BLUE, backgroundColor: "#e3f3f8", ...border }],
  ];

  await writeXlsxFile(data, {
    sheet: "Görülən işlər",
    columns: [{ width: 13 }, { width: 8 }, { width: 26 }, { width: 38 }, { width: 70 }],
    stickyRowsCount: 5,
    showGridLines: false,
    orientation: "landscape",
  }, { fontFamily: "Calibri", fontSize: 11 }).toFile(`isler-${info.from}_${info.to}.xlsx`);
  toast.success(`${logs.length} iş Excel fayla yazıldı`);
}

function Summary({ label, value, icon: Icon }: { label: string; value: number | string; icon: typeof Users }) {
  return (
    <div className="card min-w-0 !p-4 max-sm:!px-3 max-sm:!py-2.5">
      <p className="flex items-center gap-2 whitespace-nowrap text-xs font-semibold text-muted"><Icon size={14} className="shrink-0" /> <span className="truncate">{label}</span></p>
      <p className="mt-2 text-2xl font-extrabold leading-none max-sm:mt-1 max-sm:text-xl">{value}</p>
    </div>
  );
}

export default function WorkLogsPage() {
  const [{ from, to }, setRange] = useState(range("month"));
  const [employeeId, setEmployeeId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [query, setQuery] = useState("");
  const [openLog, setOpenLog] = useState<number | null>(null);

  const filters = useData("worklog-filters", fetchFilters);
  const logs = useData("worklogs", () => fetchLogs(from, to), [from, to]);
  const groupMap = useData("group-map-range", () => fetchGroupMap(from, to), [from, to]);

  // Qrup işi bir sətir (adlar birləşir); ustaların sayı isə hamısından
  const filtered = useMemo(() => {
    const q = norm(query.trim());
    return (logs ?? []).filter((l) =>
      (!employeeId || l.employee_id === Number(employeeId)) &&
      (!companyId || companyOf(l) === Number(companyId)) &&
      (!q || [l.employees?.full_name, placeOf(l), l.description].some((v) => norm(v).includes(q))));
  }, [logs, employeeId, companyId, query]);
  const list = useMemo(() => mergeGroupLogs(filtered, groupMap), [filtered, groupMap]);

  // Faylların sayı işə görə: qrup işində fayl istənilən üzvün qeydinə yüklənə bilər, ona görə qrup üzrə toplanır
  const filesByJob = useMemo(() => {
    const m = new Map<string, FileCount>();
    for (const l of logs ?? []) {
      const k = jobKey(l.id, groupMap);
      const c = m.get(k) ?? { act: 0, photo: 0, video: 0 };
      for (const f of l.work_files) if (f.kind === "act" || f.kind === "photo" || f.kind === "video") c[f.kind] += 1;
      m.set(k, c);
    }
    return m;
  }, [logs, groupMap]);
  const filesOf = (l: Log) => filesByJob.get(jobKey(l.id, groupMap));

  // Gün → tək işlər sətir kimi, qrup işləri (Tapşırıqlardakı kimi) eyni üzvlü qrupa görə bir açılan sətirdə
  type Entry = { type: "solo"; log: Log } | { type: "crew"; key: string; names: string; logs: Log[] };
  const groups = useMemo(() => {
    const out: { day: string; count: number; entries: Entry[] }[] = [];
    for (const l of list) {
      let day = out.at(-1);
      if (day?.day !== l.work_date) { day = { day: l.work_date, count: 0, entries: [] }; out.push(day); }
      day.count += 1;
      if (!groupMap?.has(l.id)) { day.entries.push({ type: "solo", log: l }); continue; }
      const names = l.employees?.full_name ?? "—";
      const key = `${l.work_date}|${names.split(" + ").sort().join("|")}`;
      const crew = day.entries.find((e) => e.type === "crew" && e.key === key);
      if (crew && crew.type === "crew") crew.logs.push(l);
      else day.entries.push({ type: "crew", key, names, logs: [l] });
    }
    return out;
  }, [list, groupMap]);
  const [openCrews, setOpenCrews] = useState<Set<string>>(new Set()); // qrup sətirləri bağlı başlayır
  const toggleCrew = (key: string) => setOpenCrews((v) => { const n = new Set(v); if (!n.delete(key)) n.add(key); return n; });

  const stats = useMemo(() => ({
    days: new Set(list.map((l) => l.work_date)).size,
    masters: new Set(filtered.map((l) => l.employee_id)).size,
    places: new Set(list.map(placeOf)).size,
  }), [list, filtered]);

  const panel = (
    <div className="card space-y-4">
      <div className="flex items-center gap-3">
        <span className="icon-tile !h-9 !w-9"><Search size={18} /></span>
        <h2 className="card-title">Filtrlər</h2>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-semibold text-muted">Tarix aralığı</p>
        <div className="grid grid-cols-2 gap-2">
          <DatePicker value={from} onChange={(v) => v && setRange((r) => ({ from: v, to: v > r.to ? v : r.to }))} small placeholder="Başlanğıc" />
          <DatePicker value={to} onChange={(v) => v && setRange((r) => ({ from: v < r.from ? v : r.from, to: v }))} small placeholder="Son" />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {([["month", "Bu ay"], ["prev", "Keçən ay"], ["week", "Son 7 gün"]] as const).map(([k, label]) => (
            <button key={k} type="button" onClick={() => setRange(range(k))} className="btn btn-soft btn-sm">{label}</button>
          ))}
        </div>
      </div>

      <div>
        <span className="mb-1.5 block text-xs font-semibold text-muted">Usta</span>
        <EmployeeSelect value={employeeId ? Number(employeeId) : null} onChange={(id) => setEmployeeId(id ? String(id) : "")}
          employees={filters?.employees ?? []} emptyLabel="Hamısı" placeholder="Hamısı" />
      </div>

      <div>
        <span className="mb-1.5 block text-xs font-semibold text-muted">Şirkət / market</span>
        <ModelDropdown value={companyId} onChange={setCompanyId} all icon={Building2} placeholder="Hamısı"
          options={[{ value: "", label: "Hamısı" }, ...(filters?.companies ?? []).map((c) => ({ value: String(c.id), label: c.name, hint: c.kind === "market" ? "market" : "şirkət" }))]} />
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-muted">Axtarış</span>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Usta, yer və ya görülən iş..." className="field" />
      </label>

      <button type="button" disabled={list.length === 0} onClick={() => exportXlsx(list, {
          from, to, query: query.trim(),
          employee: filters?.employees.find((e) => String(e.id) === employeeId)?.full_name ?? "hamısı",
          company: filters?.companies.find((c) => String(c.id) === companyId)?.name ?? "hamısı",
        })} className="btn btn-primary w-full">
        <Download size={16} /> Excel-ə ixrac ({list.length})
      </button>
      {logs && logs.length >= LIMIT && <p className="text-xs text-danger">Aralıqda {LIMIT}-dən çox iş var: yalnız ən yenilər göstərilir. Aralığı daralt.</p>}
    </div>
  );

  return (
    <Page title="Görülən işlər" subtitle="Tarix, usta və yerə görə süz, Excel-ə yaz">
      {openLog && <WorkLogModal logId={openLog} onClose={() => setOpenLog(null)} />}
      <WithSidePanel stack fabLabel="Süzgəc və Excel" fabIcon={SlidersHorizontal} panel={panel}>
        <div className="flex h-full flex-col gap-4">
          <div className="grid shrink-0 grid-cols-4 gap-4 max-sm:grid-cols-2 max-sm:gap-2.5">
            <Summary label="İş sayı" value={logs ? list.length : "…"} icon={ClipboardList} />
            <Summary label="İş günü" value={logs ? stats.days : "…"} icon={CalendarDays} />
            <Summary label="Usta" value={logs ? stats.masters : "…"} icon={Users} />
            <Summary label="Fərqli yer" value={logs ? stats.places : "…"} icon={MapPin} />
          </div>

          <div className="card min-h-0 flex-1 overflow-y-auto !p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {logs === null ? (
              <p className="muted py-12 text-center text-sm">Yüklənir...</p>
            ) : groups.length === 0 ? (
              <p className="muted py-12 text-center text-sm">Bu süzgəcə uyğun iş qeydi yoxdur.</p>
            ) : (
              groups.map((g) => (
                <section key={g.day}>
                  <h3 className="sticky top-0 z-[1] flex items-center justify-between border-b border-line bg-[#f8f9fc] px-5 py-2.5 text-xs font-bold text-muted">
                    <span>{formatDateAz(g.day)}, {WEEKDAYS[new Date(`${g.day}T00:00`).getDay()]}</span>
                    <span className="rounded-full bg-surface px-2 py-0.5">{g.count} iş</span>
                  </h3>
                  <ul>
                    {g.entries.map((en) => {
                      if (en.type === "solo") {
                        const l = en.log;
                        return (
                          <li key={l.id} className="border-b border-line last:border-b-0">
                            <button type="button" onClick={() => setOpenLog(l.id)}
                              className="flex w-full items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-primary-soft/40 max-sm:gap-2 max-sm:px-3 max-sm:py-2">
                              <Avatar employee={{ full_name: l.employees?.full_name ?? "?", photo_url: l.employees?.photo_url ?? null }} className="!h-9 !w-9 shrink-0 !text-xs max-sm:!h-7 max-sm:!w-7 max-sm:!text-[9px]" />
                              <span className="min-w-0 flex-1">
                                <span className="flex flex-wrap items-center gap-x-2 text-sm">
                                  <span className="font-semibold">{l.employees?.full_name ?? "—"}</span>
                                  <span className="flex min-w-0 items-center gap-1 truncate text-xs font-semibold text-primary"><MapPin size={12} /> {placeOf(l)}</span>
                                </span>
                                <span className="muted mt-0.5 line-clamp-1 block text-sm max-sm:line-clamp-3 max-sm:text-xs">{l.description}</span>
                              </span>
                              <FileBadges files={filesOf(l)} />
                              <span className="shrink-0 text-sm font-semibold tabular-nums">{timeOf(l.created_at)}</span>
                            </button>
                          </li>
                        );
                      }
                      const open = openCrews.has(en.key);
                      return (
                        <li key={en.key} className="border-b border-line last:border-b-0">
                          <button type="button" onClick={() => toggleCrew(en.key)} aria-expanded={open}
                            className={`flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-primary-soft/40 max-sm:gap-2 max-sm:px-3 max-sm:py-2 ${open ? "bg-primary-soft/30" : ""}`}>
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-soft text-primary max-sm:h-7 max-sm:w-7"><Users size={16} className="max-sm:!h-3.5 max-sm:!w-3.5" /></span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold max-sm:text-[13px] max-sm:leading-tight sm:truncate">{en.names.split(" + ").map((n, i, all) => <span key={n} className="max-sm:block">{n}{i < all.length - 1 && <span className="max-sm:hidden"> + </span>}</span>)}</span>
                              <span className="muted flex items-center gap-1.5 text-xs">Qrup işi · {en.logs.length} iş
                                {/* Bağlı qrupda da videolu iş görünsün */}
                                {en.logs.some((l) => (filesOf(l)?.video ?? 0) > 0) && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-1.5 py-px text-[10px] font-bold text-violet-700"><Play size={9} fill="currentColor" /> Video</span>
                                )}
                              </span>
                            </span>
                            <ChevronDown size={18} className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
                          </button>
                          {open && (
                            <ul className="border-t border-line bg-[#fbfcfe]">
                              {en.logs.map((l) => (
                                <li key={l.id} className="border-b border-line last:border-b-0">
                                  <button type="button" onClick={() => setOpenLog(l.id)}
                                    className="flex w-full items-start gap-3 py-3 pl-[76px] pr-5 text-left transition-colors hover:bg-primary-soft/40 max-sm:flex-wrap max-sm:gap-x-2 max-sm:gap-y-1 max-sm:px-3 max-sm:py-2">
                                    <span className="min-w-0 flex-1 max-sm:contents">
                                      <span className="flex min-w-0 items-center gap-1 truncate text-sm font-semibold text-primary max-sm:min-w-0 max-sm:flex-1 max-sm:text-[13px]"><MapPin size={13} className="shrink-0" /> <span className="truncate">{placeOf(l)}</span></span>
                                      <span className="muted mt-0.5 line-clamp-1 block text-sm max-sm:order-last max-sm:mt-0 max-sm:line-clamp-5 max-sm:basis-full max-sm:text-xs max-sm:leading-snug">{l.description}</span>
                                    </span>
                                    <FileBadges files={filesOf(l)} />
                                    <span className="shrink-0 text-sm font-semibold tabular-nums max-sm:text-xs">{timeOf(l.created_at)}</span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))
            )}
          </div>
        </div>
      </WithSidePanel>
    </Page>
  );
}
