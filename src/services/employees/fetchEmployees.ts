import { listAccountEmails } from "@/actions/accounts";
import { fetchAll } from "@/lib/fetchAll";
import { fetchGroupMap } from "@/lib/jobs";
import { createClient } from "@/lib/supabase/client";
import { todayBaku } from "@/shared/utils/todayBaku";
import type { EmployeesRaw } from "@/types/employees";

// Ustalar səhifəsinin xam məlumatı: ustalar, bu ayın işləri, bu günün davamiyyəti və icazələri, giriş hesabları
export async function fetchEmployees(admin: boolean): Promise<EmployeesRaw> {
  const supabase = createClient();
  const today = todayBaku();
  const monthStart = `${today.slice(0, 8)}01`;
  const [{ data: employees }, monthLogs, { data: attendance }, { data: leaves }, emails, groups] = await Promise.all([
    supabase.from("employees").select("*").eq("is_management", false).eq("is_active", true).order("full_name"),
    // Bu ayın işləri: kartda "bu gün" və "bu ay" sayı; ayda 1000-dən çox iş ola bilər: hissələrlə (fetchAll)
    fetchAll((a, b) => supabase.from("work_logs").select("id, employee_id, work_date").gte("work_date", monthStart).order("id").range(a, b)),
    // Bu günün davamiyyəti (gündə bir neçə seans ola bilər) və təsdiqlənmiş icazələr
    supabase.from("attendance").select("employee_id, checked_in_at, checked_out_at").eq("day", today),
    supabase.from("leave_requests").select("employee_id").eq("status", "approved").lte("date_from", today).gte("date_to", today),
    // Ustaların giriş hesabları (e-poçt): yalnız admin görür, Edge Function verir
    admin ? listAccountEmails() : Promise.resolve(null),
    fetchGroupMap(monthStart),
  ]);
  return { employees: employees ?? [], monthLogs, attendance: attendance ?? [], leaves: leaves ?? [], emails, groups };
}
