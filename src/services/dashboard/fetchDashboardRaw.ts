import { createClient } from "@/lib/supabase/client";
import { localDate } from "@/shared/utils/localDate";

// Panelin bugünkü xam məlumatı: depoda azalanlar, aktiv işçilər, bugünkü tapşırıqlar (hesablama pages/Home/utils/dashboardView.ts)
export async function fetchDashboardRaw() {
  const supabase = createClient();
  const today = localDate();

  const [stockRows, employees, taskRows] = await Promise.all([
    // Minimum qalıq həddi olan alət/materiallar (həddə çatanlar view-da süzülür): paneldə xəbərdarlıq
    supabase.from("tool_stock").select("id, name, kind, unit, available, pieces_total, min_stock").not("min_stock", "is", null)
      .then((r) => r.data ?? []),
    supabase.from("employees").select("id, full_name, photo_url, is_management").eq("is_active", true).order("full_name")
      .then((r) => r.data ?? []),
    // Bugünkü tapşırıqlar (görülənlər də daxil, geri alınanlar yox); qrup tapşırığı bir sətir olur
    supabase.from("tasks").select("id, done, group_id, employees(full_name, photo_url)")
      .eq("task_date", today).is("cancelled_at", null).limit(200)
      .then((r) => r.data ?? []),
  ]);

  return { stockRows, employees, taskRows };
}
