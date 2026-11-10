import { fetchAll } from "@/lib/fetchAll";
import { createClient } from "@/lib/supabase/client";

// Qrup tapşırığı (0071) hər üzvə ayrıca iş qeydi yaradır, amma bu BİR işdir: ümumi saylarda bir dəfə sayılır.
// İş qeydi → qrup (tapşırığın `group_id`-si). Aralıq İŞ tarixinə (work_logs.work_date) görədir, task_date-ə yox:
// sabaha planlanıb bu gün görülən tapşırığın task_date-i fərqlidir. Aralıq verilməsə hamısı.
export async function fetchGroupMap(from?: string, to?: string): Promise<Map<number, string>> {
  // 1000-lik hissələrlə (fetchAll): Supabase bir sorğuda 1000-dən çox qaytarmır
  const data = await fetchAll((a, b) => {
    let q = createClient().from("tasks").select("work_log_id, group_id, work_logs!inner(work_date)").not("group_id", "is", null).not("work_log_id", "is", null);
    if (from) q = q.gte("work_logs.work_date", from);
    if (to) q = q.lte("work_logs.work_date", to);
    return q.order("id").range(a, b);
  });
  return new Map(data.map((t) => [t.work_log_id as number, t.group_id as string]));
}
