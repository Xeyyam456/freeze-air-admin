import type { LeaveRow } from "./LeaveRow";

export type HistoryRowProps = { leave: LeaveRow; onRemove: (ids: number[]) => Promise<void> };
