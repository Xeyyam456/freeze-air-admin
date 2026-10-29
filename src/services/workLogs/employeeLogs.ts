import { fetchFileCounts } from "@/lib/jobs";
import { createClient } from "@/lib/supabase/client";
import type { EmployeeLog } from "@/types/workLogs";

// Ustanın bir günün işləri (yeni əvvəl), fayllar imzalı linklə, qrup yoldaşının faylları nişan kimi
export async function fetchEmployeeLogs(employeeId: number, day: string): Promise<EmployeeLog[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("work_logs")
    .select("id, work_date, created_at, description, employee_id, store_id, company_id, place_text, stores(code, name, companies(name)), companies(name), work_files(id, kind, path)")
    .eq("employee_id", employeeId)
    .eq("work_date", day)
    .order("id", { ascending: false });

  const list = (data ?? []) as EmployeeLog[];
  // Qapalı storage: fayllara 1 saatlıq imzalı link
  const paths = list.flatMap((l) => l.work_files.map((f) => f.path));
  if (paths.length) {
    const { data: signed } = await supabase.storage.from("work").createSignedUrls(paths, 3600);
    const urlByPath = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));
    list.forEach((l) => l.work_files.forEach((f) => { f.url = urlByPath.get(f.path) ?? undefined; }));
  }
  // Qrup işi: fayl başqa üzvün qeydinə yüklənibsə, burada nişan kimi göstərilir (klik → iş pəncərəsi)
  const all = await fetchFileCounts(list.map((l) => l.id));
  for (const l of list) {
    const a = all.get(l.id);
    if (!a) continue;
    const own = (k: string) => l.work_files.filter((x) => x.kind === k).length;
    const rest = { act: Math.max(0, a.act - own("act")), photo: Math.max(0, a.photo - own("photo")), video: Math.max(0, a.video - own("video")) };
    if (rest.act + rest.photo + rest.video > 0) l.groupFiles = rest;
  }
  return list;
}

// İşi sil: əvvəl iş qeydi, sonra fayllar (silinmə alınmasa akt/şəkillər itməsin). Baza qaydası bloklasa xəta atılır:
// RLS silməyə icazə verməyəndə xəta yox, 0 sətir qaytarır, ona görə silinən sətir yoxlanır.
export async function deleteEmployeeLog(log: EmployeeLog) {
  const supabase = createClient();
  const { data: gone, error } = await supabase.from("work_logs").delete().eq("id", log.id).select("id");
  if (error) throw new Error(error.message);
  if (!gone?.length) throw new Error("İş silinmədi: icazə yoxdur.");
  if (log.work_files.length) await supabase.storage.from("work").remove(log.work_files.map((f) => f.path));
}

export async function myEmployeeId() {
  const { data } = await createClient().rpc("my_employee_id");
  return data ?? null;
}
