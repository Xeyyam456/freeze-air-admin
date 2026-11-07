import { createClient } from "@/lib/supabase/client";
import { isReaction } from "@/pages/Feed/constants/reactions";
import type { FeedComment, FeedGroup, Reaction } from "@/types/feed";

// Paylaşımın şərhləri (köhnədən yeniyə): şərh + yazanın adı/şəkli
export async function fetchFeedComments(logId: number, group: FeedGroup, me: number | null): Promise<FeedComment[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("feed_comments").select("id, employee_id, body, created_at").eq("work_log_id", logId).eq("grp", group).order("created_at");
  if (error) throw error;
  const rows = data ?? [];
  if (!rows.length) return [];
  const { data: emps, error: e2 } = await supabase.from("employees").select("id, full_name, photo_url").in("id", [...new Set(rows.map((r) => r.employee_id))]);
  if (e2) throw e2;
  const byId = new Map((emps ?? []).map((e) => [e.id, e]));
  const { data: rx } = await supabase.from("feed_comment_reactions").select("comment_id, employee_id, kind").in("comment_id", rows.map((r) => r.id));
  const counts = new Map<number, FeedComment["reactions"]>();
  const mine = new Map<number, Reaction>();
  for (const k of rx ?? []) {
    const kind: Reaction = isReaction(k.kind) ? k.kind : "up";
    const c = counts.get(k.comment_id) ?? {};
    c[kind] = (c[kind] ?? 0) + 1;
    counts.set(k.comment_id, c);
    if (k.employee_id === me) mine.set(k.comment_id, kind);
  }
  return rows.map((r) => ({ id: r.id, employeeId: r.employee_id, name: byId.get(r.employee_id)?.full_name ?? "—", photo: byId.get(r.employee_id)?.photo_url ?? null, body: r.body, at: r.created_at, reactions: counts.get(r.id) ?? {}, mine: mine.get(r.id) ?? null }));
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

// Şərhə reaksiya: kind = null → geri götür; növ → seç (başqası seçilibsə əvəzlənir). RLS: yalnız öz adından
export async function setCommentReaction(commentId: number, me: number, kind: Reaction | null): Promise<void> {
  const supabase = createClient();
  const { error } = kind
    ? await supabase.from("feed_comment_reactions").upsert({ comment_id: commentId, employee_id: me, kind }, { onConflict: "comment_id,employee_id" })
    : await supabase.from("feed_comment_reactions").delete().match({ comment_id: commentId, employee_id: me });
  if (error) throw new Error(error.message);
}
