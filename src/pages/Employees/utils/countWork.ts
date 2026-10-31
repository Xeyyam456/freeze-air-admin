import type { MonthLog } from "@/types/employees";

// Ustaya görə bu gün və bu ay yazılan iş sayı
export function countWork(logs: MonthLog[], today: string) {
  const todayWork: Record<number, number> = {};
  const monthWork: Record<number, number> = {};
  for (const l of logs) {
    monthWork[l.employee_id] = (monthWork[l.employee_id] ?? 0) + 1;
    if (l.work_date === today) todayWork[l.employee_id] = (todayWork[l.employee_id] ?? 0) + 1;
  }
  return { todayWork, monthWork };
}
