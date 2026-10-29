import type { Task } from "./Task";
import type { TaskEmployee } from "./TaskEmployee";

export type WithdrawGroupModalProps = { rows: Task[]; employees: TaskEmployee[]; onClose: () => void };
