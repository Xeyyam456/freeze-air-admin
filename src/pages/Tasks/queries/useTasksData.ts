import { useData } from "@/lib/useData";
import { fetchTasks } from "@/services/tasks/fetchTasks";

// "tasks-day": lib/revalidate.ts → LIVE.tasks bunu canlı yeniləyir
export const TASKS_DAY_KEY = "tasks-day";

export const useTasksData = (day: string) => useData(TASKS_DAY_KEY, () => fetchTasks(day), [day]);
