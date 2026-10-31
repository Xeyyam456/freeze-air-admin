import type { SelectableEmployee } from "@/types/employees";
import type { Crew } from "./Crew";

export type CrewsModalProps = { employees: SelectableEmployee[]; crews: Crew[]; draft?: number[]; onClose: () => void };
