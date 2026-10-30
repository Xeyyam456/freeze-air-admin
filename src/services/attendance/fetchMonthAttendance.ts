import { monthDays } from "@/shared/utils/monthDays";
import { todayBaku } from "@/shared/utils/todayBaku";
import { summarize } from "@/shared/utils/attendance/summarize";
import { toPresence } from "@/shared/utils/attendance/toPresence";
import type { MonthAttendance, MonthAttendanceData } from "@/types/attendance";
import { fetchRange } from "./fetchRange";

// Bütün ustaların ay üzrə davamiyyəti: usta id → xülasə
export async function fetchMonthAttendance(month: string): Promise<MonthAttendanceData> {
  const days = monthDays(month);
  const { att, leaves, absences } = await fetchRange(days[0], days[days.length - 1]);
  const today = todayBaku();
  const ids = new Set([...att.map((a) => a.employee_id), ...leaves.map((l) => l.employee_id), ...absences.map((x) => x.employee_id)]);
  const byEmployee = new Map<number, MonthAttendance>();
  for (const id of ids) {
    byEmployee.set(id, summarize(month, today, toPresence(att.filter((a) => a.employee_id === id)), leaves.filter((l) => l.employee_id === id),
      new Set(absences.filter((x) => x.employee_id === id).map((x) => x.day))));
  }
  return { byEmployee, empty: summarize(month, today, new Map(), []) };
}
