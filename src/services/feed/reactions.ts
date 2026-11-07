import { createClient } from "@/lib/supabase/client";
import type { FeedGroup, FeedLiker, Reaction } from "@/types/feed";

// Reaksiya: kind = null → geri götür; "up"/"down" → seç (başqası seçilibsə əvəzlənir). RLS: yalnız öz adından, öz paylaşımına yox
export async function setFeedReaction(logId: number, group: FeedGroup, me: number, kind: Reaction | null): Promise<void> {
  const supabase = createClient();
  const key = { work_log_id: logId, grp: group, employee_id: me };
  const { error } = kind
    ? await supabase.from("feed_likes").upsert({ ...key, kind }, { onConflict: "work_log_id,grp,employee_id" })
    : await supabase.from("feed_likes").delete().match(key);
  if (error) throw new Error(error.message);
}

// Reaksiya verənlər (vaxt sırası ilə): ad, şəkil, ixtisas/vəzifə, 👍/👎
export async function fetchFeedLikers(logId: number, group: FeedGroup): Promise<FeedLiker[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("feed_likes").select("employee_id, kind").eq("work_log_id", logId).eq("grp", group).order("created_at");
  if (error) throw error;
  const rows = data ?? [];
  if (!rows.length) return [];
  const { data: emps, error: e2 } = await supabase.from("employees").select("id, full_name, photo_url, position, specialty").in("id", rows.map((r) => r.employee_id));
  if (e2) throw e2;
  const byId = new Map((emps ?? []).map((e) => [e.id, e]));
  return rows.flatMap((r) => {
    const e = byId.get(r.employee_id);
    return e ? [{ id: r.employee_id, name: e.full_name, photo: e.photo_url, role: e.specialty ?? e.position, kind: (r.kind === "down" ? "down" : "up") as Reaction }] : [];
  });
}
