import type { MonthAttendance, TodayTotals } from "@/types/attendance";

// Ustaların bu günkü vəziyyətləri: işdə, işi bitirib, icazəli, hələ gəlməyib, işdə olmayıb; gözləyən icazə sorğuları
export function countToday(list: MonthAttendance[]): TodayTotals {
  const t = { here: 0, done: 0, leave: 0, missing: 0, absent: 0, pending: 0 };
  for (const a of list) {
    t.pending += a.pendingLeave;
    if (a.today.status === "present" && a.today.presence?.out) t.done += 1;
    else if (a.today.status === "present") t.here += 1;
    else if (a.today.status === "leave") t.leave += 1;
    else if (a.today.status === "pending") t.missing += 1;
    else if (a.today.status === "absent") t.absent += 1;
  }
  return t;
}
