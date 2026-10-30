import { presenceText } from "@/shared/utils/attendance/presenceText";
import type { MonthAttendance, TodayBadge } from "@/types/attendance";

// Bu günün vəziyyət həbi (yalnız cari ayda)
export function todayBadge(a: MonthAttendance): TodayBadge {
  const p = a.today.presence;
  switch (a.today.status) {
    case "present": return p?.out
      ? { text: `İşi bitirib · ${presenceText(p)}`, cls: "bg-bg text-ink" }
      : { text: `İşdədir · ${p ? presenceText(p) : ""}`, cls: "bg-ok-soft text-ok" };
    case "leave": return { text: "İcazəlidir", cls: "bg-violet-50 text-violet-700" };
    case "off": return { text: "Bazar: istirahət", cls: "bg-slate-200 text-slate-600" };
    case "absent": return { text: "İşdə olmayıb", cls: "bg-danger text-white" };
    default: return { text: "Hələ gəlməyib", cls: "bg-bg text-muted" };
  }
}
