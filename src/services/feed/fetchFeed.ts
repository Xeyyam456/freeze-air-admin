import { createClient } from "@/lib/supabase/client";
import type { FeedFile, FeedGroup, FeedPost } from "@/types/feed";
import { fetchFeedMeta } from "./feedMeta";

// İş lenti: work_files + iş qeydi + usta + yer. "work" qrupu şəkil və video, "act" qrupu aktlar (mobil "Qruplar" ilə eyni).
// Son 300 fayl, yeni üstdə; bir iş qeydinin faylları bir kartda toplanır. Bucket gizlidir → imzalı linklər (1 saat), bir sorğuda.
// Reaksiya, şərh sayı və "birlikdə" ustalar: feedMeta
export async function fetchFeed(group: FeedGroup, me: number | null): Promise<FeedPost[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("work_files")
    .select("id, kind, path, created_at, work_log_id, work_logs(id, employee_id, description, place_text, employees(full_name, photo_url), stores(code, name, companies(name)), companies(name))")
    .in("kind", group === "act" ? ["act"] : ["photo", "video"])
    .order("created_at", { ascending: false }).limit(300);
  if (error) throw error;
  const rows = data ?? [];
  const { data: signed } = rows.length ? await supabase.storage.from("work").createSignedUrls(rows.map((r) => r.path), 3600) : { data: [] };

  const posts = new Map<number, FeedPost>();
  rows.forEach((r, i) => {
    const l = r.work_logs;
    if (!l) return;
    const file: FeedFile = { id: r.id, kind: r.kind as FeedFile["kind"], path: r.path, url: signed?.[i]?.signedUrl ?? undefined };
    const found = posts.get(l.id);
    if (found) { found.files.push(file); return; }
    posts.set(l.id, {
      logId: l.id, employeeId: l.employee_id, at: r.created_at,
      name: l.employees?.full_name ?? "", photo: l.employees?.photo_url ?? null,
      place: l.stores ? `${l.stores.code} ${l.stores.name}` : l.companies?.name ?? l.place_text ?? "Yer yazılmayıb",
      company: l.stores?.companies?.name ?? null, description: l.description, files: [file],
      up: 0, down: 0, mine: null, comments: 0, partners: [],
    });
  });
  const meta = await fetchFeedMeta(group, new Map([...posts.values()].map((p) => [p.logId, p.employeeId])), me);
  return [...posts.values()].map((p) => {
    const r = meta.reactions.get(p.logId);
    return { ...p, files: p.files.reverse(), up: r?.up ?? 0, down: r?.down ?? 0, mine: r?.mine ?? null, comments: meta.comments.get(p.logId) ?? 0, partners: meta.partners.get(p.logId) ?? [] };
  });
}
