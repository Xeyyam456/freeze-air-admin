import type { fetchTasks } from "@/services/tasks/fetchTasks";

// Günün tapşırıqları, aktiv ustalar (ixtisas növ ilə), briqadalar
export type TasksData = Awaited<ReturnType<typeof fetchTasks>>;
