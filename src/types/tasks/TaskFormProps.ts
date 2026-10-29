import type { TasksData } from "./TasksData";

export type TaskFormProps = { data: TasksData | null; day: string; today: string; onDay: (day: string) => void };
