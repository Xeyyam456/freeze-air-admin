import type { LeaveFilter } from "./LeaveFilter";
import type { LeavePerson } from "./LeavePerson";
import type { LeaveRow } from "./LeaveRow";

export type HistorySectionProps = {
  people: LeavePerson[];
  filter: LeaveFilter;
  who: number | null;
  counts: Record<LeaveFilter, number>;
  total: number;
  byMonth: [string, LeaveRow[]][];
  closed: LeaveRow[];
  onFilter: (f: LeaveFilter) => void;
  onWho: (id: number | null) => void;
  onRemove: (ids: number[]) => Promise<void>;
};
