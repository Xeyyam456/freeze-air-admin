import { fetchAll } from "@/lib/fetchAll";
import { createClient } from "@/lib/supabase/client";

// Qrup tapşırığı (0071) hər üzvə ayrıca iş qeydi yaradır, amma bu BİR işdir: ümumi saylarda bir dəfə sayılır.
// İş qeydi → qrup (tapşırığın `group_id`-si). Aralıq verilməsə hamısı (tapşırıq tarixi = iş tarixi).
export async function fetchGroupMap(from?: string, to?: string): Promise<Map<number, string>> {
  // 1000-lik hissələrlə (fetchAll): Supabase bir sorğuda 1000-dən çox qaytarmır
  const data = await fetchAll((a, b) => {
    let q = createClient().from("tasks").select("work_log_id, group_id").not("group_id", "is", null).not("work_log_id", "is", null);
    if (from) q = q.gte("task_date", from);
    if (to) q = q.lte("task_date", to);
    return q.order("id").range(a, b);
  });
  return new Map(data.map((t) => [t.work_log_id as number, t.group_id as string]));
}
