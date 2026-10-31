import type { SelectableEmployee } from "@/types/employees";
import type { Crew } from "./Crew";

export type CrewSelectProps = {
  crews: Crew[];
  peopleOf: (c: Crew) => SelectableEmployee[];
  selectedId: number | null;
  onPick: (c: Crew | null) => void;
  onManage: (create: boolean) => void;
};
