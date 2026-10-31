import type { EmployeesData, EmployeesRaw } from "@/types/employees";
import { buildPartners } from "./buildPartners";
import { buildStatus } from "./buildStatus";
import { countWork } from "./countWork";

// Xam məlumatdan kartların göstərdiyi say, vəziyyət və tərəfdaşlar
export function employeesView(raw: EmployeesRaw, today: string): EmployeesData {
  const { employees, monthLogs } = raw;
  const shortName = (id: number) => employees.find((e) => e.id === id)?.full_name.split(" ").slice(-1)[0] ?? "—";
  return {
    employees,
    ...countWork(monthLogs, today),
    status: buildStatus(employees, raw.attendance, raw.leaves, today),
    partners: buildPartners(monthLogs, raw.groups, shortName, today),
    emails: raw.emails,
  };
}
