import { todayBaku } from "@/shared/utils/todayBaku";
import type { EmployeeMonth, ExportEmployee } from "@/types/attendance";
import { countToday } from "../countToday";
import { border, head, MUTED, note, OK, period, RED, SLATE, sub, title, VIOLET, ZEBRA } from "./style";
import { todayText } from "./todayText";

// Xülasə vərəqi: hər usta bir sətir (iş günü, işdə, icazə, icazəsiz, bazar, cari ayda "Bu gün")
export function summarySheet(month: string, label: string, emps: ExportEmployee[], data: EmployeeMonth[]) {
  const isCurrent = month === todayBaku().slice(0, 7);
  const C = isCurrent ? 11 : 10;
  // Yuxarıdakı zolaq səhifədəki kimi: cari ayda bu günün vəziyyəti (cəmlənmiş "işdə olub" günləri yox)
  const t = countToday(data.map((d) => d.summary));
  const todayLine = isCurrent
    ? `Bu gün (${todayBaku().split("-").reverse().join(".")}):  hazırda işdə ${t.here} · işi bitirib ${t.done} · icazəli ${t.leave} · hələ gəlməyib ${t.missing} · işdə olmayıb ${t.absent} · gözləyən icazə sorğusu ${t.pending}`
    : `Usta sayı: ${emps.length}`;
  const rows = [
    title(C, `Freeze Air Service — Davamiyyət: ${label}`),
    sub(C, period(month)),
    note(C, todayLine),
    Array(C).fill(null),
    [head("№"), head("Usta", "left"), head("İxtisas", "left"), head("İş günü"), head("İşdə olub (gün)"), head("İcazə aldı (dəfə)"),
      head("İcazəli (gün)"), head("İcazəsiz qalıb (gün)"), head("İşdə olmayıb, cəmi (gün)"), head("Bazar günü işə çıxıb (dəfə)"), ...(isCurrent ? [head("Bu gün", "left")] : [])],
    ...emps.map((e, i) => {
      const s = data[i].summary;
      const base = { alignVertical: "center" as const, height: 22, ...(i % 2 ? { backgroundColor: ZEBRA } : {}), ...border };
      const num = (v: number, color = "#111827") => ({ ...base, value: v, type: Number, align: "center" as const, fontWeight: "bold" as const, textColor: v ? color : MUTED });
      return [
        { ...base, value: i + 1, type: Number, align: "center" as const, textColor: MUTED },
        { ...base, value: e.full_name, fontWeight: "bold" as const },
        { ...base, value: e.specialty ?? "", textColor: MUTED },
        num(s.workdays), num(s.present, OK), num(s.leaveTimes, VIOLET), num(s.leave, VIOLET), num(s.absent, RED),
        num(s.leave + s.absent), num(s.extra, SLATE),
        ...(isCurrent ? [{ ...base, value: todayText(s).v, textColor: todayText(s).color, fontWeight: "bold" as const }] : []),
      ];
    }),
  ];
  const columns = [{ width: 5 }, { width: 26 }, { width: 22 }, ...Array(7).fill({ width: 13 }), ...(isCurrent ? [{ width: 34 }] : [])];
  return { data: rows, sheet: "Xülasə", columns, stickyRowsCount: 5, showGridLines: false, orientation: "landscape" as const };
}
