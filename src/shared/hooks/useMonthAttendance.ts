import { useData } from "@/lib/useData";
import { fetchMonthAttendance } from "@/services/attendance/fetchMonthAttendance";
import { todayBaku } from "@/shared/utils/todayBaku";
import { useAttendanceLive } from "./useAttendanceLive";

// Ayın davamiyyəti (bütün ustalar; standart bu ay), keşdə + canlı. Ay dəyişəndə köhnə ayın cavabı göstərilmir.
export function useMonthAttendance(month?: string) {
  const m = month ?? todayBaku().slice(0, 7);
  useAttendanceLive();
  const data = useData("month-attendance", async () => ({ month: m, d: await fetchMonthAttendance(m) }), [m]);
  return data?.month === m ? data.d : null;
}
