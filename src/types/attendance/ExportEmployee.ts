import type { AttendanceEmployee } from "./AttendanceEmployee";

export type ExportEmployee = Pick<AttendanceEmployee, "id" | "full_name"> & { specialty?: string | null };
