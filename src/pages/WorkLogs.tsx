import { useMemo, useState } from "react";
import { CalendarDays, ClipboardList, Download, MapPin, Search, Users } from "lucide-react";
import { DatePicker, formatDateAz } from "@/components/DatePicker";
import { Avatar } from "@/components/employees/EmployeeForms";
import { Page } from "@/components/Page";
import { WithSidePanel } from "@/components/SidePanel";
import { timeOf, WorkLogModal } from "@/components/work/WorkLogModal";
import { toast } from "@/lib/toast";
import { createClient } from "@/lib/supabase/client";
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
    .select("id, work_date, created_at, description, place_text, employee_id, company_id, employees(full_name, photo_url), stores(name, code, company_id, companies(name)), companies(name)")
    .gte("work_date", from).lte("work_date", to)
    .order("work_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(LIMIT);
  return data ?? [];
}

async function fetchFilters() {
  const supabase = createClient();
  const [employees, companies] = await Promise.all([
    supabase.from("employees").select("id, full_name").eq("is_management", false).order("full_name").then((r) => r.data ?? []),
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

// Excel açır: UTF-8 BOM + nöqtəli vergül (Azərbaycan/Rusiya yerli ayarlarında Excel ayırıcı kimi bunu gözləyir)
function exportCsv(logs: Log[], from: string, to: string) {
  const esc = (v: string) => `"${v.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
  const rows = [["Tarix", "Saat", "Usta", "İş yeri", "Görülən iş"].map(esc).join(";")];
  for (const l of logs) {
    rows.push([formatDateAz(l.work_date), timeOf(l.created_at), l.employees?.full_name ?? "", placeOf(l), l.description ?? ""].map(esc).join(";"));
  }
  const blob = new Blob(["﻿" + rows.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `isler-${from}_${to}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`${logs.length} iş fayla yazıldı`);
}

function Summary({ label, value, icon: Icon }: { label: string; value: number | string; icon: typeof Users }) {
  return (
    <div className="card !p-4">
      <p className="flex items-center gap-2 text-xs font-semibold text-muted"><Icon size={14} /> {label}</p>
      <p className="mt-2 text-2xl font-extrabold leading-none">{value}</p>
    </div>
  );
}

export default function WorkLogsPage() {
  const [{ from, to }, setRange] = useState(range("month"));
  const [employeeId, setEmployeeId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [query, setQuery] = useState("");
  const [openLog, setOpenLog] = useState<number | null>(null);

  const filters = useData(fetchFilters);
  const logs = useData(() => fetchLogs(from, to), [from, to]);

  const list = useMemo(() => {
    const q = norm(query.trim());
    return (logs ?? []).filter((l) =>
      (!employeeId || l.employee_id === Number(employeeId)) &&
      (!companyId || companyOf(l) === Number(companyId)) &&
      (!q || [l.employees?.full_name, placeOf(l), l.description].some((v) => norm(v).includes(q))));
  }, [logs, employeeId, companyId, query]);

  const groups = useMemo(() => {
    const out: { day: string; items: Log[] }[] = [];
    for (const l of list) {
      const last = out.at(-1);
      if (last?.day === l.work_date) last.items.push(l);
      else out.push({ day: l.work_date, items: [l] });
    }
    return out;
  }, [list]);

  const stats = useMemo(() => ({
    days: new Set(list.map((l) => l.work_date)).size,
    masters: new Set(list.map((l) => l.employee_id)).size,
    places: new Set(list.map(placeOf)).size,
  }), [list]);

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

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-muted">Usta</span>
        <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="field cursor-pointer">
          <option value="">Hamısı</option>
          {(filters?.employees ?? []).map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
        </select>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-muted">Şirkət / market</span>
        <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="field cursor-pointer">
          <option value="">Hamısı</option>
          {(filters?.companies ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-muted">Axtarış</span>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Usta, yer və ya görülən iş..." className="field" />
      </label>

      <button type="button" disabled={list.length === 0} onClick={() => exportCsv(list, from, to)} className="btn btn-primary w-full">
        <Download size={16} /> Excel-ə ixrac ({list.length})
      </button>
      {logs && logs.length >= LIMIT && <p className="text-xs text-danger">Aralıqda {LIMIT}-dən çox iş var: yalnız ən yenilər göstərilir. Aralığı daralt.</p>}
    </div>
  );

  return (
    <Page title="Görülən işlər" subtitle="Tarix, usta və yerə görə süz, Excel-ə yaz">
      {openLog && <WorkLogModal logId={openLog} onClose={() => setOpenLog(null)} />}
      <WithSidePanel stack panel={panel}>
        <div className="flex h-full flex-col gap-4">
          <div className="grid shrink-0 grid-cols-4 gap-4">
            <Summary label="İş sayı" value={logs ? list.length : "…"} icon={ClipboardList} />
            <Summary label="İş görülən gün" value={logs ? stats.days : "…"} icon={CalendarDays} />
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
                    <span className="rounded-full bg-surface px-2 py-0.5">{g.items.length} iş</span>
                  </h3>
                  <ul>
                    {g.items.map((l) => (
                      <li key={l.id} className="border-b border-line last:border-b-0">
                        <button type="button" onClick={() => setOpenLog(l.id)}
                          className="flex w-full items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-primary-soft/40">
                          <Avatar employee={{ full_name: l.employees?.full_name ?? "?", photo_url: l.employees?.photo_url ?? null }} className="!h-9 !w-9 shrink-0 !text-xs" />
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-x-2 text-sm">
                              <span className="font-semibold">{l.employees?.full_name ?? "—"}</span>
                              <span className="flex min-w-0 items-center gap-1 truncate text-xs font-semibold text-primary"><MapPin size={12} /> {placeOf(l)}</span>
                            </span>
                            <span className="muted mt-0.5 line-clamp-1 block text-sm">{l.description}</span>
                          </span>
                          <span className="shrink-0 text-sm font-semibold tabular-nums">{timeOf(l.created_at)}</span>
                        </button>
                      </li>
                    ))}
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
