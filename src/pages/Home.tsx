import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight, Building2, CalendarDays, ClipboardList, FileSpreadsheet, Globe, ListChecks, MapPin, Plus, Store,
  TriangleAlert, UserPlus, Users, Wrench,
} from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { fmt, isLowStock } from "@/components/depot/depotUtils";
import { CountUp } from "@/components/CountUp";
import { Avatar } from "@/components/employees/EmployeeForms";
import { Page } from "@/components/Page";
import { AllLogsModal } from "@/components/work/AllLogsModal";
import { MonthDashboard } from "@/components/work/MonthDashboard";
import { timeOf, WorkLogModal } from "@/components/work/WorkLogModal";
import { createClient } from "@/lib/supabase/client";
import { countJobs, fetchFileCounts, fetchGroupMap, mergeGroupLogs } from "@/lib/jobs";
import { FileBadges } from "@/components/work/FileBadges";
import { useData } from "@/lib/useData";

const MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr"];
const DAYS = ["Bazar", "Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə", "Cümə axşamı", "Cümə", "Şənbə"];

// Yerli tarix "YYYY-MM-DD" (work_date ilə müqayisə üçün)
function localDate(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// "5 dəq əvvəl", "3 saat əvvəl", "2 gün əvvəl"
function ago(iso: string) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "indicə";
  if (min < 60) return `${min} dəq əvvəl`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} saat əvvəl`;
  return `${Math.round(h / 24)} gün əvvəl`;
}

async function fetchDashboard() {
  const supabase = createClient();
  const head = { count: "exact", head: true } as const;
  const n = (r: { count: number | null }) => r.count ?? 0;
  const today = localDate();

  const [lowStock, companies, branches, markets, shops, tools, employees, logs, todayLogs, todayGroups, tasks] = await Promise.all([
    // Minimum qalıq həddi olan və həddə çatan alət/materiallar: paneldə xəbərdarlıq
    supabase.from("tool_stock").select("id, name, kind, unit, available, pieces_total, min_stock").not("min_stock", "is", null)
      .then((r) => (r.data ?? []).filter(isLowStock).sort((a, b) => a.name.localeCompare(b.name, "az"))),
    supabase.from("companies").select("*", head).eq("kind", "company").then(n),
    supabase.from("stores").select("*, companies!inner(kind)", head).eq("companies.kind", "company").then(n),
    supabase.from("companies").select("*", head).eq("kind", "market").then(n),
    supabase.from("stores").select("*, companies!inner(kind)", head).eq("companies.kind", "market").then(n),
    // Depo: ədədlərin cəmi və ustalardakı hissə
    supabase.from("tool_stock").select("quantity, given_out").eq("kind", "tool").then((r) => (r.data ?? []).reduce(
      (s, t) => ({ total: s.total + t.quantity, out: s.out + t.given_out }), { total: 0, out: 0 })),
    supabase.from("employees").select("id, full_name, photo_url, specialty, is_management, is_active").eq("is_active", true).order("full_name")
      .then((r) => r.data ?? []),
    supabase.from("work_logs")
      .select("id, work_date, created_at, description, place_text, employee_id, employees(full_name, photo_url), stores(name, code, companies(name)), companies(name)")
      .order("created_at", { ascending: false }).limit(16)
      .then((r) => r.data ?? []),
    supabase.from("work_logs").select("id, employee_id").eq("work_date", today).then((r) => r.data ?? []),
    fetchGroupMap(today, today),
    // Bugünkü tapşırıqlar (görülənlər də daxil, geri alınanlar yox; ustaya görə qruplu)
    supabase.from("tasks")
      .select("id, done, reason, place_text, group_id, employees(full_name, photo_url), stores(name, code, companies(name)), companies(name)")
      .eq("task_date", today).is("cancelled_at", null).order("employee_id").order("created_at").limit(100)
      // Qrup tapşırığı (0071) bir sətirdir: üzvlərin adları birləşir
      .then((r) => mergeGroups(r.data ?? [])),
  ]);

  // Qrup xəritəsi və fayl nişanları (▶ Video / şəkil / akt) paralel: ardıcıl gözləmə olmasın
  const [recentGroups, logFiles] = await Promise.all([
    fetchGroupMap(logs.at(-1)?.work_date),
    fetchFileCounts(logs.map((l) => l.id)),
  ]);
  const shownLogs = mergeGroupLogs(logs, recentGroups).slice(0, 4);
  const masters = employees.filter((e) => !e.is_management);
  const todayCount: Record<number, number> = {};
  for (const l of todayLogs) todayCount[l.employee_id] = (todayCount[l.employee_id] ?? 0) + 1;

  // "Ustalar bu gün" kartları: tək işləyən öz kartında; qrupla işləyənlər (eyni tapşırıq) bir qrup kartında, qrupun işi bir say
  const soloCount: Record<number, number> = {};
  const groupMembers = new Map<string, Set<number>>();
  for (const l of todayLogs) {
    const g = todayGroups.get(l.id);
    if (!g) { soloCount[l.employee_id] = (soloCount[l.employee_id] ?? 0) + 1; continue; }
    groupMembers.set(g, (groupMembers.get(g) ?? new Set<number>()).add(l.employee_id));
  }
  const crews = new Map<string, { ids: number[]; n: number }>();
  for (const set of groupMembers.values()) {
    const ids = [...set].sort((x, y) => x - y);
    const key = ids.join("-");
    const c = crews.get(key);
    if (c) c.n += 1; else crews.set(key, { ids, n: 1 });
  }
  const inCrew = new Set([...crews.values()].flatMap((c) => c.ids));
  const cards = [
    ...masters.filter((m) => !inCrew.has(m.id) || soloCount[m.id]).map((m) => ({ key: `m${m.id}`, members: [m], n: soloCount[m.id] ?? 0 })),
    ...[...crews].map(([key, c]) => ({ key: `g${key}`, members: c.ids.map((id) => employees.find((e) => e.id === id)).filter((e) => !!e), n: c.n })),
  ].sort((a, b) => b.n - a.n);

  return {
    companies, branches, markets, shops, tools, cards,
    masters, managers: employees.length - masters.length,
    logs: shownLogs, logFiles, todayTotal: countJobs(todayLogs, todayGroups), todayCount, lowStock, tasks,
  };
}

type Log = Awaited<ReturnType<typeof fetchDashboard>>["logs"][number];

// Eyni group_id-li sətirlər bir tapşırıq olur; names: üzvlərin adları
function mergeGroups<T extends { group_id: string | null; employees: { full_name: string; photo_url: string | null } | null }>(rows: T[]) {
  type Row = T & { names: string[]; people: { full_name: string; photo_url: string | null }[] };
  const out: Row[] = [];
  const byGroup = new Map<string, Row>();
  for (const t of rows) {
    const name = t.employees?.full_name ?? "—";
    const person = { full_name: name, photo_url: t.employees?.photo_url ?? null };
    const g = t.group_id ? byGroup.get(t.group_id) : undefined;
    if (g) { g.names.push(name); g.people.push(person); continue; }
    const row: Row = { ...t, names: [name], people: [person] };
    out.push(row);
    if (t.group_id) byGroup.set(t.group_id, row);
  }
  return out;
}

// İş yeri: mağaza/filial (şirkətin adı ilə) | sabit məkanlı şirkət | siyahıda olmayan yer
function placeOf(l: Log) {
  if (l.stores) return `${l.stores.companies?.name ?? ""} · ${l.stores.name}`;
  if (l.companies) return l.companies.name;
  return l.place_text ?? "—";
}

export default function Home() {
  const { name } = useAuth();
  const d = useData("dashboard", fetchDashboard);
  const [openLog, setOpenLog] = useState<number | null>(null);
  const [allLogs, setAllLogs] = useState<string | null>(null); // null = bağlı; "" = hamısı; ad = ustanın işləri
  const now = new Date();
  const firstName = name?.trim().split(/\s+/).pop();

  return (
    <Page
      title={firstName ? `Salam, ${firstName}` : "Xoş gəldin"}
      subtitle={`${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`}>
      {openLog && <WorkLogModal logId={openLog} onClose={() => setOpenLog(null)} />}
      {allLogs !== null && <AllLogsModal initialQuery={allLogs} onClose={() => setAllLogs(null)} />}

      {/* Göstəricilər */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5 sm:max-lg:grid-cols-6 sm:max-lg:[&>*]:!col-span-2 sm:max-lg:[&>*:nth-child(n+4)]:!col-span-3 lg:grid-cols-5 [&>*:last-child]:col-span-2 lg:[&>*]:!col-span-1">
        <Stat to="/sirketler" icon={Building2} label="Şirkət" value={d?.companies} sub={d && `${d.branches} filial`} tone="from-[#0a7ea4] to-[#2dd4bf]" />
        <Stat to="/magazalar" icon={Store} label="Market" value={d?.markets} sub={d && `${d.shops} mağaza`} tone="from-[#0ea5a4] to-[#2dd4bf]" />
        <Stat to="/ustalar" icon={Users} label="Usta" value={d?.masters.length} sub={d && `${d.managers} rəhbər`} tone="from-[#6d5efc] to-[#0a7ea4]" />
        <Stat to="/depo" icon={Wrench} label="Alət" value={d?.tools.total} sub={d && `${d.tools.total - d.tools.out} depoda · ${d.tools.out} ustada`} tone="from-[#f59e0b] to-[#f97316]" />
        <Stat to="/tapshiriqlar" icon={ListChecks} label="Tapşırıq" value={d?.tasks.length} sub={d && `${d.tasks.filter((t) => t.done).length} görülüb · ${d.tasks.filter((t) => !t.done).length} qalıb`} tone="from-[#10b981] to-[#2dd4bf]" />
      </div>

      {/* Depoda azalanlar: minimum qalıq həddinə çatan alət və materiallar */}
      {!!d?.lowStock.length && (
        <Link to="/depo" className="mt-5 flex items-start gap-3 rounded-2xl border border-[#f5d9a8] bg-[#fff8ec] px-5 py-4 transition-colors hover:bg-[#fff3dc]">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#fde7bf] text-[#b45309]"><TriangleAlert size={18} /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-[#92400e]">Depoda azalıb: {d.lowStock.length} {d.lowStock.length === 1 ? "mövqe" : "mövqe"}</span>
            <span className="mt-0.5 block text-sm text-[#92400e]/90">
              {d.lowStock.map((t) => `${t.name} (${fmt(t.available + t.pieces_total)} ${t.kind === "material" ? t.unit : "ədəd"} qalıb)`).join(", ")}
            </span>
          </span>
          <ArrowRight size={16} className="mt-2 shrink-0 text-[#b45309]" />
        </Link>
      )}

      <div className="mt-5">
        {/* Bu gün: iş qeydləri (son 4; hamısı pəncərədə) */}
        <section className="card flex h-[374px] flex-col max-sm:h-auto">
          <div className="flex items-center justify-between gap-3">
            <h2 className="card-title flex items-center gap-2"><ClipboardList size={18} className="text-primary" /> İş qeydləri</h2>
            <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">Bu gün: {d ? d.todayTotal : "–"}</span>
          </div>
          {!d ? (
            <p className="muted mt-6 text-sm">Yüklənir...</p>
          ) : d.logs.length === 0 ? (
            <Empty icon={ClipboardList} title="Hələ iş qeydi yoxdur" text="Ustalar usta panelindən iş əlavə edəndə burada son işlər görünəcək." />
          ) : (
            <ul className="mt-3 min-h-0 flex-1 space-y-1 overflow-hidden">
              {d.logs.map((l) => (
                <li key={l.id}>
                  {/* Klik: işin ətraflı pəncərəsi */}
                  <button type="button" onClick={() => setOpenLog(l.id)}
                    className="group flex w-full items-start gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-bg max-sm:gap-2 max-sm:px-0 max-sm:py-1.5">
                    <Avatar employee={{ full_name: l.employees?.full_name ?? "?", photo_url: l.employees?.photo_url ?? null }} className="!h-10 !w-10 shrink-0 !text-xs max-sm:!h-7 max-sm:!w-7 max-sm:!text-[9px]" />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 text-sm">
                        <span className="font-semibold max-sm:flex max-sm:min-w-0 max-sm:basis-full max-sm:flex-col max-sm:text-[12px] max-sm:leading-tight">{(l.employees?.full_name ?? "—").split(" + ").map((n, i, all) => <span key={n} className="max-sm:min-w-0"><span className="block truncate sm:hidden">{n}</span><span className="max-sm:hidden">{n}{i < all.length - 1 && " + "}</span></span>)}</span>
                        <span className="flex min-w-0 items-center gap-1 text-xs font-semibold text-primary max-sm:basis-full max-sm:text-[11px]"><MapPin size={12} className="shrink-0" /> <span className="truncate">{placeOf(l)}</span></span>
                      </span>
                      <span className="muted mt-0.5 block truncate text-sm max-sm:line-clamp-1 max-sm:text-[12px] max-sm:leading-snug">{l.description}</span>
                    </span>
                    <FileBadges files={d.logFiles.get(l.id)} />
                    <span className="shrink-0 text-right">
                      <span className="block text-sm font-semibold tabular-nums max-sm:text-xs">{timeOf(l.created_at)}</span>
                      <span className="muted block text-[11px] max-sm:hidden">{l.work_date === localDate() ? ago(l.created_at) : l.work_date.split("-").reverse().join(".")}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {!!d?.logs.length && (
            <button type="button" onClick={() => setAllLogs("")} className="link mt-auto inline-flex w-fit items-center gap-1 pt-4 text-sm font-semibold">
              Hamısına bax <ArrowRight size={14} />
            </button>
          )}
        </section>
      </div>

      {/* Ayın icmalı: iş qeydləri ilə ustalar arasında (bütün ustaların ay üzrə gördüyü işlər) */}
      <div className="mt-5">
        <MonthDashboard onUsta={(name) => setAllLogs(name)} />
      </div>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[1.7fr_1fr]">
        {/* Ustalar bu gün */}
        <section className="card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="card-title flex items-center gap-2"><CalendarDays size={18} className="text-primary" /> Ustalar bu gün</h2>
            {d && (
              <span className="muted text-xs">
                <b className="text-ok">{d.masters.filter((m) => d.todayCount[m.id]).length}</b> / {d.masters.length} usta iş yazıb
              </span>
            )}
          </div>
          {d && d.masters.length > 0 ? (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 min-[2400px]:grid-cols-3">
              {/* Ən çox iş görən yuxarıda; sağda bugünkü iş sayı nişanı (klik → işlər). Qrupla işləyənlər bir kartdadır */}
              {d.cards.map((c) => {
                const crew = c.members.length > 1;
                const m = c.members[0];
                return (
                  <li key={c.key} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5 max-lg:gap-2.5 max-lg:px-2.5 max-lg:py-1.5">
                    <span className="relative flex shrink-0 -space-x-3">
                      {c.members.slice(0, 3).map((e) => <Avatar key={e.id} employee={e} className="!h-10 !w-10 !text-xs ring-2 ring-surface max-lg:!h-8 max-lg:!w-8 max-lg:!text-[10px]" />)}
                      {!crew && <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-surface max-lg:h-3 max-lg:w-3 ${c.n ? "bg-ok" : "bg-line"}`} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold max-lg:text-[13px] max-lg:leading-tight" title={c.members.map((e) => e.full_name).join(" + ")}>{crew ? c.members.map((e) => e.full_name.split(" ").slice(-1)[0]).join(" + ") : m.full_name}</span>
                      <span className="muted block truncate text-xs max-lg:text-[11px] max-lg:leading-tight">{crew ? "Qrup işi" : m.specialty ?? "Usta"}</span>
                    </span>
                    {c.n > 0 ? (
                      <button type="button" onClick={() => setAllLogs(m.full_name)} title={`Bu gün ${c.n} iş: bax`}
                        className="flex h-8 min-w-8 shrink-0 items-center justify-center gap-1 rounded-full bg-ok px-2.5 text-sm font-bold text-white max-lg:h-7 max-lg:min-w-7 max-lg:px-2 max-lg:text-xs shadow-[0_4px_10px_rgba(18,161,80,0.3)] transition-transform hover:scale-105">
                        {c.n} <span className="text-[10px] font-semibold opacity-90">iş</span>
                      </button>
                    ) : (
                      <span className="grid h-8 min-w-8 shrink-0 place-items-center rounded-full bg-bg px-2.5 text-sm font-bold text-muted max-lg:h-7 max-lg:min-w-7 max-lg:px-2 max-lg:text-xs" title="Bu gün iş yazmayıb">0</span>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            d && <Empty icon={Users} title="Aktiv usta yoxdur" text="Ustalar bölməsindən usta əlavə edin." />
          )}
        </section>

        {/* Sürətli keçidlər */}
        <section className="card">
          <h2 className="card-title">Sürətli keçidlər</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              { to: "/sirketler", icon: Plus, label: "Yeni şirkət" },
              { to: "/ustalar", icon: UserPlus, label: "Yeni usta" },
              { to: "/magazalar", icon: FileSpreadsheet, label: "Excel-dən mağaza" },
              { to: "/sayt", icon: Globe, label: "Saytı redaktə et" },
            ].map(({ to, icon: Icon, label }) => (
              <Link key={label} to={to}
                className="group flex flex-col gap-3 rounded-xl border border-line p-3.5 transition-colors hover:border-primary hover:bg-primary-soft">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-bg text-primary transition-colors group-hover:bg-primary group-hover:text-white"><Icon size={18} /></span>
                <span className="text-sm font-semibold">{label}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </Page>
  );
}

function Stat({ to, icon: Icon, label, value, sub, tone }: {
  to: string;
  icon: typeof Users;
  label: string;
  value: number | undefined;
  sub: string | false | null | undefined;
  tone: string;
}) {
  return (
    <Link to={to} className="card card-link group relative overflow-hidden max-sm:!p-3.5 sm:max-xl:!p-3.5">
      <div className="relative flex items-center gap-4 max-sm:gap-3 sm:max-xl:gap-2.5">
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl max-sm:h-10 max-sm:w-10 max-sm:rounded-xl sm:max-xl:h-9 sm:max-xl:w-9 sm:max-xl:rounded-xl bg-gradient-to-br ${tone} text-white shadow-[0_8px_18px_rgba(10,126,164,0.22)]`}>
          <Icon size={22} />
        </span>
        <div className="min-w-0">
          <div className="stat-value leading-none max-sm:!text-2xl sm:max-xl:!text-2xl">{value == null ? "–" : <CountUp value={value} />}</div>
          <div className="muted mt-1 text-sm font-medium">{label}</div>
        </div>
        <ArrowRight size={18} className="ml-auto text-muted opacity-0 transition-opacity group-hover:opacity-100 sm:max-xl:hidden" />
      </div>
      <p className="relative mt-4 truncate border-t border-line pt-3 text-xs font-semibold text-muted max-sm:mt-3 max-sm:pt-2 sm:max-xl:mt-2.5 sm:max-xl:pt-2">{sub || " "}</p>
    </Link>
  );
}

function Empty({ icon: Icon, title, text }: { icon: typeof Users; title: string; text: string }) {
  return (
    <div className="mt-4 grid flex-1 place-items-center rounded-xl border border-dashed border-line px-6 py-10 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-bg text-muted"><Icon size={22} /></span>
      <p className="mt-3 font-semibold">{title}</p>
      <p className="muted mt-1 max-w-xs text-sm">{text}</p>
    </div>
  );
}
