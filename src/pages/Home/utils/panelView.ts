import { countJobs, jobKey, mergeGroupLogs } from "@/lib/jobs";
import type { PanelExtras } from "@/types/dashboard";
import { addDays } from "./addDays";
import { deltaPct } from "./deltaPct";
import { panelRanges } from "./panelRanges";
import { topShares } from "./topShares";
import { workdays } from "./workdays";

const bakuDay = (iso: string) => new Date(Date.parse(iso) + 4 * 3_600_000).toISOString().slice(0, 10);

// Dashboard kartlarının rəqəmləri: ayın işi və keçən ayla müqayisə, gündəlik orta, son 30 günün qrafikləri
// (iş və depo; son 10 gün sütunlarda), şirkətlər üzrə pay, bu gün işdə olanlar, son işlər cədvəli
export function panelView(x: PanelExtras, today: string, monthTotal: number) {
  const r = panelRanges(today);
  const prevTotal = countJobs(x.prevLogs, x.prevGroups);
  const days30 = Array.from({ length: 30 }, (_, i) => addDays(today, i - 29));
  const at = new Map(days30.map((d, i) => [d, i]));

  const jobs = days30.map(() => new Set<string>());
  for (const l of x.recent) {
    const i = at.get(l.work_date);
    if (i !== undefined) jobs[i].add(jobKey(l.id, x.groups30));
  }
  const work30 = jobs.map((s) => s.size);

  const moves30 = Array<number>(30).fill(0);
  for (const m of x.moves) {
    const i = at.get(bakuDay(m.at));
    if (i !== undefined) moves30[i] += 1;
  }

  const onDuty = new Map<number, { full_name: string; photo_url: string | null }>();
  let arrived = 0;
  for (const a of x.attendance) {
    if (!a.checked_in_at) continue;
    arrived += 1;
    if (!a.checked_out_at && a.employees) onDuty.set(a.employee_id, a.employees);
  }

  const avg = monthTotal / workdays(r.monthStart, today);
  const prevAvg = prevTotal / workdays(r.prevStart, r.prevTo);
  const sum = (a: number[]) => a.reduce((s, v) => s + v, 0);

  return {
    monthTotal, monthDelta: deltaPct(monthTotal, prevTotal), prevTotal,
    shares: topShares(x.monthPlaces, x.monthGroups),
    avg: Math.round(avg * 10) / 10, avgDelta: deltaPct(avg, prevAvg),
    bars: days30.slice(-10).map((day, i) => ({ day, value: work30[20 + i] })),
    days30, work30, work30Total: sum(work30), moves30, moves30Total: sum(moves30),
    onDuty: [...onDuty.values()], arrived,
    recent: mergeGroupLogs(x.recent, x.groups30),
  };
}
