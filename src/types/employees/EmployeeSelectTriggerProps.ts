import type { RefObject } from "react";
import type { SelectableEmployee } from "./SelectableEmployee";

export type EmployeeSelectTriggerProps = {
  selected: SelectableEmployee | null;
  value: number | null;
  placeholder: string;
  emptyLabel?: string;
  open: boolean;
  btnRef: RefObject<HTMLButtonElement | null>;
  onToggle: () => void;
  onKey: (e: React.KeyboardEvent) => void;
};
