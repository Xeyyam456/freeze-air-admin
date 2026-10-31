import { formatDateAz } from "@/shared/utils/formatDateAz";
import { timeOf } from "@/components/work/WorkLogModal";
import { toast } from "@/lib/toast";
import type { ExportInfo, WorkLog } from "@/types/workLogs";
import { placeOf } from "./logs";

// Rəngli, formatlı .xlsx: başlıq zolağı, xülasə sətri, donmuş başlıq, zebra, bölgülər, uzun mətn sarılır
export async function exportXlsx(logs: WorkLog[], info: ExportInfo) {
  const { default: writeXlsxFile } = await import("write-excel-file/browser");
  const NAVY = "#0b1324", BLUE = "#0a7ea4", LINE = "#d9dfeb", ZEBRA = "#f4f7fc", MUTED = "#667085";
  const cols = 5;
  const span = (value: string, style: Record<string, unknown>) => [{ value, columnSpan: cols, ...style }, ...Array(cols - 1).fill(null)];
  const days = new Set(logs.map((l) => l.work_date)).size;
  const masters = new Set(logs.map((l) => l.employee_id)).size;
  const places = new Set(logs.map(placeOf)).size;
  const filters = [`Tarix: ${formatDateAz(info.from)} – ${formatDateAz(info.to)}`, `Usta: ${info.employee}`, `Yer: ${info.company}`, info.query ? `Axtarış: "${info.query}"` : null].filter(Boolean).join("   ·   ");

  const border = { borderColor: LINE, borderStyle: "thin" as const };
  const head = (value: string, align: "left" | "center" = "left") => ({ value, fontWeight: "bold" as const, textColor: "#ffffff", backgroundColor: BLUE, align, alignVertical: "center" as const, height: 24, ...border });

  const data = [
    span("Freeze Air Service — Görülən işlər", { fontWeight: "bold", fontSize: 16, textColor: "#ffffff", backgroundColor: NAVY, alignVertical: "center", height: 34, indent: 1 }),
    span(filters, { fontSize: 10, textColor: MUTED, alignVertical: "center", height: 20, indent: 1 }),
    span(`İş sayı: ${logs.length}     İş görülən gün: ${days}     Usta: ${masters}     Fərqli yer: ${places}`, { fontWeight: "bold", textColor: BLUE, backgroundColor: "#e3f3f8", alignVertical: "center", height: 26, indent: 1 }),
    Array(cols).fill(null),
    [head("Tarix", "center"), head("Saat", "center"), head("Usta"), head("İş yeri"), head("Görülən iş")],
    ...logs.map((l, i) => {
      const bg = i % 2 ? { backgroundColor: ZEBRA } : {};
      const [y, m, d] = l.work_date.split("-").map(Number);
      const base = { alignVertical: "top" as const, ...bg, ...border };
      return [
        { ...base, value: new Date(Date.UTC(y, m - 1, d)), type: Date, format: "dd.mm.yyyy", align: "center" as const },
        { ...base, value: timeOf(l.created_at), align: "center" as const, textColor: MUTED },
        { ...base, value: l.employees?.full_name ?? "—", fontWeight: "bold" as const },
        { ...base, value: placeOf(l), textColor: BLUE, wrap: true },
        { ...base, value: l.description ?? "", wrap: true },
      ];
    }),
    [{ value: "Cəmi", columnSpan: 4, fontWeight: "bold" as const, align: "right" as const, backgroundColor: "#e3f3f8", ...border }, null, null, null, { value: `${logs.length} iş`, fontWeight: "bold" as const, textColor: BLUE, backgroundColor: "#e3f3f8", ...border }],
  ];

  await writeXlsxFile(data, {
    sheet: "Görülən işlər",
    columns: [{ width: 13 }, { width: 8 }, { width: 26 }, { width: 38 }, { width: 70 }],
    stickyRowsCount: 5,
    showGridLines: false,
    orientation: "landscape",
  }, { fontFamily: "Calibri", fontSize: 11 }).toFile(`isler-${info.from}_${info.to}.xlsx`);
  toast.success(`${logs.length} iş Excel fayla yazıldı`);
}
