import type { Task } from "./Task";
import type { TaskEmployee } from "./TaskEmployee";

export type WithdrawModalProps = { task: Task; employees: TaskEmployee[]; onClose: () => void };
