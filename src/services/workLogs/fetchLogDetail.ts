import { createClient } from "@/lib/supabase/client";

// İş qeydinin ətraflısı; tapılmadısa undefined (null = hələ yüklənir)
export async function fetchLogDetail(id: number) {
  const supabase = createClient();
  const { data } = await supabase
    .from("work_logs")
    .select(`id, work_date, created_at, description, place_text,
      employees(full_name, photo_url, specialty),
      stores(code, name, address, lat, lng, companies(name)),
      companies(name, address, lat, lng),
      work_files(id, kind, path),
      tasks(reason, note, group_id),
      work_log_materials(id, amount, tools(name, unit))`)
    .eq("id", id)
    .maybeSingle();
  if (!data) return undefined; // tapılmadı (null = hələ yüklənir)

  // Qrup işi (0071): eyni tapşırığın bütün üzvləri; akt və şəkil yalnız bir üzvün iş qeydinə yüklənmiş ola bilər,
  // ona görə qrupun bütün iş qeydlərinin faylları göstərilir
  const groupId = data.tasks?.[0]?.group_id;
  const groupTasks = groupId
    ? ((await supabase.from("tasks").select("work_log_id, employees(full_name, photo_url, specialty)").eq("group_id", groupId).is("cancelled_at", null)).data ?? [])
    : [];
  const members = groupTasks.map((t) => t.employees).filter((e): e is NonNullable<typeof e> => !!e);
  const otherLogIds = groupTasks.map((t) => t.work_log_id).filter((x): x is number => x != null && x !== data.id);
  const moreFiles = otherLogIds.length
    ? ((await supabase.from("work_files").select("id, kind, path").in("work_log_id", otherLogIds)).data ?? [])
    : [];
  const allFiles = [...data.work_files, ...moreFiles];

  // Qapalı storage: fayllara 1 saatlıq imzalı link
  const paths = allFiles.map((f) => f.path);
  const urls = new Map<string, string>();
  if (paths.length) {
    const { data: signed } = await supabase.storage.from("work").createSignedUrls(paths, 3600);
    for (const s of signed ?? []) if (s.path && s.signedUrl) urls.set(s.path, s.signedUrl);
  }
  return { ...data, members, files: allFiles.map((f) => ({ ...f, url: urls.get(f.path) })) };
}
