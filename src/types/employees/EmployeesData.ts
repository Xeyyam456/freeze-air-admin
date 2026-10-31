import type { Employee } from "./Employee";
import type { Partner } from "./Partner";
import type { PersonStatus } from "./PersonStatus";

// Səhifənin göstərdiyi məlumat
export type EmployeesData = {
  employees: Employee[];
  todayWork: Record<number, number>; // usta id → bu gün yazılan iş sayı
  monthWork: Record<number, number>; // usta id → bu ay yazılan iş sayı
  status: Record<number, PersonStatus>; // usta id → bu günkü davamiyyət vəziyyəti
  partners: Record<number, Partner[]>; // usta id → kimlərlə birlikdə iş görüb
  emails: Record<number, string> | null;
};
