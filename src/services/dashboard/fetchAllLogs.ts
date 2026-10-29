import { createClient } from "@/lib/supabase/client";

// Son 300 iş qeydi (yeni əvvəl)
export async function fetchAllLogs() {
  const { data } = await createClient()
    .from("work_logs")
    .select("id, work_date, created_at, description, place_text, employees(full_name, photo_url), stores(name, companies(name)), companies(name)")
    .order("work_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(300);
  return data ?? [];
}
