import { workerTypeLabel } from "@/components/employees/EmployeeForms";
import { createClient } from "@/lib/supabase/client";
import { listCrews } from "./crews";

// Günün tapşırıqları (yer, iş qeydinin faylları ilə), aktiv ustalar (rəhbərlik yox), briqadalar
export async function fetchTasks(day: string) {
  const supabase = createClient();
  const [tasks, employees, crews] = await Promise.all([
    supabase.from("tasks")
      .select("id, employee_id, group_id, work_log_id, reason, done, done_at, note, place_text, store_id, company_id, cancelled_at, reassigned_to, stores(name, code, companies(name)), companies(name), work_logs(work_files(id, kind))")
      .eq("task_date", day).order("created_at").then((r) => r.data ?? []),
    supabase.from("employees").select("id, full_name, photo_url, specialty, worker_type").eq("is_management", false).eq("is_active", true).order("full_name")
      // Seçimdə ixtisasın önündə növ: "Köməkçi · Kondisioner ustası"
      .then((r) => (r.data ?? []).map((e) => ({ ...e, specialty: [workerTypeLabel(e.worker_type), e.specialty].filter(Boolean).join(" · ") }))),
    listCrews(),
  ]);
  // Geri alınıb başqasına verilənlər: yeni tapşırıq kimdədir ("Geri alınıb → Ad")
  const nextIds = tasks.flatMap((t) => (t.reassigned_to ? [t.reassigned_to] : []));
  const nextName = new Map<number, string>();
  if (nextIds.length) {
    const { data } = await supabase.from("tasks").select("id, employees(full_name)").in("id", nextIds);
    for (const n of data ?? []) if (n.employees) nextName.set(n.id, n.employees.full_name);
  }
  return { tasks: tasks.map((t) => ({ ...t, nextName: t.reassigned_to ? nextName.get(t.reassigned_to) : undefined })), employees, crews };
}
