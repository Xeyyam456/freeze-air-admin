import type { LeaveRow } from "./LeaveRow";

export type PendingCardProps = { leave: LeaveRow; used: number; onDecide: (id: number, approve: boolean) => void };
