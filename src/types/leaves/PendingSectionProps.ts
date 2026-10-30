import type { LeaveRow } from "./LeaveRow";

export type PendingSectionProps = { items: LeaveRow[]; yearDays: Map<number, number>; onDecide: (id: number, approve: boolean) => void };
