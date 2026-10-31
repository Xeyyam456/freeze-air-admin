import { fetchAll } from "@/lib/fetchAll";
import { createClient } from "@/lib/supabase/client";
import type { FileCount } from "@/types/workLogs";
import type { LogPerson } from "@/types/workLogs";

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

// Eyni qrupun işləri bir açardır
export const jobKey = (id: number, groups: Map<number, string> | null | undefined) => groups?.get(id) ?? `l${id}`;

// Qrup işi bir say olmaqla iş sayı
export const countJobs = (logs: { id: number }[], groups: Map<number, string> | null | undefined) =>
  new Set(logs.map((l) => jobKey(l.id, groups))).size;

// İş qeydlərinin faylları (akt, şəkil, video) siyahıda nişan üçün. Qrup işində fayl istənilən üzvün qeydinə yüklənə bilər:
// qrupun bütün qeydlərinin faylları toplanır və hər üzvün qeydinə eyni say verilir (işi açmadan görünsün).
// Bir sorğu: baza funksiyası work_file_counts (0094).
export async function fetchFileCounts(logIds: number[]): Promise<Map<number, FileCount>> {
  if (!logIds.length) return new Map();
  const { data } = await createClient().rpc("work_file_counts", { p_log_ids: logIds });
  return new Map((data ?? []).map((r: { work_log_id: number } & FileCount) => [r.work_log_id, { act: r.act, photo: r.photo, video: r.video }]));
}

// Admin siyahılarında qrup işi BİR sətirdir: üzvlərin adları birləşir ("Xəyyam + Fərhad"), şəkil birincinindir.
// Sıra birinci qeydin yerini saxlayır. Ustanın öz hesabında (web) hər üzv öz işini görür, bura aid deyil.
export function mergeGroupLogs<T extends { id: number; employees: LogPerson }>(logs: T[], groups: Map<number, string> | null | undefined): T[] {
  if (!groups?.size) return logs;
  const out: T[] = [];
  const at = new Map<string, number>();
  for (const l of logs) {
    const g = groups.get(l.id);
    if (!g) { out.push(l); continue; }
    const i = at.get(g);
    if (i === undefined) { at.set(g, out.length); out.push(l); continue; }
    const first = out[i];
    const name = l.employees?.full_name;
    if (first.employees && name && !first.employees.full_name.split(" + ").includes(name)) {
      out[i] = { ...first, employees: { ...first.employees, full_name: `${first.employees.full_name} + ${name}` } };
    }
  }
  return out;
}
