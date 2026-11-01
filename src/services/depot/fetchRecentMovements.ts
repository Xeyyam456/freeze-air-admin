import { createClient } from "@/lib/supabase/client";
import type { Movement } from "@/types/depot";

// Depo jurnalının son hərəkətləri (ustanın adı ilə)
export async function fetchRecentMovements(limit: number): Promise<Movement[]> {
  const { data } = await createClient().from("stock_movements").select("*, employees(full_name)").order("at", { ascending: false }).limit(limit);
  return (data ?? []) as Movement[];
}
