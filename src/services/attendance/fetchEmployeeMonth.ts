import { monthDays } from "@/shared/utils/monthDays";
import { todayBaku } from "@/shared/utils/todayBaku";
import { dayStatus } from "@/shared/utils/attendance/dayStatus";
import { summarize } from "@/shared/utils/attendance/summarize";
import { toPresence } from "@/shared/utils/attendance/toPresence";
import type { EmployeeMonth } from "@/types/attendance";
import { fetchRange } from "./fetchRange";

// Bir ustanın ayı (təqvim üçün): gün → vəziyyət və saatlar
export async function fetchEmployeeMonth(employeeId: number, month: string): Promise<EmployeeMonth> {
  const days = monthDays(month);
  const { att, leaves, absences } = await fetchRange(days[0], days[days.length - 1], employeeId);
  const marked = new Set(absences.map((x) => x.day));
  const today = todayBaku();
  const presence = toPresence(att);
  return {
    summary: summarize(month, today, presence, leaves, marked),
    days: days.map((d) => ({ day: d, status: dayStatus(d, today, presence, leaves, marked), presence: presence.get(d) ?? null })),
  };
}
