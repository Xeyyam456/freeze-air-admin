import type { AttendanceEmployee, MonthAttendanceData } from "@/types/attendance";
import { todayBadge } from "./todayBadge";

// Bir ustanın ayın xülasəsi (məlumat yüklənməyibsə null) və cari ayda bu günün nişanı
export function employeeView(e: AttendanceEmployee, att: MonthAttendanceData | null, isCurrent: boolean) {
  const summary = att ? att.byEmployee.get(e.id) ?? att.empty : null;
  return { summary, badge: summary && isCurrent ? todayBadge(summary) : null };
}
