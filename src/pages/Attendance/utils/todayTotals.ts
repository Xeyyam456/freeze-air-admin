import type { AttendanceEmployee, MonthAttendance, MonthAttendanceData, TodayTotals } from "@/types/attendance";
import { countToday } from "./countToday";

// Bu günün vəziyyəti (yalnız cari ay) siyahıdakı ustalar üzrə
export function todayTotals(emps: AttendanceEmployee[], att: MonthAttendanceData | null): TodayTotals {
  const list = emps.map((e) => att?.byEmployee.get(e.id) ?? att?.empty).filter((a): a is MonthAttendance => !!a);
  return countToday(list);
}
