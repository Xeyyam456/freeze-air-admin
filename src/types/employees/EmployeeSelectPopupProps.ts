import type { RefObject } from "react";
import type { SelectableEmployee } from "./SelectableEmployee";
import type { SelectPos } from "./SelectPos";

export type EmployeeSelectPopupProps = {
  pos: SelectPos;
  listRef: RefObject<HTMLDivElement | null>;
  showSearch: boolean;
  query: string;
  options: (SelectableEmployee | null)[];
  value: number | null;
  active: number;
  emptyLabel?: string;
  hint?: (id: number) => string | null;
  onSearch: (q: string) => void;
  onKey: (e: React.KeyboardEvent) => void;
  onHover: (i: number) => void;
  onPick: (o: SelectableEmployee | null) => void;
};
