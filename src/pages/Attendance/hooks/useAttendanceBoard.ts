import { useMemo, useState } from "react";
import { useMonthAttendance } from "@/shared/hooks/useMonthAttendance";
import { todayBaku } from "@/shared/utils/todayBaku";
import type { AttendanceEmployee } from "@/types/attendance";
import { useAttendanceEmployees } from "../queries/useAttendanceEmployees";
import { filterEmployees } from "../utils/filterEmployees";
import { todayTotals } from "../utils/todayTotals";
import { useAbsenceMark } from "./useAbsenceMark";

// Davamiyyət lövhəsinin vəziyyəti: ay, axtarış, açıq təqvim/Excel pəncərəsi, siyahı və bu günün sayları
export function useAttendanceBoard(meId: number | null) {
  const thisMonth = todayBaku().slice(0, 7);
  const [month, setMonth] = useState(thisMonth);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<AttendanceEmployee | null>(null);
  const [exporting, setExporting] = useState(false);
  const emps = useAttendanceEmployees();
  const att = useMonthAttendance(month);
  const { busyId, mark } = useAbsenceMark();

  const rows = useMemo(() => (emps ? filterEmployees(emps, query, meId) : null), [emps, query, meId]);
  const totals = useMemo(() => todayTotals(emps ?? [], att), [emps, att]);

  return { thisMonth, isCurrent: month === thisMonth, month, setMonth, query, setQuery, open, setOpen, exporting, setExporting, emps, att, rows, totals, busyId, mark };
}
