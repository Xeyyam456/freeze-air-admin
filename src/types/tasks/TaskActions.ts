import type { AddingTarget } from "./AddingTarget";
import type { Task } from "./Task";

// Siyahıdakı əməliyyatlar; past: keçmiş gün (yalnız baxış)
export type TaskActions = {
  past: boolean;
  onOpenLog: (logId: number) => void;
  onAdd: (a: AddingTarget) => void;
  onWithdraw: (t: Task) => void;
  onWithdrawGroup: (rows: Task[]) => void;
};
