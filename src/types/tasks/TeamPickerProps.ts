import type { SelectableEmployee } from "@/components/employees/EmployeeSelect";
import type { Crew } from "./Crew";

// hint: dropdown-da ustanın yanında yazı (məs. həmin gün neçə tapşırığı var)
export type TeamPickerProps = {
  employees: SelectableEmployee[];
  crews: Crew[];
  value: number[];
  onChange: (ids: number[]) => void;
  hint?: (id: number) => string | null;
};
