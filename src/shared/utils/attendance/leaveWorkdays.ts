import type { LeaveDates } from "@/types/attendance";

// İcazənin iş günlərinin sayı (bazarlar sayılmır)
export function leaveWorkdays(l: LeaveDates) {
  let n = 0;
  for (let d = new Date(`${l.date_from}T12:00:00Z`); d <= new Date(`${l.date_to}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) {
    if (d.getUTCDay() !== 0) n += 1;
  }
  return n;
}
