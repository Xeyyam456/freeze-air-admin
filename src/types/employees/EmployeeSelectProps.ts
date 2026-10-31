import type { SelectableEmployee } from "./SelectableEmployee";

export type EmployeeSelectProps = {
  value: number | null;
  onChange: (id: number | null) => void;
  employees: SelectableEmployee[];
  placeholder?: string;
  emptyLabel?: string;
  hint?: (id: number) => string | null;
};
