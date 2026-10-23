import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight, Building2, CalendarDays, Check, ClipboardList, FileSpreadsheet, Globe, ListChecks, MapPin, Plus, Store,
  TriangleAlert, UserPlus, Users, Wrench,
} from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { isLowStock } from "@/components/depot/DepotForms";
import { CountUp } from "@/components/CountUp";
import { Avatar } from "@/components/employees/EmployeeForms";
import { Page } from "@/components/Page";
import { AllLogsModal } from "@/components/work/AllLogsModal";
import { MonthDashboard } from "@/components/work/MonthDashboard";
import { timeOf, WorkLogModal } from "@/components/work/WorkLogModal";
import { createClient } from "@/lib/supabase/client";
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

  const [lowStock, companies, branches, markets, shops, tools, employees, logs, todayLogs, tasks] = await Promise.all([
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
      .order("created_at", { ascending: false }).limit(4)
      .then((r) => r.data ?? []),
    supabase.from("work_logs").select("employee_id").eq("work_date", today).then((r) => r.data ?? []),
    // Bugünkü tapşırıqlar (görülənlər də daxil, geri alınanlar yox; ustaya görə qruplu)
    supabase.from("tasks")
      .select("id, done, reason, place_text, group_id, employees(full_name, photo_url), stores(name, code, companies(name)), companies(name)")
      .eq("task_date", today).is("cancelled_at", null).order("employee_id").order("created_at").limit(100)
      // Qrup tapşırığı (0071) bir sətirdir: üzvlərin adları birləşir
      .then((r) => mergeGroups(r.data ?? [])),
  ]);

  const masters = employees.filter((e) => !e.is_management);
  const todayCount: Record<number, number> = {};
  for (const l of todayLogs) todayCount[l.employee_id] = (todayCount[l.employee_id] ?? 0) + 1;

  return {
    companies, branches, markets, shops, tools,
    masters, managers: employees.length - masters.length,
    logs, todayTotal: todayLogs.length, todayCount, lowStock, tasks,
  };
}

type Log = Awaited<ReturnType<typeof fetchDashboard>>["logs"][number];
type TaskRow = Awaited<ReturnType<typeof fetchDashboard>>["tasks"][number];

// Eyni group_id-li sətirlər bir tapşırıq olur; names: üzvlərin adları
function mergeGroups<T extends { group_id: string | null; employees: { full_name: string } | null }>(rows: T[]) {
  const out: (T & { names: string[] })[] = [];
  const byGroup = new Map<string, T & { names: string[] }>();
  for (const t of rows) {
    const name = t.employees?.full_name ?? "—";
    const g = t.group_id ? byGroup.get(t.group_id) : undefined;
    if (g) { g.names.push(name); continue; }
    const row = { ...t, names: [name] };
    out.push(row);
    if (t.group_id) byGroup.set(t.group_id, row);
  }
  return out;
}

function taskPlace(t: TaskRow) {
  if (t.stores) return `${t.stores.companies?.name ?? ""} · ${t.stores.name}`;
  if (t.companies) return t.companies.name;
  return t.place_text ?? "Yer silinib";
}

// İş yeri: mağaza/filial (şirkətin adı ilə) | sabit məkanlı şirkət | siyahıda olmayan yer
function placeOf(l: Log) {
  if (l.stores) return `${l.stores.companies?.name ?? ""} · ${l.stores.name}`;
  if (l.companies) return l.companies.name;
  return l.place_text ?? "—";
}

export default function Home() {
  const { name } = useAuth();
  const d = useData(fetchDashboard);
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
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        <Stat to="/sirketler" icon={Building2} label="Şirkət" value={d?.companies} sub={d && `${d.branches} filial`} tone="from-[#0a7ea4] to-[#2dd4bf]" />
        <Stat to="/magazalar" icon={Store} label="Market" value={d?.markets} sub={d && `${d.shops} mağaza`} tone="from-[#0ea5a4] to-[#2dd4bf]" />
        <Stat to="/ustalar" icon={Users} label="Usta" value={d?.masters.length} sub={d && `${d.managers} rəhbər`} tone="from-[#6d5efc] to-[#0a7ea4]" />
        <Stat to="/depo" icon={Wrench} label="Alət" value={d?.tools.total} sub={d && `${d.tools.total - d.tools.out} depoda, ${d.tools.out} ustalarda`} tone="from-[#f59e0b] to-[#f97316]" />
        <Stat to="/tapshiriqlar" icon={ListChecks} label="Tapşırıq" value={d?.tasks.length} sub={d && `bu gün: ${d.tasks.filter((t) => t.done).length} görülüb, ${d.tasks.filter((t) => !t.done).length} qalıb`} tone="from-[#10b981] to-[#2dd4bf]" />
      </div>

      {/* Depoda azalanlar: minimum qalıq həddinə çatan alət və materiallar */}
      {!!d?.lowStock.length && (
        <Link to="/depo" className="mt-5 flex items-start gap-3 rounded-2xl border border-[#f5d9a8] bg-[#fff8ec] px-5 py-4 transition-colors hover:bg-[#fff3dc]">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#fde7bf] text-[#b45309]"><TriangleAlert size={18} /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-[#92400e]">Depoda azalıb: {d.lowStock.length} {d.lowStock.length === 1 ? "mövqe" : "mövqe"}</span>
            <span className="mt-0.5 block text-sm text-[#92400e]/90">
              {d.lowStock.map((t) => `${t.name} (${t.available + t.pieces_total} ${t.kind === "material" ? t.unit : "ədəd"} qalıb)`).join(", ")}
            </span>
          </span>
          <ArrowRight size={16} className="mt-2 shrink-0 text-[#b45309]" />
        </Link>
      )}

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1.35fr]">
        {/* Bu gün: iş qeydləri (son 4; hamısı pəncərədə) */}
        <section className="card flex h-[374px] flex-col">
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
                    className="group flex w-full items-start gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-bg">
                    <Avatar employee={{ full_name: l.employees?.full_name ?? "?", photo_url: l.employees?.photo_url ?? null }} className="!h-10 !w-10 shrink-0 !text-xs" />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 text-sm">
                        <span className="font-semibold">{l.employees?.full_name ?? "—"}</span>
                        <span className="flex min-w-0 items-center gap-1 truncate text-xs font-semibold text-primary"><MapPin size={12} /> {placeOf(l)}</span>
                      </span>
                      <span className="muted mt-0.5 block truncate text-sm">{l.description}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-sm font-semibold tabular-nums">{timeOf(l.created_at)}</span>
                      <span className="muted block text-[11px]">{l.work_date === localDate() ? ago(l.created_at) : l.work_date.split("-").reverse().join(".")}</span>
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

        {/* Bugünkü tapşırıqlar: sadə siyahı (görülməyənlər yuxarıda); sayı yuxarıdakı xanada, hamısı /tapshiriqlar-da */}
        <section className="card flex h-[374px] flex-col">
          <h2 className="card-title flex items-center gap-2"><ListChecks size={18} className="text-primary" /> Tapşırıqlar</h2>
          {!d ? (
            <p className="muted mt-6 text-sm">Yüklənir...</p>
          ) : d.tasks.length === 0 ? (
            <Empty icon={ListChecks} title="Bu gün tapşırıq yoxdur" text="Tapşırıqlar bölməsindən ustaya iş ver." />
          ) : (
            <div className="mt-3 grid min-h-0 flex-1 grid-cols-2 divide-x divide-line overflow-hidden">
              {/* Ortadan iki sütun: solda gözləyənlər (mavi), sağda görülənlər (✓, yaşıl) */}
              {([
                { key: "wait", title: "Gözləyənlər", items: d.tasks.filter((t) => !t.done), max: 5, tone: "text-primary", empty: "Hamısı görülüb" },
                { key: "done", title: "Görülənlər", items: d.tasks.filter((t) => t.done), max: 5, tone: "text-ok", empty: "Hələ görülən yoxdur" },
              ] as const).map((g) => (
                <div key={g.key} className="min-w-0 px-4 first:pl-0 last:pr-0">
                  <p className={`flex items-center gap-2 pb-1.5 text-xs font-bold ${g.tone}`}>
                    {g.title} <span className="rounded-full bg-bg px-2 py-0.5 text-[11px] text-muted">{g.items.length}</span>
                  </p>
                  {g.items.length === 0 ? (
                    <p className="muted py-1.5 text-sm">{g.empty}</p>
                  ) : (
                    <ul>
                      {g.items.slice(0, g.max).map((t) => (
                        <li key={t.id}>
                          <Link to="/tapshiriqlar" className="flex items-center gap-2.5 rounded-xl px-1.5 py-1.5 transition-colors hover:bg-bg">
                            <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 ${t.done ? "border-ok bg-ok text-white" : "border-line text-transparent"}`} title={t.done ? "Görülüb" : "Görülməyib"}>
                              <Check size={12} strokeWidth={3} />
                            </span>
                            <span className="min-w-0 flex-1 leading-tight">
                              <span className="block truncate text-sm">
                                <span className="font-bold">{t.names.map((n) => n.split(" ").slice(-1)[0]).join(" + ")}</span>
                                <span className="muted"> · </span>
                                <span className={`font-semibold ${t.done ? "text-ok" : "text-primary"}`}>{taskPlace(t)}</span>
                              </span>
                              <span className={`block truncate text-xs ${t.done ? "text-ok/80" : "muted"}`}>{t.reason}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                      {g.items.length > g.max && <li className="muted px-1.5 pt-0.5 text-xs">+ {g.items.length - g.max} daha</li>}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
          {!!d?.tasks.length && (
            <Link to="/tapshiriqlar" className="link mt-auto inline-flex w-fit items-center gap-1 pt-4 text-sm font-semibold">
              Hamısına bax ({d.tasks.length}) <ArrowRight size={14} />
            </Link>
          )}
        </section>
      </div>

      {/* Ayın icmalı: iş qeydləri ilə ustalar arasında (bütün ustaların ay üzrə gördüyü işlər) */}
      <div className="mt-5">
        <MonthDashboard onUsta={(name) => setAllLogs(name)} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.7fr_1fr]">
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
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {/* Ən çox iş görən yuxarıda; sağda bugünkü iş sayı nişanı (klik → ustanın işləri) */}
              {[...d.masters].sort((a, b) => (d.todayCount[b.id] ?? 0) - (d.todayCount[a.id] ?? 0)).map((m) => {
                const count = d.todayCount[m.id] ?? 0;
                return (
                  <li key={m.id} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5">
                    <span className="relative shrink-0">
                      <Avatar employee={m} className="!h-10 !w-10 !text-xs" />
                      <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-surface ${count ? "bg-ok" : "bg-line"}`} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{m.full_name}</span>
                      <span className="muted block truncate text-xs">{m.specialty ?? "Usta"}</span>
                    </span>
                    {count > 0 ? (
                      <button type="button" onClick={() => setAllLogs(m.full_name)} title={`Bu gün ${count} iş: bax`}
                        className="flex h-8 min-w-8 shrink-0 items-center justify-center gap-1 rounded-full bg-ok px-2.5 text-sm font-bold text-white shadow-[0_4px_10px_rgba(18,161,80,0.3)] transition-transform hover:scale-105">
                        {count} <span className="text-[10px] font-semibold opacity-90">iş</span>
                      </button>
                    ) : (
                      <span className="grid h-8 min-w-8 shrink-0 place-items-center rounded-full bg-bg px-2.5 text-sm font-bold text-muted" title="Bu gün iş yazmayıb">0</span>
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
    <Link to={to} className="card card-link group relative overflow-hidden">
      <Icon size={110} strokeWidth={1} className="pointer-events-none absolute -bottom-6 -right-5 text-primary/[0.06]" />
      <div className="relative flex items-center gap-4">
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${tone} text-white shadow-[0_8px_18px_rgba(10,126,164,0.22)]`}>
          <Icon size={22} />
        </span>
        <div className="min-w-0">
          <div className="stat-value leading-none">{value == null ? "–" : <CountUp value={value} />}</div>
          <div className="muted mt-1 text-sm font-medium">{label}</div>
        </div>
        <ArrowRight size={18} className="ml-auto text-muted opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <p className="relative mt-4 border-t border-line pt-3 text-xs font-semibold text-muted">{sub || " "}</p>
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
