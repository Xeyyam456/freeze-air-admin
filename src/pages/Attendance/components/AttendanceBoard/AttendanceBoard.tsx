import type { AttendanceBoardProps } from "@/types/attendance";
import { useAttendanceBoard } from "../../hooks/useAttendanceBoard";
import { AttendanceCalendar } from "../AttendanceCalendar";
import { BoardToolbar } from "../BoardToolbar";
import { EmployeeCards } from "../EmployeeCards";
import { EmployeeTable } from "../EmployeeTable";
import { ExportModal } from "../ExportModal";
import { TodayStats } from "../TodayStats";

// Davamiyyət bölməsi (admin-də /davamiyyet): ay seçimi + bütün ustaların cədvəli (iş günü, işdə [+bazar], icazəli, gəlmədi, bu gün).
// Sətrə klik → ustanın təqvimi və gəlmə/getmə saatları. Realtime ilə. meId verilsə öz sətrin birinci və "Sən" nişanlı.
// canMark (admin): bu gün gəlməyən ustanı "İşdə olmayıb" qeyd et / geri al (attendance_absences, 0065)
export function AttendanceBoard({ meId = null, canMark = false }: AttendanceBoardProps) {
  const b = useAttendanceBoard(meId);
  const list = { rows: b.rows, att: b.att, isCurrent: b.isCurrent, meId, canMark, busyId: b.busyId, onOpen: b.setOpen, onMark: b.mark };

  return (
    <div className="space-y-4">
      {b.open && <AttendanceCalendar employeeId={b.open.id} name={b.open.full_name} onClose={() => b.setOpen(null)} />}
      {b.exporting && b.emps && <ExportModal month={b.month} emps={b.emps} onClose={() => b.setExporting(false)} />}
      <BoardToolbar month={b.month} thisMonth={b.thisMonth} query={b.query} canExport={!!b.emps?.length}
        onMonth={b.setMonth} onQuery={b.setQuery} onExport={() => b.setExporting(true)} />
      {b.isCurrent && <TodayStats totals={b.totals} ready={!!b.att} />}
      <EmployeeCards {...list} />
      <EmployeeTable {...list} />
    </div>
  );
}
