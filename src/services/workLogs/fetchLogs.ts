import { fetchAll } from "@/lib/fetchAll";
import { createClient } from "@/lib/supabase/client";

export const LOGS_LIMIT = 10_000; // 1000-lik hissələrlə yüklənir (fetchAll); bundan çoxunda xəbərdarlıq

// Aralığın görülən işləri (yeni əvvəl)
export async function fetchLogs(from: string, to: string) {
  return fetchAll((a, b) => createClient()
    .from("work_logs")
    .select("id, work_date, created_at, description, place_text, employee_id, company_id, employees(full_name, photo_url), stores(name, code, company_id, companies(name)), companies(name), work_files(kind)")
    .gte("work_date", from).lte("work_date", to)
    .order("work_date", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(a, b), LOGS_LIMIT);
}

// Süzgəc siyahıları: ustalar (rəhbərlik yox), şirkət/marketlər
export async function fetchFilters() {
  const supabase = createClient();
  const [employees, companies] = await Promise.all([
    supabase.from("employees").select("id, full_name, photo_url, specialty").eq("is_management", false).order("full_name").then((r) => r.data ?? []),
    supabase.from("companies").select("id, name, kind").order("name").then((r) => r.data ?? []),
  ]);
  return { employees, companies };
}
