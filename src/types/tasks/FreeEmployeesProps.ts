import type { SelectableEmployee } from "@/components/employees/EmployeeSelect";
import type { Crew } from "./Crew";

export type FreeEmployeesProps = { crews: Crew[]; employees: SelectableEmployee[] };
