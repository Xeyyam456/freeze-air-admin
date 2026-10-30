import type { AttRow } from "./AttRow";
import type { Leave } from "./Leave";

export type AttendanceRange = { att: AttRow[]; leaves: Leave[]; absences: { employee_id: number; day: string }[] };
