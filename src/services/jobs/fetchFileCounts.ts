import { createClient } from "@/lib/supabase/client";
import type { FileCount } from "@/types/workLogs";

// İş qeydlərinin faylları (akt, şəkil, video) siyahıda nişan üçün. Qrup işində fayl istənilən üzvün qeydinə yüklənə bilər:
// qrupun bütün qeydlərinin faylları toplanır və hər üzvün qeydinə eyni say verilir (işi açmadan görünsün).
// Bir sorğu: baza funksiyası work_file_counts (0094).
export async function fetchFileCounts(logIds: number[]): Promise<Map<number, FileCount>> {
  if (!logIds.length) return new Map();
  const { data } = await createClient().rpc("work_file_counts", { p_log_ids: logIds });
  return new Map((data ?? []).map((r: { work_log_id: number } & FileCount) => [r.work_log_id, { act: r.act, photo: r.photo, video: r.video }]));
}
