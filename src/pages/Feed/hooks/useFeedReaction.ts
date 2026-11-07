import { useCallback } from "react";
import { getQueryClient } from "@/lib/queryClient";
import { revalidate } from "@/lib/revalidate";
import { toast } from "@/lib/toast";
import { setFeedReaction } from "@/services/feed/reactions";
import { FEED_KEY, LIKERS_KEY } from "@/services/feed/keys";
import type { FeedGroup, FeedPost, Reaction, ReactFn } from "@/types/feed";

// Reaksiya (👍 👎 ❤️ 👏 🙏) — OPTİMİSTİK: say və seçim klik anında dəyişir (keş), baza arxada; xətada geri qayıdır.
// Eyni işarəyə təkrar klik geri götürür; digərinə klik əvəzləyir (bir usta bir paylaşıma bir reaksiya verir)
export function useFeedReaction(group: FeedGroup, meId: number | null): ReactFn {
  return useCallback((post, kind) => {
    if (!meId || post.employeeId === meId) return;
    const next = post.mine === kind ? null : kind;
    const qc = getQueryClient();
    const key = [FEED_KEY, group, meId];
    const prev = qc.getQueryData<FeedPost[]>(key);
    const reactions = { ...post.reactions };
    if (post.mine) reactions[post.mine] = Math.max(0, (reactions[post.mine] ?? 0) - 1);
    if (next) reactions[next as Reaction] = (reactions[next as Reaction] ?? 0) + 1;
    qc.setQueryData<FeedPost[]>(key, (l) => l?.map((p) => (p.logId === post.logId ? { ...p, mine: next, reactions } : p)));
    setFeedReaction(post.logId, group, meId, next)
      .catch((e: Error) => { qc.setQueryData(key, prev); toast.error("Reaksiya yazılmadı", e.message); })
      .finally(() => revalidate(FEED_KEY, LIKERS_KEY));
  }, [group, meId]);
}
