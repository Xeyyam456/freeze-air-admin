import type { LeaveDates } from "@/types/attendance";

// "21.10" / "21.10 – 23.10"
export function leaveRange(l: LeaveDates) {
  const f = (d: string) => `${d.slice(8, 10)}.${d.slice(5, 7)}`;
  return l.date_from === l.date_to ? f(l.date_from) : `${f(l.date_from)} – ${f(l.date_to)}`;
}
