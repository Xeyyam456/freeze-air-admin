import type { Task } from "./Task";

// Bir qrup tapşırığı (bir group_id): bütün sətirlər və geri alınmamışlar
export type TaskTeam = { id: string; rows: Task[]; live: Task[] };
