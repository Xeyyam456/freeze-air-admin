import type { AttendanceEmployee } from "./AttendanceEmployee";
import type { MonthAttendanceData } from "./MonthAttendanceData";

export type EmployeeListProps = {
  rows: AttendanceEmployee[] | null;
  att: MonthAttendanceData | null;
  isCurrent: boolean;
  meId: number | null;
  canMark: boolean;
  busyId: number | null;
  onOpen: (e: AttendanceEmployee) => void;
  onMark: (e: AttendanceEmployee, absent: boolean) => void;
};
