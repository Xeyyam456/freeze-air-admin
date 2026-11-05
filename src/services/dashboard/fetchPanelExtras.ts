import { fetchAll } from "@/lib/fetchAll";
import { createClient } from "@/lib/supabase/client";
import { fetchGroupMap } from "@/services/jobs/fetchGroupMap";

const PLACE = "place_text, stores(name, companies(name)), companies(name)";

// Panel dashboard-unun əlavə məlumatı (bugünkü tapşırıqlar və ayın işləri ayrı sorğulardadır):
// son 30 günün işləri (qrafik, sütunlar, "Son işlər" cədvəli), şirkətlər üzrə ayın işləri (donut),
// keçən ayın eyni dövrü (müqayisə), bu gün işdə olanlar, bu ay və keçən ayın depo hərəkətləri.
// Tarixlər "YYYY-MM-DD" (Bakı); prevTo — keçən ayın bu günə uyğun günü.
export async function fetchPanelExtras(today: string, from30: string, monthStart: string, prevStart: string, prevTo: string) {
  const supabase = createClient();
  const rows = <T,>(r: { data: T[] | null }) => r.data ?? [];

  const [recent, groups30, monthPlaces, monthGroups, prevLogs, prevGroups, attendance, moves] = await Promise.all([
    fetchAll((a, b) => supabase.from("work_logs")
      .select(`id, work_date, created_at, employees(full_name, photo_url), ${PLACE}`)
      .gte("work_date", from30).lte("work_date", today).order("created_at", { ascending: false }).range(a, b)),
    fetchGroupMap(from30, today),
    fetchAll((a, b) => supabase.from("work_logs").select(`id, ${PLACE}`).gte("work_date", monthStart).lte("work_date", today).order("id").range(a, b)),
    fetchGroupMap(monthStart, today),
    fetchAll((a, b) => supabase.from("work_logs").select("id").gte("work_date", prevStart).lte("work_date", prevTo).order("id").range(a, b)),
    fetchGroupMap(prevStart, prevTo),
    supabase.from("attendance").select("employee_id, checked_in_at, checked_out_at, employees(full_name, photo_url)").eq("day", today).then(rows),
    fetchAll((a, b) => supabase.from("stock_movements").select("id, at")
      .gte("at", `${from30 < prevStart ? from30 : prevStart}T00:00:00+04:00`).lte("at", `${today}T23:59:59.999+04:00`).order("id").range(a, b)),
  ]);

  return { recent, groups30, monthPlaces, monthGroups, prevLogs, prevGroups, attendance, moves };
}
