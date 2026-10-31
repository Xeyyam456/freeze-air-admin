import type { SelectableEmployee } from "@/types/employees";
import type { Crew } from "./Crew";

export type FreeEmployeesProps = { crews: Crew[]; employees: SelectableEmployee[] };
