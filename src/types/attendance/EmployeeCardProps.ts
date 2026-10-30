import type { ReactNode } from "react";
import type { AttendanceEmployee } from "./AttendanceEmployee";
import type { MonthAttendance } from "./MonthAttendance";

export type EmployeeCardProps = {
  employee: AttendanceEmployee;
  summary: MonthAttendance | null;
  isMe: boolean;
  cell: ReactNode | null;
  onOpen: (e: AttendanceEmployee) => void;
};
