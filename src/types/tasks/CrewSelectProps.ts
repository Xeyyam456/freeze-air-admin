import type { SelectableEmployee } from "@/components/employees/EmployeeSelect";
import type { Crew } from "./Crew";

export type CrewSelectProps = {
  crews: Crew[];
  peopleOf: (c: Crew) => SelectableEmployee[];
  selectedId: number | null;
  onPick: (c: Crew | null) => void;
  onManage: (create: boolean) => void;
};
