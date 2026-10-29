import type { Task } from "./Task";
import type { TaskEmployee } from "./TaskEmployee";

export type AddMemberModalProps = { task: Task; members: number[]; employees: TaskEmployee[]; onClose: () => void };
