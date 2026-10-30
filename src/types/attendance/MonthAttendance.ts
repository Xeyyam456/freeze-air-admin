import type { DayStatus } from "./DayStatus";
import type { Presence } from "./Presence";

export type MonthAttendance = {
  workdays: number;
  present: number;
  leave: number;
  absent: number;
  leaveTimes: number;
  extra: number;
  today: { status: DayStatus; presence: Presence | null };
  pendingLeave: number;
};
