import { toast } from "@/lib/toast";
import { fetchEmployeeMonth } from "@/services/attendance/fetchEmployeeMonth";
import { MONTHS_AZ } from "@/shared/utils/monthsAz";
import type { ExportEmployee } from "@/types/attendance";
import { gridSheet } from "./gridSheet";
import { summarySheet } from "./summarySheet";
import { writer } from "./style";

// Bütün ustalar: 1) Xülasə (hər usta bir sətir), 2) Gün-gün (ustalar × ayın günləri)
export async function exportAttendanceAll(month: string, emps: ExportEmployee[]) {
  if (emps.length === 0) return toast.error("Usta yoxdur.");
  const [y, m] = month.split("-").map(Number);
  const data = await Promise.all(emps.map((e) => fetchEmployeeMonth(e.id, month)));
  const label = `${MONTHS_AZ[m - 1]} ${y}`;
  const write = await writer();
  await write([summarySheet(month, label, emps, data), gridSheet(month, label, emps, data)], { fontFamily: "Calibri", fontSize: 11 }).toFile(`davamiyyet-${month}.xlsx`);
  toast.success(`${emps.length} ustanın davamiyyəti Excel fayla yazıldı`);
}
