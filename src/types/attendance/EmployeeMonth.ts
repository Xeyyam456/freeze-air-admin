import type { DayEntry } from "./DayEntry";
import type { MonthAttendance } from "./MonthAttendance";

export type EmployeeMonth = { summary: MonthAttendance; days: DayEntry[] };
