import type { SelectableEmployee } from "@/components/employees/EmployeeSelect";
import type { Crew } from "./Crew";
import type { CrewDraft } from "./CrewDraft";

export type CrewListProps = { crews: Crew[]; employees: SelectableEmployee[]; onEdit: (d: CrewDraft) => void };
