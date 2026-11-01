import { createClient } from "@/lib/supabase/client";

// İş qeydlərində yazılan material sərfi (usta götürəndən bəri)
export async function fetchLoggedUse(employeeId: number, toolId: number, since: string): Promise<number> {
  const { data } = await createClient().from("work_log_materials").select("amount, work_logs!inner(employee_id, work_date)")
    .eq("tool_id", toolId).eq("work_logs.employee_id", employeeId).gte("work_logs.work_date", since);
  return (data ?? []).reduce((s, x) => s + x.amount, 0);
}
