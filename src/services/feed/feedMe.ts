import { createClient } from "@/lib/supabase/client";

// Lenti açan hesab: əməkdaş kartı (id, ad) və rəhbərlik/admin olub-olmadığı. Kartı olmayan (yalnız admin) hesab lenti görür və şərhləri silə bilər,
// amma reaksiya və şərh yaza bilmir (bazada RLS yalnız əməkdaş kartı olana icazə verir).
export async function fetchFeedMe(): Promise<{ id: number | null; name: string; moderator: boolean }> {
  const supabase = createClient();
  const [{ data: id }, { data: moderator }] = await Promise.all([supabase.rpc("my_employee_id"), supabase.rpc("is_management")]);
  if (!id) return { id: null, name: "", moderator: moderator === true };
  const { data: emp } = await supabase.from("employees").select("full_name").eq("id", id).maybeSingle();
  return { id, name: emp?.full_name ?? "", moderator: moderator === true };
}
