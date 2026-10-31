import type { Employee } from "@/types/employees";

export type ManagersData = { managers: Employee[]; emails: Record<number, string> | null };
