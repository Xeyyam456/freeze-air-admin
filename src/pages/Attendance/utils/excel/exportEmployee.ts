import { toast } from "@/lib/toast";
import { fetchEmployeeMonth } from "@/services/attendance/fetchEmployeeMonth";
import { durationText } from "@/shared/utils/attendance/durationText";
import { sessionNo } from "@/shared/utils/attendance/sessionNo";
import { MONTHS_AZ } from "@/shared/utils/monthsAz";
import { timeBaku } from "@/shared/utils/timeBaku";
import type { ExportEmployee } from "@/types/attendance";
import { WEEKDAY } from "../../constants/calendar";
import { weekdayNo } from "../dates";
import { STATUS_TEXT } from "./marks";
import { border, head, MUTED, note, period, SLATE, sub, title, writer, ZEBRA } from "./style";

// Bir usta: ayın hər günü (tarix, həftənin günü, vəziyyət, gəlmə, getmə, müddət) + yuxarıda xülasə
export async function exportAttendanceEmployee(month: string, emp: ExportEmployee) {
  const [y, m] = month.split("-").map(Number);
  const { summary: s, days } = await fetchEmployeeMonth(emp.id, month);
  const rows = days.filter((d) => d.status !== "future");
  if (rows.length === 0) return toast.error("Bu ay üçün hələ məlumat yoxdur.");
  const C = 6;
  const data = [
    title(C, `Freeze Air Service — ${emp.full_name}: davamiyyət, ${MONTHS_AZ[m - 1]} ${y}`),
    sub(C, period(month)),
    note(C, `İş günü: ${s.workdays}   İşdə: ${s.present}   İcazə: ${s.leaveTimes} dəfə (${s.leave} gün)   İcazəsiz: ${s.absent}   İşdə olmayıb, cəmi: ${s.leave + s.absent}   Bazar günü: ${s.extra}`),
    Array(C).fill(null),
    [head("Tarix"), head("Həftənin günü", "left"), head("Vəziyyət", "left"), head("Gəlmə"), head("Getmə"), head("Müddət")],
    ...rows.map(({ day, status, presence }, i) => {
      const st = STATUS_TEXT[status];
      const sunday = status === "off" || weekdayNo(day) === 0;
      const base = { alignVertical: "center" as const, height: 22 * Math.max(1, presence?.sessions.length ?? 1), ...(sunday ? { backgroundColor: "#f1f5f9" } : i % 2 ? { backgroundColor: ZEBRA } : {}), ...border };
      const [yy, mm, dd] = day.split("-").map(Number);
      return [
        { ...base, value: new Date(Date.UTC(yy, mm - 1, dd)), type: Date, format: "dd.mm.yyyy", align: "center" as const },
        { ...base, value: WEEKDAY[weekdayNo(day)], textColor: sunday ? SLATE : "#111827" },
        { ...base, value: st.v, textColor: st.color, fontWeight: "bold" as const },
        // Bir neçə seans (yenidən işə çıxıb): hər biri xananın içində ayrıca sətirdə
        { ...base, value: presence ? presence.sessions.map((x, j, all) => sessionNo(j, all.length) + timeBaku(x.in)).join("\n") : "", align: "center" as const, wrap: true },
        { ...base, value: presence ? presence.sessions.map((x, j, all) => sessionNo(j, all.length) + (x.out ? timeBaku(x.out) : "işdədir")).join("\n") : "", align: "center" as const, wrap: true, textColor: presence?.out ? "#111827" : MUTED },
        { ...base, value: presence ? durationText(presence) : "", align: "center" as const, textColor: MUTED },
      ];
    }),
  ];
  const write = await writer();
  await write(data, {
    sheet: `${MONTHS_AZ[m - 1]} ${y}`,
    columns: [{ width: 13 }, { width: 18 }, { width: 18 }, { width: 10 }, { width: 10 }, { width: 16 }],
    stickyRowsCount: 5, showGridLines: false,
  }, { fontFamily: "Calibri", fontSize: 11 }).toFile(`davamiyyet-${emp.full_name.replace(/\s+/g, "-")}-${month}.xlsx`);
  toast.success(`${emp.full_name}: davamiyyət Excel fayla yazıldı`);
}
