import { createClient } from "@/lib/supabase/client";
import { isReaction } from "@/pages/Feed/constants/reactions";
import type { FeedGroup, FeedMeta } from "@/types/feed";

// Lent kartlarının əlavə məlumatı (paylaşımlar üçün bir dəfəyə): reaksiya sayları + mənim reaksiyam, şərh sayı,
// birlikdə işləyən ustalar (iş qeydinin tapşırıq qrupundakı digər üzvlər; ad və soyad). authors: iş qeydi id → müəllif əməkdaş id
export async function fetchFeedMeta(group: FeedGroup, authors: Map<number, number>, me: number | null): Promise<FeedMeta> {
  const supabase = createClient();
  const ids = [...authors.keys()];
  const meta: FeedMeta = { reactions: new Map(), comments: new Map(), partners: new Map() };
  if (!ids.length) return meta;

  const [likes, comments, mine] = await Promise.all([
    supabase.from("feed_likes").select("work_log_id, employee_id, kind").eq("grp", group).in("work_log_id", ids),
    supabase.from("feed_comments").select("work_log_id").eq("grp", group).in("work_log_id", ids),
    supabase.from("tasks").select("work_log_id, group_id").in("work_log_id", ids).not("group_id", "is", null),
  ]);
  for (const k of likes.data ?? []) {
    const r = meta.reactions.get(k.work_log_id) ?? { counts: {}, mine: null };
    const kind = isReaction(k.kind) ? k.kind : "up";
    r.counts[kind] = (r.counts[kind] ?? 0) + 1;
    if (k.employee_id === me) r.mine = kind;
    meta.reactions.set(k.work_log_id, r);
  }
  for (const c of comments.data ?? []) meta.comments.set(c.work_log_id, (meta.comments.get(c.work_log_id) ?? 0) + 1);

  const groupOf = new Map((mine.data ?? []).map((t) => [t.work_log_id as number, t.group_id as string]));
  const groups = [...new Set(groupOf.values())];
  if (!groups.length) return meta;
  const { data: members } = await supabase.from("tasks").select("group_id, employee_id").in("group_id", groups).is("cancelled_at", null);
  const { data: emps } = await supabase.from("employees").select("id, full_name").in("id", [...new Set((members ?? []).map((m) => m.employee_id))]);
  const name = new Map((emps ?? []).map((e) => [e.id, e.full_name]));
  for (const [logId, g] of groupOf) {
    const others = [...new Set((members ?? []).filter((m) => m.group_id === g && m.employee_id !== authors.get(logId)).map((m) => m.employee_id))];
    meta.partners.set(logId, others.map((id) => name.get(id)).filter((n): n is string => !!n));
  }
  return meta;
}
