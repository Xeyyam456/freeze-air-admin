import { monthDays } from "@/shared/utils/monthDays";
import type { EmployeeMonth, ExportEmployee } from "@/types/attendance";
import { weekdayNo } from "../dates";
import { MARK } from "./marks";
import { border, head, sub, title, WEEK_SHORT, ZEBRA } from "./style";

// Gün-gün vərəqi: ustalar × ayın günləri (✓ işdə, İ icazəli, X gəlmədi, B bazar)
export function gridSheet(month: string, label: string, emps: ExportEmployee[], data: EmployeeMonth[]) {
  const days = monthDays(month);
  const C = days.length + 1;
  const rows = [
    title(C, `Gün-gün davamiyyət: ${label}`),
    sub(C, "✓ işdə · İ icazəli · X gəlmədi · B bazar (istirahət)"),
    Array(C).fill(null),
    [head("Usta", "left"), ...days.map((d) => head(`${Number(d.slice(8))}\n${WEEK_SHORT[weekdayNo(d)]}`))],
    ...emps.map((e, i) => [
      { value: e.full_name, fontWeight: "bold" as const, alignVertical: "center" as const, height: 22, ...(i % 2 ? { backgroundColor: ZEBRA } : {}), ...border },
      ...data[i].days.map(({ status }) => {
        const k = MARK[status];
        return {
          value: k.v, align: "center" as const, alignVertical: "center" as const, fontWeight: "bold" as const,
          textColor: k.color, ...(k.bg ? { backgroundColor: k.bg } : {}), ...border,
        };
      }),
    ]),
  ];
  return { data: rows, sheet: "Gün-gün", columns: [{ width: 24 }, ...days.map(() => ({ width: 5 }))], stickyRowsCount: 4, stickyColumnsCount: 1, showGridLines: false, orientation: "landscape" as const };
}
