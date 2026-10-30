import { monthDays } from "@/shared/utils/monthDays";
import { fullDate } from "../dates";

// Davamiyyətin Excel ixracı (write-excel-file 4.1.1, "Görülən işlər" ixracı ilə eyni üslub: tünd başlıq, mavi cədvəl başlığı,
// zebra, nazik haşiyələr)
export const NAVY = "#0a1a33", BLUE = "#1f6feb", LINE = "#d9dfeb", ZEBRA = "#f4f7fc", MUTED = "#667085", SOFT = "#eaf2fe";
export const OK = "#16a34a", VIOLET = "#7c3aed", RED = "#dc2626", SLATE = "#64748b";
export const WEEK_SHORT = ["B", "B.e", "Ç.a", "Ç", "C.a", "C", "Ş"];

export const border = { borderColor: LINE, borderStyle: "thin" as const };
export const head = (value: string, align: "left" | "center" = "center") =>
  ({ value, fontWeight: "bold" as const, textColor: "#ffffff", backgroundColor: BLUE, align, alignVertical: "center" as const, height: 30, wrap: true, ...border });
const span = (cols: number, value: string, style: Record<string, unknown>) => [{ value, columnSpan: cols, ...style }, ...Array(cols - 1).fill(null)];
export const title = (cols: number, value: string) => span(cols, value, { fontWeight: "bold", fontSize: 16, textColor: "#ffffff", backgroundColor: NAVY, alignVertical: "center", height: 34, indent: 1 });
export const sub = (cols: number, value: string) => span(cols, value, { fontSize: 10, textColor: MUTED, alignVertical: "center", height: 20, indent: 1 });
export const note = (cols: number, value: string) => span(cols, value, { fontWeight: "bold", textColor: BLUE, backgroundColor: SOFT, alignVertical: "center", height: 26, indent: 1 });

export function period(month: string) {
  const days = monthDays(month);
  return `Dövr: ${fullDate(days[0])} – ${fullDate(days[days.length - 1])} · iş həftəsi 6 gün (bazar istirahət)`;
}

export async function writer() {
  return (await import("write-excel-file/browser")).default;
}
