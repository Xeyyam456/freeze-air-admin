import type { SelectableEmployee } from "@/types/employees";
import type { Crew } from "./Crew";

export type SelectedListProps = {
  selected: SelectableEmployee[];
  matching: Crew | undefined;
  matchingLabel: string | null;
  add: React.ReactNode;
  onRemove: (id: number) => void;
  onClear: () => void;
  onSaveCrew: () => void;
};
