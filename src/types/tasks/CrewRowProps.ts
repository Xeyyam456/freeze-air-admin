import type { CrewGroup } from "./CrewGroup";
import type { TaskActions } from "./TaskActions";
import type { TaskEmployee } from "./TaskEmployee";

export type CrewRowProps = { crew: CrewGroup; employees: TaskEmployee[]; open: boolean; onToggle: () => void; actions: TaskActions };
