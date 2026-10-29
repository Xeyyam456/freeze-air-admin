import type { Task } from "./Task";
import type { TaskEmployee } from "./TaskEmployee";

// Ustanın tək tapşırıqları
export type EmployeeTasks = { employee: TaskEmployee; items: Task[] };
