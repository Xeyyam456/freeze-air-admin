import { createClient } from "@/lib/supabase/client";
import type { FeedComment, FeedGroup } from "@/types/feed";

// Paylaşımın şərhləri (köhnədən yeniyə): şərh + yazanın adı/şəkli
export async function fetchFeedComments(logId: number, group: FeedGroup): Promise<FeedComment[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("feed_comments").select("id, employee_id, body, created_at").eq("work_log_id", logId).eq("grp", group).order("created_at");
  if (error) throw error;
  const rows = data ?? [];
  if (!rows.length) return [];
  const { data: emps, error: e2 } = await supabase.from("employees").select("id, full_name, photo_url").in("id", [...new Set(rows.map((r) => r.employee_id))]);
  if (e2) throw e2;
  const byId = new Map((emps ?? []).map((e) => [e.id, e]));
  return rows.map((r) => ({ id: r.id, employeeId: r.employee_id, name: byId.get(r.employee_id)?.full_name ?? "—", photo: byId.get(r.employee_id)?.photo_url ?? null, body: r.body, at: r.created_at }));
}

// Şərh yaz (RLS: yalnız öz adından). Müəllifə və əvvəl yazanlara push getməsi bazada tetikleyicidir (0109/0111)
export async function addFeedComment(logId: number, group: FeedGroup, me: number, body: string): Promise<void> {
  const { error } = await createClient().from("feed_comments").insert({ work_log_id: logId, grp: group, employee_id: me, body: body.trim() });
  if (error) throw new Error(error.message);
}

// Şərhi sil (öz şərhi; rəhbərlik hamısını)
export async function deleteFeedComment(id: number): Promise<void> {
  const { error } = await createClient().from("feed_comments").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
