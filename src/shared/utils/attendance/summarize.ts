import type { Leave, MonthAttendance, Presence } from "@/types/attendance";
import { monthDays } from "../monthDays";
import { dayStatus } from "./dayStatus";
import { isWorkday } from "./isWorkday";

export function summarize(month: string, today: string, presence: Map<string, Presence>, leaves: Leave[], marked: Set<string> = new Set()): MonthAttendance {
  const r: MonthAttendance = { workdays: 0, present: 0, leave: 0, absent: 0, leaveTimes: 0, extra: 0, today: { status: "future", presence: null }, pendingLeave: leaves.filter((l) => l.status === "pending").length };
  for (const d of monthDays(month)) {
    const st = dayStatus(d, today, presence, leaves, marked);
    if (d > today || st === "off" || st === "before") continue;
    if (!isWorkday(d)) {
      r.extra += 1; // bazar günü işləyib
      continue;
    }
    r.workdays += 1;
    if (st === "present") r.present += 1;
    else if (st === "leave") r.leave += 1;
    else if (st === "absent") r.absent += 1;
  }
  const [first, last] = [`${month}-01`, monthDays(month).at(-1)!];
  r.leaveTimes = leaves.filter((l) => l.status === "approved" && l.date_from <= last && l.date_to >= first).length;
  if (today.startsWith(month)) r.today = { status: dayStatus(today, today, presence, leaves, marked), presence: presence.get(today) ?? null };
  return r;
}
