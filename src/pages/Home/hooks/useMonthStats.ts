import { useMemo } from "react";
import { jobKey } from "@/lib/jobs";
import type { Master, MonthData, MonthStats, RankRow } from "@/types/dashboard";

// Ayın sayları: günlük iş sayı (qrup işi bir dəfə), fərqli yer, iş yazan usta, reytinq (tək usta + eyni heyətli qrup)
export function useMonthStats(data: MonthData | null, days: number): MonthStats {
  return useMemo(() => {
    const counts = Array<number>(days).fill(0);
    const byEmp = new Map<number, number>(); // yalnız təkbaşına işlər
    const crewJobs = new Map<string, { members: Set<number>; n: number }>(); // qrup işi: bir iş, bir dəfə
    const places = new Set<string>();
    const seen = new Set<string>(); // qrup işi gündəlik sayda bir dəfə
    for (const l of data?.logs ?? []) {
      const d = Number(l.work_date.slice(8, 10));
      const k = jobKey(l.id, data?.groups);
      if (d >= 1 && d <= days && !seen.has(k)) { seen.add(k); counts[d - 1] += 1; }
      if (!data?.groups.has(l.id)) byEmp.set(l.employee_id, (byEmp.get(l.employee_id) ?? 0) + 1);
      else {
        const c = crewJobs.get(k) ?? { members: new Set<number>(), n: 1 };
        c.members.add(l.employee_id);
        crewJobs.set(k, c);
      }
      places.add(l.store_id ? `s${l.store_id}` : l.company_id ? `c${l.company_id}` : `t:${l.place_text ?? ""}`);
    }
    const masters = data?.masters ?? [];
    // Eyni heyətlə görülən qrup işləri bir sətirdə: "A + B  6"
    const crews = new Map<string, RankRow>();
    const inCrew = new Set<number>();
    for (const c of crewJobs.values()) {
      const ids = [...c.members].sort((a, b) => a - b);
      ids.forEach((i) => inCrew.add(i));
      const ck = ids.join("+");
      const row = crews.get(ck) ?? { id: `g${ck}`, members: ids.map((i) => masters.find((m) => m.id === i)).filter((m): m is Master => !!m), n: 0 };
      row.n += 1;
      crews.set(ck, row);
    }
    const ranking = [
      ...masters.filter((e) => (byEmp.get(e.id) ?? 0) > 0 || !inCrew.has(e.id)).map((e) => ({ id: String(e.id), members: [e], n: byEmp.get(e.id) ?? 0 })),
      ...crews.values(),
    ].sort((a, b) => b.n - a.n || a.members[0].full_name.localeCompare(b.members[0].full_name, "az"));
    const total = counts.reduce((a, b) => a + b, 0);
    return { counts, total, places: places.size, ranking, active: new Set(masters.filter((e) => (byEmp.get(e.id) ?? 0) > 0 || inCrew.has(e.id)).map((e) => e.id)).size, masters: masters.length };
  }, [data, days]);
}
