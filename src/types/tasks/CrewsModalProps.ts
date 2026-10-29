import type { SelectableEmployee } from "@/components/employees/EmployeeSelect";
import type { Crew } from "./Crew";

export type CrewsModalProps = { employees: SelectableEmployee[]; crews: Crew[]; draft?: number[]; onClose: () => void };
