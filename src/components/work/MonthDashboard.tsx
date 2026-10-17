import { useEffect, useMemo, useState } from "react";
import { Activity, CalendarCheck, ChevronLeft, ChevronRight, ClipboardList, MapPin, Table2, TrendingDown, TrendingUp, Trophy, Users } from "lucide-react";
import { Avatar } from "@/components/employees/EmployeeForms";
import { createClient } from "@/lib/supabase/client";

const MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];
const WEEKDAYS = ["Bazar", "Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə", "Cümə axşamı", "Cümə", "Şənbə"];

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

type LogRow = {
  id: number;
  work_date: string;
  employee_id: number;
  place_text: string | null;
  store_id: number | null;
  company_id: number | null;
  employees: { full_name: string; photo_url: string | null } | null;
};
type Master = { id: number; full_name: string; photo_url: string | null };
type MonthData = { key: string; logs: LogRow[]; prevCount: number; masters: Master[] };

// Ayın bütün işləri (hamı ustalar) + əvvəlki ayın tam sayı (müqayisə üçün: 1-dən sonuna qədər)
async function fetchMonth(y: number, m: number): Promise<MonthData> {
  const supabase = createClient();
  const days = new Date(y, m + 1, 0).getDate();
  const py = m === 0 ? y - 1 : y;
  const pm = m === 0 ? 11 : m - 1;
  const pdays = new Date(py, pm + 1, 0).getDate();
  const [cur, prev, masters] = await Promise.all([
    supabase.from("work_logs")
      .select("id, work_date, employee_id, place_text, store_id, company_id, employees(full_name, photo_url)")
      .gte("work_date", iso(y, m, 1)).lte("work_date", iso(y, m, days)).limit(5000),
    supabase.from("work_logs").select("id", { count: "exact", head: true })
      .gte("work_date", iso(py, pm, 1)).lte("work_date", iso(py, pm, pdays)),
    supabase.from("employees").select("id, full_name, photo_url").eq("is_management", false).eq("is_active", true),
  ]);
  return { key: `${y}-${m}`, logs: (cur.data ?? []) as LogRow[], prevCount: prev.count ?? 0, masters: masters.data ?? [] };
}

// Y oxu: yuvarlaq, az xətt
function niceTop(max: number) {
  const step = [1, 2, 5, 10, 20, 50, 100].find((s) => max / s <= 4) ?? 200;
  return Math.max(step, Math.ceil(max / step) * step);
}

const clamp = (v: number) => Math.min(100, Math.max(0, v));

// Hamar əyri (Catmull-Rom → Bézier); koordinatlar faizlə (0..100), əyri sahədən kənara çıxmır
function smoothPath(pts: [number, number][]) {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0][0]} ${pts[0][1]}`;
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1y = clamp(p1[1] + (p2[1] - p0[1]) / 6);
    const c2y = clamp(p2[1] - (p3[1] - p1[1]) / 6);
    d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${c1y}, ${p2[0] - (p3[0] - p1[0]) / 6} ${c2y}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

// Şüşə effektli xana (tünd fonda)
function Tile({ icon: Icon, label, value, children }: { icon: typeof Activity; label: string; value: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10 backdrop-blur">
      <div className="flex items-center gap-2 text-white/60">
        <span className="grid h-6 w-6 place-items-center rounded-lg bg-white/10 text-frost"><Icon size={13} /></span>
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <p className="mt-3 text-4xl font-extrabold leading-none tracking-tight text-white">{value}</p>
      {children && <div className="mt-2 text-xs font-semibold">{children}</div>}
    </div>
  );
}

// Günlük iş sayı: parlayan əyri + qradiyent sahə; hover/fokusda şaquli xətt, nöqtə və tooltip. Rejim: günlük | yığım.
function Chart({ y, m, series, todayDay, cumulative }: { y: number; m: number; series: number[]; todayDay: number | null; cumulative: boolean }) {
  const days = series.length;
  const shown = todayDay ?? days; // cari ayda gələcək günlər çəkilmir
  const values = useMemo(() => {
    const raw = series.slice(0, shown);
    if (!cumulative) return raw;
    let acc = 0;
    return raw.map((v) => (acc += v));
  }, [series, shown, cumulative]);
  const max = Math.max(0, ...values);
  const top = niceTop(max * 1.12);
  const step = top <= 4 ? 1 : top / 4;
  const ticks: number[] = [];
  for (let v = 0; v <= top + 1e-9; v += step) ticks.push(Math.round(v));
  const xOf = (i: number) => ((i + 0.5) / days) * 100;
  const yOf = (v: number) => 100 - (v / top) * 100;
  const pts = values.map((v, i) => [xOf(i), yOf(v)] as [number, number]);
  const line = smoothPath(pts);
  const area = pts.length > 1 ? `${line} L ${pts[pts.length - 1][0]} 100 L ${pts[0][0]} 100 Z` : "";
  const [hover, setHover] = useState<number | null>(null);
  const peak = cumulative ? values.length - 1 : max > 0 ? values.indexOf(max) : -1;

  return (
    <div className="flex gap-3 pt-3">
      <div className="relative h-56 w-7 shrink-0 text-right text-[11px] tabular-nums text-white/50" aria-hidden="true">
        {ticks.map((v) => <span key={v} className="absolute right-0 -translate-y-1/2" style={{ bottom: `${(v / top) * 100}%` }}>{v}</span>)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="relative h-56" onMouseLeave={() => setHover(null)}>
          {ticks.map((v) => <div key={v} className={`absolute inset-x-0 border-t ${v === 0 ? "border-white/25" : "border-white/[0.08]"}`} style={{ bottom: `${(v / top) * 100}%` }} />)}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
            <defs>
              <linearGradient id="md-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#22c3e6" stopOpacity="0.38" />
                <stop offset="1" stopColor="#1f6feb" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {area && <path d={area} fill="url(#md-fill)" />}
            {line && (
              <path d={line} fill="none" stroke="#5fd8f0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"
                style={{ filter: "drop-shadow(0 0 6px rgba(34,195,230,0.65))" }} />
            )}
          </svg>
          {/* Son və ya ən hündür nöqtə: yalnız bir rəqəm (hər nöqtəyə yox) */}
          {peak >= 0 && values[peak] > 0 && hover === null && (
            <span className="pointer-events-none absolute grid h-3 w-3 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-frost shadow-[0_0_12px_rgba(34,195,230,0.9)] ring-[3px] ring-[#0f2a55]"
              style={{ left: `${xOf(peak)}%`, top: `${yOf(values[peak])}%` }}>
              <span className="absolute -top-6 text-[11px] font-bold tabular-nums text-white">{values[peak]}</span>
            </span>
          )}
          {/* Hover qatı: hər gün üçün sütun (hit sahəsi gün enində), şaquli xətt və tooltip */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: days }, (_, i) => {
              const day = i + 1;
              const disabled = i >= shown;
              const wd = WEEKDAYS[new Date(y, m, day).getDay()];
              const align = i < days / 3 ? "left-0" : i > (days * 2) / 3 ? "right-0" : "left-1/2 -translate-x-1/2";
              return (
                <div key={day} tabIndex={disabled ? -1 : 0} onMouseEnter={() => !disabled && setHover(i)} onFocus={() => !disabled && setHover(i)} onBlur={() => setHover(null)}
                  aria-label={disabled ? undefined : `${day} ${MONTHS[m].toLowerCase()}, ${wd}: ${series[i]} iş`}
                  className="relative h-full flex-1 outline-none">
                  {hover === i && !disabled && (
                    <>
                      <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-white/50 to-white/5" />
                      <span className="pointer-events-none absolute left-1/2 grid h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-frost shadow-[0_0_14px_rgba(34,195,230,0.95)] ring-[3px] ring-[#0f2a55]"
                        style={{ top: `${yOf(values[i])}%` }} />
                      <div role="tooltip" style={{ bottom: `calc(${(values[i] / top) * 100}% + 20px)` }}
                        className={`pointer-events-none absolute z-10 whitespace-nowrap rounded-xl border border-white/15 bg-[#0a1a33]/95 px-3 py-2 text-xs text-white shadow-[0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur ${align}`}>
                        <p className="text-sm font-bold">{series[i]} iş{cumulative && <span className="font-medium text-white/60"> · yığım {values[i]}</span>}</p>
                        <p className="text-white/60">{day} {MONTHS[m].toLowerCase()}, {wd}</p>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-1.5 flex" aria-hidden="true">
          {Array.from({ length: days }, (_, i) => (
            <span key={i} className={`flex-1 text-center text-[10px] tabular-nums ${i >= shown ? "text-white/20" : "text-white/50"}`}>{(i + 1) % 2 === 1 || days <= 16 ? i + 1 : ""}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Ayın icmalı (admin): bütün ustaların gördüyü işlər: KPI, günlük əyri, ustalar üzrə reyting. Ustaya klik → onun işləri.
// Tünd navy kart (tətbiqin başlıq zolağı ilə eyni palitra): şüşə xanalar, parlayan əyri.
export function MonthDashboard({ onUsta }: { onUsta: (name: string) => void }) {
  const [today] = useState(() => {
    const t = new Date();
    return { y: t.getFullYear(), m: t.getMonth(), d: t.getDate() };
  });
  const [ym, setYm] = useState({ y: today.y, m: today.m });
  const [data, setData] = useState<MonthData | null>(null);
  const [cumulative, setCumulative] = useState(false);
  const [table, setTable] = useState(false);
  const key = `${ym.y}-${ym.m}`;
  const isCurrent = ym.y === today.y && ym.m === today.m;
  const days = new Date(ym.y, ym.m + 1, 0).getDate();

  useEffect(() => {
    let cancelled = false;
    fetchMonth(ym.y, ym.m).then((d) => {
      if (!cancelled) setData(d);
    });
    return () => {
      cancelled = true; // ay tez-tez dəyişəndə köhnə cavab yenisinin üstünə yazılmasın
    };
  }, [ym]);

  const s = useMemo(() => {
    const counts = Array<number>(days).fill(0);
    const byEmp = new Map<number, number>();
    const places = new Set<string>();
    for (const l of data?.logs ?? []) {
      const d = Number(l.work_date.slice(8, 10));
      if (d >= 1 && d <= days) counts[d - 1] += 1;
      byEmp.set(l.employee_id, (byEmp.get(l.employee_id) ?? 0) + 1);
      places.add(l.store_id ? `s${l.store_id}` : l.company_id ? `c${l.company_id}` : `t:${l.place_text ?? ""}`);
    }
    const masters = data?.masters ?? [];
    const ranking = masters.map((e) => ({ ...e, n: byEmp.get(e.id) ?? 0 })).sort((a, b) => b.n - a.n || a.full_name.localeCompare(b.full_name, "az"));
    const total = counts.reduce((a, b) => a + b, 0);
    return { counts, total, places: places.size, ranking, active: ranking.filter((r) => r.n > 0).length, masters: masters.length };
  }, [data, days]);

  const loading = !data || data.key !== key;
  const diff = data ? s.total - data.prevCount : 0;
  const maxN = s.ranking[0]?.n ?? 1;
  const prevMonth = () => setYm((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }));
  const nextMonth = () => setYm((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }));
  const seg = (on: boolean) => `rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${on ? "bg-white/20 text-white shadow-sm" : "text-white/60 hover:text-white"}`;
  const navBtn = "grid h-9 w-9 place-items-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <section className="relative overflow-hidden rounded-[18px] bg-[linear-gradient(135deg,#0a1a33,#0f2a55_55%,#0e3b6e)] text-white shadow-[0_18px_48px_rgba(10,26,51,0.35)] ring-1 ring-white/10">
      {/* Yumşaq işıq ləkələri (dekor) */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#22c3e6]/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-[#1f6feb]/25 blur-3xl" aria-hidden="true" />

      <div className="relative">
        {/* Başlıq zolağı: ay seçimi və rejim keçidləri */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-frost ring-1 ring-white/10"><Activity size={19} /></span>
            <div>
              <h2 className="text-base font-bold">Ayın icmalı</h2>
              <p className="text-xs text-white/60">Bütün ustaların gördüyü işlər</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex gap-0.5 rounded-xl bg-white/10 p-1" role="tablist" aria-label="Rejim">
              <button type="button" role="tab" aria-selected={!cumulative} onClick={() => setCumulative(false)} className={seg(!cumulative)}>Günlük</button>
              <button type="button" role="tab" aria-selected={cumulative} onClick={() => setCumulative(true)} className={seg(cumulative)}>Yığım</button>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={prevMonth} className={navBtn} aria-label="Əvvəlki ay"><ChevronLeft size={18} /></button>
              <span className="min-w-32 text-center text-sm font-bold">{MONTHS[ym.m]} {ym.y}</span>
              <button type="button" onClick={nextMonth} disabled={isCurrent} className={navBtn} aria-label="Sonrakı ay"><ChevronRight size={18} /></button>
            </div>
          </div>
        </div>

        {/* Yenilənəndə çərçivə qalır, məzmun solğunlaşır (skelet və tullanma yox) */}
        <div className={`grid gap-6 p-6 transition-opacity xl:grid-cols-[1.7fr_1fr] ${loading && data ? "opacity-60" : ""}`}>
          {!data ? (
            <p className="text-sm text-white/60 xl:col-span-2">Yüklənir...</p>
          ) : (
            <>
              <div className="min-w-0 space-y-5">
                <div className="grid grid-cols-3 gap-4">
                  <Tile icon={ClipboardList} label="İş sayı" value={String(s.total)}>
                    <span className={`flex items-center gap-1 ${diff > 0 ? "text-emerald-300" : diff < 0 ? "text-rose-300" : "text-white/60"}`}>
                      {diff > 0 ? <TrendingUp size={13} /> : diff < 0 ? <TrendingDown size={13} /> : null}
                      {diff > 0 ? `+${diff}` : diff < 0 ? `−${Math.abs(diff)}` : "Eyni"} <span className="font-medium text-white/50">əvvəlki aya görə</span>
                    </span>
                  </Tile>
                  <Tile icon={Users} label="İş yazan usta" value={`${s.active}`}>
                    <span className="font-medium text-white/50">{s.masters} ustadan</span>
                  </Tile>
                  <Tile icon={MapPin} label="Fərqli yer" value={String(s.places)}>
                    <span className="font-medium text-white/50">şirkət, filial, mağaza</span>
                  </Tile>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="flex items-center gap-2 text-sm font-bold"><CalendarCheck size={16} className="text-frost" /> {cumulative ? "Yığılan iş sayı" : "Günlər üzrə iş sayı"}</h3>
                    <button type="button" onClick={() => setTable((t) => !t)} aria-pressed={table}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/15 hover:text-white">
                      <Table2 size={14} /> {table ? "Qrafik" : "Cədvəl"}
                    </button>
                  </div>
                  {table ? (
                    s.total === 0 ? <p className="py-6 text-center text-sm text-white/60">Bu ayda iş qeydi yoxdur.</p> : (
                      <table className="w-full text-sm">
                        <thead className="text-left text-xs font-semibold text-white/50"><tr><th className="py-2">Gün</th><th className="py-2 text-right">İş sayı</th></tr></thead>
                        <tbody>
                          {s.counts.map((c, i) => c > 0 && (
                            <tr key={i} className="border-t border-white/10">
                              <td className="py-2">{i + 1} {MONTHS[ym.m].toLowerCase()}, {WEEKDAYS[new Date(ym.y, ym.m, i + 1).getDay()]}</td>
                              <td className="py-2 text-right font-semibold tabular-nums">{c}</td>
                            </tr>
                          ))}
                          <tr className="border-t border-white/10 font-bold"><td className="py-2">Cəmi</td><td className="py-2 text-right tabular-nums">{s.total}</td></tr>
                        </tbody>
                      </table>
                    )
                  ) : (
                    <>
                      <Chart y={ym.y} m={ym.m} series={s.counts} todayDay={isCurrent ? today.d : null} cumulative={cumulative} />
                      {s.total === 0 && <p className="mt-3 text-center text-sm text-white/60">Bu ayda iş qeydi yoxdur.</p>}
                    </>
                  )}
                </div>
              </div>

              {/* Ustalar üzrə reyting: nazik parlayan zolaqlar, klik → ustanın işləri */}
              <div className="min-w-0 rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10 backdrop-blur">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold"><Trophy size={16} className="text-frost" /> Ustalar üzrə</h3>
                {s.ranking.length === 0 ? (
                  <p className="py-6 text-center text-sm text-white/60">Aktiv usta yoxdur.</p>
                ) : (
                  // 6 usta görünür (hər sətir ~49px + 14px aralıq = 366px), çoxdursa gizli zolaqla sürüşür və aşağıda solğunlaşır
                  <ul className={`max-h-[366px] space-y-3.5 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
                    s.ranking.length > 6 ? "[mask-image:linear-gradient(to_bottom,black_calc(100%-28px),transparent)]" : ""}`}>
                    {s.ranking.map((r, i) => (
                      <li key={r.id}>
                        <button type="button" onClick={() => onUsta(r.full_name)} disabled={r.n === 0} title={r.n ? `${r.full_name}: işlərinə bax` : "Bu ay iş yazmayıb"}
                          className="group w-full text-left disabled:cursor-default">
                          <span className="flex items-center gap-2.5">
                            <span className="w-4 shrink-0 text-center text-xs font-bold tabular-nums text-white/40">{i + 1}</span>
                            <Avatar employee={r} className="!h-8 !w-8 !text-[11px] ring-2 ring-white/20" />
                            <span className={`min-w-0 flex-1 truncate text-sm font-semibold ${r.n ? "text-white group-hover:text-frost" : "text-white/40"}`}>{r.full_name}</span>
                            <span className={`shrink-0 text-sm font-bold tabular-nums ${r.n ? "text-white" : "text-white/40"}`}>{r.n}</span>
                          </span>
                          <span className="ml-[26px] mt-1.5 block h-1.5 overflow-hidden rounded-full bg-white/10">
                            <span className="block h-full rounded-full bg-gradient-to-r from-[#22c3e6] to-[#6da7ec] shadow-[0_0_10px_rgba(34,195,230,0.7)] transition-[width] duration-500"
                              style={{ width: `${r.n ? Math.max(6, (r.n / maxN) * 100) : 0}%` }} />
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
