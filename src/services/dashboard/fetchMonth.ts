import { fetchAll } from "@/lib/fetchAll";
import { countJobs, fetchGroupMap } from "@/lib/jobs";
import { createClient } from "@/lib/supabase/client";
import type { MonthData, MonthLogRow } from "@/types/dashboard";

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

// Ayın bütün işləri (hamı ustalar) + əvvəlki ayın tam sayı (müqayisə üçün: 1-dən sonuna qədər)
export async function fetchMonth(y: number, m: number): Promise<MonthData> {
  const supabase = createClient();
  const days = new Date(y, m + 1, 0).getDate();
  const py = m === 0 ? y - 1 : y;
  const pm = m === 0 ? 11 : m - 1;
  const pdays = new Date(py, pm + 1, 0).getDate();
  const [cur, prev, masters, groups, prevGroups] = await Promise.all([
    // Ayda 1000-dən çox iş ola bilər: 1000-lik hissələrlə (fetchAll)
    fetchAll((a, b) => supabase.from("work_logs")
      .select("id, work_date, employee_id, place_text, store_id, company_id, employees(full_name, photo_url)")
      .gte("work_date", iso(y, m, 1)).lte("work_date", iso(y, m, days)).order("id").range(a, b)),
    fetchAll((a, b) => supabase.from("work_logs").select("id")
      .gte("work_date", iso(py, pm, 1)).lte("work_date", iso(py, pm, pdays)).order("id").range(a, b)),
    supabase.from("employees").select("id, full_name, photo_url").eq("is_management", false).eq("is_active", true),
    fetchGroupMap(iso(y, m, 1), iso(y, m, days)),
    fetchGroupMap(iso(py, pm, 1), iso(py, pm, pdays)),
  ]);
  return { key: `${y}-${m}`, logs: cur as MonthLogRow[], groups, prevCount: countJobs(prev, prevGroups), masters: masters.data ?? [] };
}
