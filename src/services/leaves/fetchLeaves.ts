import { createClient } from "@/lib/supabase/client";
import type { LeaveRow } from "@/types/leaves";

// İcazə sorğuları (son 300), ustanın adı və şəkli ilə
export async function fetchLeaves() {
  const { data } = await createClient()
    .from("leave_requests")
    .select("id, employee_id, date_from, date_to, reason, status, created_at, decided_at, employees(full_name, photo_url)")
    .order("created_at", { ascending: false })
    .limit(300);
  return (data ?? []) as LeaveRow[];
}
