import type { EmployeeTasks } from "./EmployeeTasks";
import type { TaskActions } from "./TaskActions";

export type SingleTasksProps = { groups: EmployeeTasks[]; showTitle: boolean; count: number; actions: TaskActions };
