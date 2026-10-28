import { createClient } from "@/lib/supabase/client";
import type { Kind, Movement } from "@/types/depot";

export async function fetchJournal(kind: Kind, toolId?: number) {
  let q = createClient()
    .from("stock_movements")
    .select("*, employees(full_name)")
    .eq("tool_kind", kind)
    .order("at", { ascending: false })
    .limit(600);
  if (toolId) q = q.eq("tool_id", toolId);
  const { data } = await q;
  return (data ?? []) as Movement[];
}
