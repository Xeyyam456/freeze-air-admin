import type { LeavePerson } from "./LeavePerson";
import type { LeaveRow } from "./LeaveRow";

export type LeavesView = {
  pending: LeaveRow[];
  now: LeaveRow[];
  upcoming: LeaveRow[];
  history: LeaveRow[];
  yearDays: Map<number, number>;
  people: LeavePerson[];
};
