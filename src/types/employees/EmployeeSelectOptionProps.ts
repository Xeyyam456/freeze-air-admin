import type { SelectableEmployee } from "./SelectableEmployee";

export type EmployeeSelectOptionProps = {
  option: SelectableEmployee | null;
  index: number;
  selected: boolean;
  active: boolean;
  emptyLabel?: string;
  hint: string | null;
  onHover: (i: number) => void;
  onPick: (o: SelectableEmployee | null) => void;
};
