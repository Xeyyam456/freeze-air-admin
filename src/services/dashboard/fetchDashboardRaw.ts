import { fetchFileCounts, fetchGroupMap } from "@/lib/jobs";
import { createClient } from "@/lib/supabase/client";
import { localDate } from "@/shared/utils/localDate";

// Panelin xam məlumatı: sayğaclar, depo, ustalar, bugünkü işlər və tapşırıqlar (hesablama pages/Home/utils/dashboardView.ts-dədir)
export async function fetchDashboardRaw() {
  const supabase = createClient();
  const head = { count: "exact", head: true } as const;
  const n = (r: { count: number | null }) => r.count ?? 0;
  const today = localDate();

  const [stockRows, companies, branches, markets, shops, toolRows, employees, logs, todayLogs, todayGroups, taskRows] = await Promise.all([
    // Minimum qalıq həddi olan alət/materiallar (həddə çatanlar view-da süzülür): paneldə xəbərdarlıq
    supabase.from("tool_stock").select("id, name, kind, unit, available, pieces_total, min_stock").not("min_stock", "is", null)
      .then((r) => r.data ?? []),
    supabase.from("companies").select("*", head).eq("kind", "company").then(n),
    supabase.from("stores").select("*, companies!inner(kind)", head).eq("companies.kind", "company").then(n),
    supabase.from("companies").select("*", head).eq("kind", "market").then(n),
    supabase.from("stores").select("*, companies!inner(kind)", head).eq("companies.kind", "market").then(n),
    // Depo: ədədlərin cəmi və ustalardakı hissə
    supabase.from("tool_stock").select("quantity, given_out").eq("kind", "tool").then((r) => r.data ?? []),
    supabase.from("employees").select("id, full_name, photo_url, specialty, is_management, is_active").eq("is_active", true).order("full_name")
      .then((r) => r.data ?? []),
    supabase.from("work_logs") // yalnız bugünkü işlər (istifadəçi, 2026-10-29: "bu gün yoxdursa heç nə göstərməsin")
      .select("id, work_date, created_at, description, place_text, employee_id, employees(full_name, photo_url), stores(name, code, companies(name)), companies(name)")
      .eq("work_date", today).order("created_at", { ascending: false }).limit(16)
      .then((r) => r.data ?? []),
    supabase.from("work_logs").select("id, employee_id").eq("work_date", today).then((r) => r.data ?? []),
    fetchGroupMap(today, today),
    // Bugünkü tapşırıqlar (görülənlər də daxil, geri alınanlar yox; ustaya görə qruplu)
    supabase.from("tasks")
      .select("id, done, reason, place_text, group_id, employees(full_name, photo_url), stores(name, code, companies(name)), companies(name)")
      .eq("task_date", today).is("cancelled_at", null).order("employee_id").order("created_at").limit(100)
      .then((r) => r.data ?? []),
  ]);

  // Qrup xəritəsi və fayl nişanları (▶ Video / şəkil / akt) paralel: ardıcıl gözləmə olmasın
  const [recentGroups, logFiles] = await Promise.all([
    fetchGroupMap(logs.at(-1)?.work_date),
    fetchFileCounts(logs.map((l) => l.id)),
  ]);

  return { stockRows, companies, branches, markets, shops, toolRows, employees, logs, todayLogs, todayGroups, taskRows, recentGroups, logFiles };
}
