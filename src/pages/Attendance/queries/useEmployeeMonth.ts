import { useData } from "@/lib/useData";
import { fetchEmployeeMonth } from "@/services/attendance/fetchEmployeeMonth";
import { useAttendanceLive } from "@/shared/hooks/useAttendanceLive";

// Ustanın ayı: keşdə + canlı (təqvimi təkrar açanda dərhal görünür). Ay dəyişəndə köhnə ayın cavabı göstərilmir.
export function useEmployeeMonth(employeeId: number, month: string) {
  useAttendanceLive();
  const data = useData("employee-month", async () => ({ month, d: await fetchEmployeeMonth(employeeId, month) }), [employeeId, month]);
  return data?.month === month ? data.d : null;
}
