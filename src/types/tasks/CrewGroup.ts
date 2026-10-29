import type { TaskTeam } from "./TaskTeam";

// Eyni üzvlərdən ibarət qrup tapşırıqları (Xəyyam + Fərhad: 5 iş)
export type CrewGroup = { key: string; items: TaskTeam[]; ids: number[] };
