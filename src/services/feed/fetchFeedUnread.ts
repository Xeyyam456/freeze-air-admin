import { createClient } from "@/lib/supabase/client";
import type { FeedGroup } from "@/types/feed";
import { feedSince } from "./feedSeen";

// Oxunmamış hadisələr (hər qrup üçün): son baxışdan sonra başqalarının yüklədiyi fayl, verdiyi 👍/👎 və yazdığı şərh
export async function fetchFeedUnread(): Promise<Record<FeedGroup, number>> {
  const supabase = createClient();
  const { data: me } = await supabase.rpc("my_employee_id");
  const count = async (group: FeedGroup) => {
    const since = feedSince(group);
    const kinds = group === "act" ? ["act"] : ["photo", "video"];
    let files = supabase.from("work_files").select("id, work_logs!inner(employee_id)", { count: "exact", head: true }).gt("created_at", since).in("kind", kinds);
    let likes = supabase.from("feed_likes").select("work_log_id", { count: "exact", head: true }).eq("grp", group).gt("created_at", since);
    let comments = supabase.from("feed_comments").select("id", { count: "exact", head: true }).eq("grp", group).gt("created_at", since);
    if (me) {
      files = files.neq("work_logs.employee_id", me);
      likes = likes.neq("employee_id", me);
      comments = comments.neq("employee_id", me);
    }
    const [a, b, c] = await Promise.all([files, likes, comments]);
    return (a.count ?? 0) + (b.count ?? 0) + (c.count ?? 0);
  };
  const [work, act] = await Promise.all([count("work"), count("act")]);
  return { work, act };
}
