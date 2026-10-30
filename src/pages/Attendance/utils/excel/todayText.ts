import { presenceText } from "@/shared/utils/attendance/presenceText";
import type { MonthAttendance } from "@/types/attendance";
import { MUTED, OK, RED, SLATE, VIOLET } from "./style";

// "Bu gün" sütunu (Davamiyyət səhifəsindəki həblə eyni mətn)
export function todayText(a: MonthAttendance): { v: string; color: string } {
  const p = a.today.presence;
  switch (a.today.status) {
    case "present": return p?.out ? { v: `İşi bitirib · ${presenceText(p)}`, color: "#111827" } : { v: `İşdədir · ${p ? presenceText(p) : ""}`, color: OK };
    case "leave": return { v: "İcazəlidir", color: VIOLET };
    case "absent": return { v: "İşdə olmayıb", color: RED };
    case "off": return { v: "Bazar: istirahət", color: SLATE };
    default: return { v: "Hələ gəlməyib", color: MUTED };
  }
}
