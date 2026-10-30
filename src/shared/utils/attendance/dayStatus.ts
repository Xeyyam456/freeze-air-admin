import type { DayStatus, Leave, Presence } from "@/types/attendance";
import { ATTENDANCE_START } from "./constants";
import { isWorkday } from "./isWorkday";

// Bir günün vəziyyəti (təsdiqlənmiş icazə işdə olmaqdan üstündür). marked: admin "işdə olmayıb" qeyd etdiyi günlər (0065)
export function dayStatus(d: string, today: string, presence: Map<string, Presence>, leaves: Leave[], marked: Set<string> = new Set()): DayStatus {
  const onLeave = leaves.some((l) => l.status === "approved" && l.date_from <= d && d <= l.date_to);
  if (!isWorkday(d)) return presence.has(d) ? "present" : "off"; // bazar: çağırılıb işə çıxıbsa işdədir
  if (d > today) return onLeave ? "leave" : "future";
  if (onLeave) return "leave";
  if (presence.has(d)) return "present";
  if (marked.has(d)) return "absent"; // admin qeyd edib: gün bitməmiş də gəlmədi sayılır
  if (d < ATTENDANCE_START) return "before"; // qeydi olmayan köhnə gün "gəlmədi" sayılmır
  return d < today ? "absent" : "pending";
}
