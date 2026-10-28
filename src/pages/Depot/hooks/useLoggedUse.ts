import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// İş qeydlərində yazılan sərf (usta götürəndən bəri): material təhvilində və qaytarmasında yoxlama üçün.
// null: hesablanmayıb (material deyil və ya hələ yüklənir)
export function useLoggedUse(employeeId: number | null, toolId: number | null, takenAt: string | null, enabled = true) {
  const [n, setN] = useState<number | null>(null);
  useEffect(() => {
    if (!enabled || !employeeId || !toolId || !takenAt) return;
    let cancelled = false;
    createClient().from("work_log_materials").select("amount, work_logs!inner(employee_id, work_date)")
      .eq("tool_id", toolId).eq("work_logs.employee_id", employeeId).gte("work_logs.work_date", takenAt.slice(0, 10))
      .then(({ data }) => { if (!cancelled) setN((data ?? []).reduce((s, x) => s + x.amount, 0)); });
    return () => { cancelled = true; };
  }, [enabled, employeeId, toolId, takenAt]);
  return n;
}
