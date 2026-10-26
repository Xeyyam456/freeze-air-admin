import { useMemo, useState } from "react";
import { CalendarClock, CalendarOff, Check, History, Hourglass, Trash2, X } from "lucide-react";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Avatar } from "@/components/employees/EmployeeForms";
import { EmployeeSelect } from "@/components/employees/EmployeeSelect";
import { Page } from "@/components/Page";
import { MONTHS_AZ, leaveRange, leaveWorkdays, todayBaku } from "@/lib/attendance";
import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import { useData } from "@/lib/useData";

type Filter = "all" | "approved" | "rejected" | "cancelled";

const STATUS = {
  pending: { text: "Gözləyir", cls: "bg-primary-soft text-primary", bar: "bg-primary" },
  approved: { text: "Təsdiqləndi", cls: "bg-ok-soft text-ok", bar: "bg-ok" },
  rejected: { text: "Rədd edildi", cls: "bg-danger-soft text-danger", bar: "bg-danger" },
  cancelled: { text: "Usta ləğv etdi", cls: "bg-bg text-muted", bar: "bg-[#98a2b3]" },
} as const;
const statusOf = (s: string) => STATUS[s as keyof typeof STATUS] ?? STATUS.pending;

async function fetchLeaves() {
  const { data } = await createClient()
    .from("leave_requests")
    .select("id, employee_id, date_from, date_to, reason, status, created_at, decided_at, employees(full_name, photo_url)")
    .order("created_at", { ascending: false })
    .limit(300);
  return data ?? [];
}
type Row = Awaited<ReturnType<typeof fetchLeaves>>[number];

// "21.10.2026 18:41" (Bakı vaxtı)
function stamp(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Baku", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })
    .format(new Date(iso)).replace(",", "").replaceAll("/", ".");
}

// Köhnə sorğunu silmək (0067): yalnız cavablanmış; təsdiqlənmiş icazə silinsə həmin günlər "gəlmədi" sayılır
async function removeLeaves(ids: number[]) {
  if (ids.length === 0) return;
  const { error } = await createClient().from("leave_requests").delete().in("id", ids).neq("status", "pending");
  if (error) return toast.error(error.message);
  toast.success(ids.length > 1 ? `${ids.length} sorğu silindi` : "Sorğu silindi");
  revalidate();
}

async function decide(id: number, approve: boolean) {
  const { error } = await createClient().rpc("leave_decide", { p_id: id, p_approve: approve });
  if (error) return toast.error(error.message);
  toast.success(approve ? "İcazə təsdiqləndi" : "İcazə rədd edildi");
  revalidate();
}

const person = (l: Row) => ({ full_name: l.employees?.full_name ?? "?", photo_url: l.employees?.photo_url ?? null });

// Tarixçə sətri: rəngli zolaq, usta, tarix, səbəb, vəziyyət, sil
function HistoryRow({ l }: { l: Row }) {
  const st = statusOf(l.status);
  return (
    <li className="flex items-stretch overflow-hidden">
      <span className={`w-1 shrink-0 ${st.bar}`} />
      <div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-2.5 max-sm:gap-2 max-sm:px-2.5">
        <Avatar employee={person(l)} className="!h-9 !w-9 shrink-0 !text-[11px] !shadow-none max-sm:!h-7 max-sm:!w-7 max-sm:!text-[9px]" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm max-sm:whitespace-normal max-sm:text-[13px] max-sm:leading-tight">
            <span className="font-bold max-sm:block">{l.employees?.full_name ?? "—"}</span>
            <span className="ml-2 font-semibold text-primary max-sm:ml-0">{leaveRange(l)}</span>
            <span className="muted"> · {leaveWorkdays(l)} iş günü</span>
          </p>
          <p className="muted truncate text-xs max-sm:whitespace-normal max-sm:text-[11px] max-sm:leading-snug">{l.reason || "Səbəb yazılmayıb"} · {stamp(l.created_at)}{l.decided_at && ` → ${stamp(l.decided_at)}`}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3 max-sm:flex-col max-sm:items-end max-sm:gap-1">
        <span className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold max-sm:px-2 max-sm:py-0.5 max-sm:text-[11px] ${st.cls}`}>{st.text}</span>
        <ConfirmButton onConfirm={() => removeLeaves([l.id])} success={false} className="icon-btn icon-btn-danger !h-8 !w-8 shrink-0" title="Sorğunu sil"
          question={l.status === "approved"
            ? `${l.employees?.full_name ?? "Usta"}: ${leaveRange(l)} təsdiqlənmiş icazəsi silinəcək. Bu günlər davamiyyətdə "gəlmədi" sayılacaq.`
            : "Sorğu silinəcək. Davamiyyətə təsir etmir."}>
          <Trash2 size={15} />
        </ConfirmButton>
        </div>
      </div>
    </li>
  );
}

// İcazələr (migrasiya 0059): usta usta panelindən icazə istəyir ("İcazələrim"), admin/rəhbərlik burada təsdiqləyir və ya rədd edir; köhnələri silir (0067).
// Düzülüş (2026-10-23): tünd xülasə → gözləyən sorğular (iri kartlar, ustanın bu ilki icazə günü ilə) → bu gün və qarşıdakı icazələr →
// süzgəcli tarixçə (vəziyyət + usta, aylara görə). Təsdiqlənən günlər davamiyyətdə "İcazəli" sayılır. Yeni sorğu Realtime ilə gəlir.
export default function LeavesPage() {
  const data = useData(fetchLeaves);
  const today = todayBaku();
  const [filter, setFilter] = useState<Filter>("all");
  const [who, setWho] = useState<number | null>(null);

  const v = useMemo(() => {
    const all = data ?? [];
    const year = today.slice(0, 4);
    const approved = all.filter((l) => l.status === "approved");
    // Ustanın bu ilki təsdiqli icazə günləri (gözləyən sorğuya qərar verərkən göstərilir)
    const yearDays = new Map<number, number>();
    for (const l of approved) {
      if (!l.date_from.startsWith(year) && !l.date_to.startsWith(year)) continue;
      const from = l.date_from < `${year}-01-01` ? `${year}-01-01` : l.date_from;
      const to = l.date_to > `${year}-12-31` ? `${year}-12-31` : l.date_to;
      yearDays.set(l.employee_id, (yearDays.get(l.employee_id) ?? 0) + leaveWorkdays({ date_from: from, date_to: to }));
    }
    const pending = all.filter((l) => l.status === "pending").sort((a, b) => a.date_from.localeCompare(b.date_from));
    const now = approved.filter((l) => l.date_from <= today && today <= l.date_to);
    const upcoming = approved.filter((l) => l.date_from > today).sort((a, b) => a.date_from.localeCompare(b.date_from));
    const history = all.filter((l) => l.status !== "pending" && !now.includes(l) && !upcoming.includes(l));
    // Tarixçə süzgəci üçün ustalar (sorğusu olanlar)
    const people = [...new Map(all.map((l) => [l.employee_id, { id: l.employee_id, ...person(l) }])).values()]
      .sort((a, b) => a.full_name.localeCompare(b.full_name, "az"));
    return { pending, now, upcoming, history, yearDays, people };
  }, [data, today]);

  const shown = v.history.filter((l) => (filter === "all" || l.status === filter) && (who === null || l.employee_id === who));
  const byMonth = new Map<string, Row[]>();
  for (const l of [...shown].sort((a, b) => b.date_from.localeCompare(a.date_from))) {
    const k = l.date_from.slice(0, 7);
    byMonth.set(k, [...(byMonth.get(k) ?? []), l]);
  }
  // Davamiyyətə təsir etməyənlər: rədd və ləğv edilənlər (toplu silinir)
  const closed = (data ?? []).filter((l) => l.status === "rejected" || l.status === "cancelled");

  const chip = (value: Filter, label: string) => {
    const n = v.history.filter((l) => (value === "all" || l.status === value) && (who === null || l.employee_id === who)).length;
    return (
      <button key={value} type="button" onClick={() => setFilter(value)} aria-pressed={filter === value}
        className={`flex h-9 items-center gap-2 rounded-xl px-3.5 max-sm:justify-between max-sm:px-3 max-sm:text-[13px] text-sm font-semibold transition-colors ${
          filter === value ? "bg-[#0b1324] text-white" : "bg-surface text-muted ring-1 ring-line hover:text-ink"}`}>
        {label}<span className={`rounded-full px-1.5 text-xs tabular-nums ${filter === value ? "bg-white/15" : "bg-bg"}`}>{n}</span>
      </button>
    );
  };

  return (
    <Page title="İcazələr" subtitle="Ustaların icazə sorğuları: təsdiqlə və ya rədd et">
      {data === null ? (
        <div className="card muted py-12 text-center text-sm">Yüklənir...</div>
      ) : (
        <div className="space-y-6">
          <section className="flex flex-wrap items-center gap-x-10 gap-y-4 rounded-[18px] bg-[linear-gradient(120deg,#0b1324,#11243a_55%,#0f3d4c)] px-6 py-5 text-white max-sm:grid max-sm:grid-cols-2 max-sm:gap-x-3 max-sm:gap-y-3 max-sm:px-4 max-sm:py-3.5">
            <div className="flex items-center gap-4 max-sm:order-1 max-sm:gap-3">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-frost max-sm:hidden"><Hourglass size={26} className="max-sm:!h-5 max-sm:!w-5" /></span>
              <div>
                <p className="whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-white/50 max-sm:text-[10.5px]">Gözləyən sorğu</p>
                <p className="text-2xl font-extrabold leading-tight">{v.pending.length}</p>
              </div>
            </div>
            <dl className="flex flex-1 flex-wrap items-center gap-x-10 gap-y-3 max-sm:contents">
              <div className="max-sm:order-3">
                <dt className="text-xs text-white/55 max-sm:text-[10.5px]">Bu gün icazəli</dt>
                <dd className="flex items-center gap-2 text-2xl font-extrabold tabular-nums max-sm:text-xl">
                  {v.now.length}
                  {v.now.length > 0 && (
                    <span className="flex -space-x-2">
                      {v.now.slice(0, 4).map((l) => <Avatar key={l.id} employee={person(l)} className="!h-7 !w-7 !text-[9px] !shadow-none ring-2 ring-[#0b1324]" />)}
                    </span>
                  )}
                </dd>
              </div>
              <div className="max-sm:order-4 max-sm:text-right"><dt className="text-xs text-white/55 max-sm:text-[10.5px]">Qarşıdakı icazə</dt><dd className="text-2xl font-extrabold tabular-nums max-sm:text-xl">{v.upcoming.length}</dd></div>
              <div className="max-sm:order-2 max-sm:self-center max-sm:text-right"><dt className="text-xs text-white/55 max-sm:text-[10.5px]">Tarixçədə</dt><dd className="text-2xl font-extrabold tabular-nums max-sm:text-xl">{v.history.length}</dd></div>
            </dl>
          </section>

          {/* Gözləyən sorğular: qərar burada */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold"><Hourglass size={18} className="text-primary" /> Gözləyən sorğular</h2>
            {v.pending.length === 0 ? (
              <div className="card py-10 text-center max-sm:py-5">
                <span className="icon-tile mx-auto"><CalendarOff size={20} /></span>
                <p className="mt-2 text-sm font-semibold">Gözləyən sorğu yoxdur</p>
                <p className="muted text-xs">Ustalar icazəni usta panelində «İcazələrim» → «İcazə istə» ilə göndərir.</p>
              </div>
            ) : (
              <ul className="flex flex-wrap gap-3">
                {v.pending.map((l) => {
                  const used = v.yearDays.get(l.employee_id) ?? 0;
                  return (
                    <li key={l.id} className="card flex min-w-0 grow basis-[420px] flex-col gap-3 !p-4">
                      <div className="flex items-center gap-3">
                        <Avatar employee={person(l)} className="!h-12 !w-12 shrink-0 !text-sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold">{l.employees?.full_name ?? "—"}</p>
                          <p className="muted text-xs">Göndərilib: {stamp(l.created_at)}</p>
                        </div>
                        <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">Gözləyir</span>
                      </div>
                      <div className="grid grid-cols-[auto_1fr] gap-2">
                        <div className="rounded-xl bg-bg px-3 py-2">
                          <p className="muted text-[11px] font-semibold uppercase tracking-wide">Tarix</p>
                          <p className="font-extrabold text-primary">{leaveRange(l)}</p>
                          <p className="muted text-xs">{leaveWorkdays(l)} iş günü</p>
                        </div>
                        <div className="min-w-0 rounded-xl bg-bg px-3 py-2">
                          <p className="muted text-[11px] font-semibold uppercase tracking-wide">Səbəb</p>
                          <p className="line-clamp-2 text-sm">{l.reason || <span className="muted">Səbəb yazılmayıb</span>}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="muted mr-auto text-xs">Bu il təsdiqlənib: <b className="text-ink">{used} gün</b></span>
                        <button type="button" onClick={() => decide(l.id, false)} className="btn btn-soft btn-sm"><X size={14} /> Rədd et</button>
                        <button type="button" onClick={() => decide(l.id, true)} className="btn btn-primary btn-sm"><Check size={14} /> Təsdiqlə</button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Bu gün icazədə olanlar və qarşıdakı təsdiqli icazələr */}
          {(v.now.length > 0 || v.upcoming.length > 0) && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-base font-bold"><CalendarClock size={18} className="text-primary" /> Bu gün və qarşıda</h2>
              <ul className="card divide-y divide-line !p-0">
                {[...v.now, ...v.upcoming].map((l) => (
                  <li key={l.id} className="flex items-center gap-3 px-4 py-2.5">
                    <Avatar employee={person(l)} className="!h-9 !w-9 shrink-0 !text-[11px] !shadow-none" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm"><span className="font-bold">{l.employees?.full_name ?? "—"}</span>
                        <span className="ml-2 font-semibold text-primary">{leaveRange(l)}</span><span className="muted"> · {leaveWorkdays(l)} iş günü</span></p>
                      <p className="muted truncate text-xs">{l.reason || "Səbəb yazılmayıb"}</p>
                    </div>
                    {v.now.includes(l)
                      ? <span className="shrink-0 rounded-full bg-[#fff6e5] px-2.5 py-1 text-xs font-semibold text-amber-700">İndi icazədədir</span>
                      : <span className="shrink-0 rounded-full bg-ok-soft px-2.5 py-1 text-xs font-semibold text-ok">Təsdiqləndi</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Tarixçə: vəziyyət və usta süzgəci, aylara görə */}
          <section>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <h2 className="mr-auto flex items-center gap-2 text-base font-bold"><History size={18} className="text-primary" /> Tarixçə</h2>
              <div className="w-60 max-sm:w-full"><EmployeeSelect value={who} onChange={setWho} employees={v.people} emptyLabel="Bütün ustalar" /></div>
              <div className="contents max-sm:grid max-sm:w-full max-sm:grid-cols-2 max-sm:gap-2">
              {chip("all", "Hamısı")}
              {chip("approved", "Təsdiqlənən")}
              {chip("rejected", "Rədd edilən")}
              {chip("cancelled", "Ləğv edilən")}
              </div>
              {closed.length > 0 && (
                <ConfirmButton onConfirm={() => removeLeaves(closed.map((l) => l.id))} success={false} className="btn btn-soft btn-sm text-danger max-sm:w-full max-sm:justify-center"
                  title="Rədd və ləğv edilən sorğuları sil" confirmLabel="Bəli, sil"
                  question={`${closed.length} rədd və ya ləğv edilmiş sorğu silinəcək. Davamiyyətə təsir etmir.`}>
                  <Trash2 size={14} /> Rədd və ləğv edilənləri sil ({closed.length})
                </ConfirmButton>
              )}
            </div>
            {shown.length === 0 ? (
              <p className="card muted py-8 text-center text-sm">{v.history.length ? "Bu süzgəcə uyğun sorğu yoxdur." : "Tarixçə hələ boşdur."}</p>
            ) : (
              <div className="space-y-5">
                {[...byMonth].map(([k, list]) => (
                  <div key={k}>
                    <p className="muted mb-2 text-xs font-semibold uppercase tracking-wider">{MONTHS_AZ[Number(k.slice(5, 7)) - 1]} {k.slice(0, 4)} · {list.length}</p>
                    <ul className="card divide-y divide-line overflow-hidden !p-0">{list.map((l) => <HistoryRow key={l.id} l={l} />)}</ul>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </Page>
  );
}
