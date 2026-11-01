import { createClient } from "@/lib/supabase/client";

// Qrup tapşırığının üzvlərinin soyadları (bildiriş üçün)
export async function fetchGroupNames(groupId: string): Promise<string[]> {
  const { data } = await createClient().from("tasks").select("employees(full_name)").eq("group_id", groupId);
  return (data ?? []).map((x) => (x.employees as { full_name: string } | null)?.full_name.split(" ").slice(-1)[0]).filter((n): n is string => !!n);
}
