import type { EmployeeTasks } from "./EmployeeTasks";
import type { TaskActions } from "./TaskActions";

export type EmployeeTaskCardProps = EmployeeTasks & { actions: TaskActions };
