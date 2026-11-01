import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";

// Bütün təmir qeydləri (Excel hesabatı üçün)
export async function fetchRepairs(): Promise<Tables<"tool_repairs">[]> {
  const { data } = await createClient().from("tool_repairs").select("*").order("sent_at", { ascending: false });
  return data ?? [];
}
