import { useCallback } from "react";
import { getQueryClient } from "@/lib/queryClient";
import { revalidate } from "@/lib/revalidate";
import { toast } from "@/lib/toast";
import { setFeedReaction } from "@/services/feed/reactions";
import { FEED_KEY, LIKERS_KEY } from "@/services/feed/keys";
import type { FeedGroup, FeedPost, ReactFn } from "@/types/feed";

// 👍 / 👎 — OPTİMİSTİK: say və seçim klik anında dəyişir (keş), baza arxada; xətada geri qayıdır.
// Eyni işarəyə təkrar klik geri götürür; digərinə klik əvəzləyir (bir usta bir paylaşıma bir reaksiya verir)
export function useFeedReaction(group: FeedGroup, meId: number | null): ReactFn {
  return useCallback((post, kind) => {
    if (!meId || post.employeeId === meId) return;
    const next = post.mine === kind ? null : kind;
    const qc = getQueryClient();
    const key = [FEED_KEY, group, meId];
    const prev = qc.getQueryData<FeedPost[]>(key);
    const count = (k: "up" | "down", n: number) => n - (post.mine === k ? 1 : 0) + (next === k ? 1 : 0);
    qc.setQueryData<FeedPost[]>(key, (l) => l?.map((p) => (p.logId === post.logId ? { ...p, mine: next, up: count("up", p.up), down: count("down", p.down) } : p)));
    setFeedReaction(post.logId, group, meId, next)
      .catch((e: Error) => { qc.setQueryData(key, prev); toast.error("Reaksiya yazılmadı", e.message); })
      .finally(() => revalidate(FEED_KEY, LIKERS_KEY));
  }, [group, meId]);
}
