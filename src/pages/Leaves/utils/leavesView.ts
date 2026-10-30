import { leaveWorkdays } from "@/shared/utils/attendance/leaveWorkdays";
import type { LeavesView, LeaveRow } from "@/types/leaves";
import { personOf } from "./personOf";

// Ustanın bu ilki təsdiqli icazə günləri (gözləyən sorğuya qərar verərkən göstərilir)
function yearDaysOf(approved: LeaveRow[], year: string) {
  const days = new Map<number, number>();
  for (const l of approved) {
    if (!l.date_from.startsWith(year) && !l.date_to.startsWith(year)) continue;
    const from = l.date_from < `${year}-01-01` ? `${year}-01-01` : l.date_from;
    const to = l.date_to > `${year}-12-31` ? `${year}-12-31` : l.date_to;
    days.set(l.employee_id, (days.get(l.employee_id) ?? 0) + leaveWorkdays({ date_from: from, date_to: to }));
  }
  return days;
}

// Gözləyənlər, bu gün icazədə olanlar, qarşıdakılar, tarixçə; tarixçə süzgəci üçün ustalar
export function leavesView(all: LeaveRow[], today: string): LeavesView {
  const approved = all.filter((l) => l.status === "approved");
  const pending = all.filter((l) => l.status === "pending").sort((a, b) => a.date_from.localeCompare(b.date_from));
  const now = approved.filter((l) => l.date_from <= today && today <= l.date_to);
  const upcoming = approved.filter((l) => l.date_from > today).sort((a, b) => a.date_from.localeCompare(b.date_from));
  const history = all.filter((l) => l.status !== "pending" && !now.includes(l) && !upcoming.includes(l));
  const people = [...new Map(all.map((l) => [l.employee_id, { id: l.employee_id, ...personOf(l) }])).values()]
    .sort((a, b) => a.full_name.localeCompare(b.full_name, "az"));
  return { pending, now, upcoming, history, yearDays: yearDaysOf(approved, today.slice(0, 4)), people };
}
