import type { ReactNode } from "react";
import type { AttendanceEmployee } from "./AttendanceEmployee";
import type { MonthAttendance } from "./MonthAttendance";

export type EmployeeRowProps = {
  employee: AttendanceEmployee;
  summary: MonthAttendance | null;
  isMe: boolean;
  cell: ReactNode;
  onOpen: (e: AttendanceEmployee) => void;
};
