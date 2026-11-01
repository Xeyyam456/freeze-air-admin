import { createClient } from "@/lib/supabase/client";
import type { LossRow } from "@/types/depot";

// Təsdiqlənmiş silinmə aktları (Excel hesabatı üçün)
export async function fetchLosses(): Promise<LossRow[]> {
  const { data } = await createClient().from("depot_requests")
    .select("tool_id, tool_name, tool_kind, unit, quantity, reason, note, employee_id, created_by_name, decided_by_name, decided_at")
    .eq("type", "writeoff").eq("status", "approved").order("decided_at", { ascending: false });
  return (data ?? []) as LossRow[];
}
