import type { AttendanceEmployee } from "./AttendanceEmployee";
import type { MonthAttendanceData } from "./MonthAttendanceData";

export type AttendanceData = { emps: AttendanceEmployee[] | null; att: MonthAttendanceData | null };
