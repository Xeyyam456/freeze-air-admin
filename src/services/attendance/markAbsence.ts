import { createClient } from "@/lib/supabase/client";

// Admin "işdə olmayıb" qeyd edir / geri alır (attendance_absences, 0065)
export async function markAbsence(employeeId: number, day: string, absent: boolean) {
  const table = createClient().from("attendance_absences");
  const { error } = absent ? await table.insert({ employee_id: employeeId, day }) : await table.delete().eq("employee_id", employeeId).eq("day", day);
  return error;
}
