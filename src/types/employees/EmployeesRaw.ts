import type { AttendanceStub } from "./AttendanceStub";
import type { Employee } from "./Employee";
import type { MonthLog } from "./MonthLog";

// Bazadan gələn xam məlumat (services/employees/fetchEmployees.ts)
export type EmployeesRaw = {
  employees: Employee[];
  monthLogs: MonthLog[];
  attendance: AttendanceStub[];
  leaves: { employee_id: number }[];
  emails: Record<number, string> | null;
  groups: Map<number, string>;
};
