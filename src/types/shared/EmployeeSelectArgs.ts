import type { EmployeeSelectProps } from "@/types/employees";

export type EmployeeSelectArgs = Pick<EmployeeSelectProps, "value" | "onChange" | "employees" | "emptyLabel">;
