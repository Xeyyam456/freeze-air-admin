import type { MonthAttendance } from "./MonthAttendance";

export type MonthAttendanceData = { byEmployee: Map<number, MonthAttendance>; empty: MonthAttendance };
