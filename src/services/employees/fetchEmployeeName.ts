import { createClient } from "@/lib/supabase/client";

// Bildirişlər üçün əməkdaşın tam adı
export async function fetchEmployeeName(id: number): Promise<string | null> {
  const { data } = await createClient().from("employees").select("full_name").eq("id", id).maybeSingle();
  return data?.full_name ?? null;
}
