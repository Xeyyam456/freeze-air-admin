import { norm } from "@/shared/utils/norm";
import type { AttendanceEmployee } from "@/types/attendance";

// Ad/ixtisas üzrə axtarış; "Sən" (meId) birinci
export function filterEmployees(emps: AttendanceEmployee[], query: string, meId: number | null) {
  const words = norm(query).split(/\s+/).filter(Boolean);
  return emps
    .filter((e) => words.every((w) => norm(`${e.full_name} ${e.specialty}`).includes(w)))
    .sort((a, b) => Number(b.id === meId) - Number(a.id === meId));
}
