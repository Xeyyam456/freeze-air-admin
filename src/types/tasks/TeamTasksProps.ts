import type { CrewGroup } from "./CrewGroup";
import type { TaskActions } from "./TaskActions";
import type { TaskEmployee } from "./TaskEmployee";

export type TeamTasksProps = { crews: CrewGroup[]; liveCount: number; employees: TaskEmployee[]; actions: TaskActions };
