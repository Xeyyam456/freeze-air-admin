import type { AttendanceEmployee } from "./AttendanceEmployee";
import type { MonthAttendance } from "./MonthAttendance";
import type { TodayBadge } from "./TodayBadge";

export type TodayCellProps = {
  employee: AttendanceEmployee;
  summary: MonthAttendance | null;
  badge: TodayBadge | null;
  canMark: boolean;
  busy: boolean;
  onMark: (e: AttendanceEmployee, absent: boolean) => void;
};
