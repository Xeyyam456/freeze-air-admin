import { useCallback } from "react";
import { getQueryClient } from "@/lib/queryClient";
import { revalidate } from "@/lib/revalidate";
import { toast } from "@/lib/toast";
import { addFeedComment, deleteFeedComment, setCommentReaction } from "@/services/feed/comments";
import { COMMENTS_KEY, FEED_KEY } from "@/services/feed/keys";
import type { FeedComment, FeedGroup, FeedPost, Reaction } from "@/types/feed";

// Şərh yaz / sil — OPTİMİSTİK: şərh klik anında siyahıda, kartdakı say da dərhal dəyişir (keş); baza arxada, xətada geri qayıdır
export function useFeedComments(logId: number, group: FeedGroup, meId: number | null, meName: string) {
  const qc = getQueryClient();
  const listKey = [COMMENTS_KEY, logId, group, meId];
  const bump = useCallback((n: number) => {
    qc.setQueryData<FeedPost[]>([FEED_KEY, group, meId], (l) => l?.map((p) => (p.logId === logId ? { ...p, comments: Math.max(0, p.comments + n) } : p)));
  }, [qc, group, meId, logId]);
  const done = () => revalidate(FEED_KEY, COMMENTS_KEY);

  const send = (body: string) => {
    if (!meId || !body.trim()) return;
    const temp: FeedComment = { id: -Date.now(), employeeId: meId, name: meName, photo: null, body: body.trim(), at: new Date().toISOString(), reactions: {}, mine: null };
    const prev = qc.getQueryData<FeedComment[]>(listKey);
    qc.setQueryData<FeedComment[]>(listKey, (l) => [...(l ?? []), temp]);
    bump(1);
    addFeedComment(logId, group, meId, body)
      .catch((e: Error) => { qc.setQueryData(listKey, prev); bump(-1); toast.error("Şərh yazılmadı", e.message); })
      .finally(done);
  };

  const remove = (c: FeedComment) => {
    const prev = qc.getQueryData<FeedComment[]>(listKey);
    qc.setQueryData<FeedComment[]>(listKey, (l) => l?.filter((x) => x.id !== c.id));
    bump(-1);
    deleteFeedComment(c.id)
      .catch((e: Error) => { qc.setQueryData(listKey, prev); bump(1); toast.error("Şərh silinmədi", e.message); })
      .finally(done);
  };

  // Şərhə reaksiya — OPTİMİSTİK: say və seçim klik anında dəyişir; eyni işarəyə təkrar klik geri götürür
  const react = (c: FeedComment, kind: Reaction) => {
    if (!meId || c.id < 0) return;
    const next = c.mine === kind ? null : kind;
    const prev = qc.getQueryData<FeedComment[]>(listKey);
    qc.setQueryData<FeedComment[]>(listKey, (l) => l?.map((x) => {
      if (x.id !== c.id) return x;
      const reactions = { ...x.reactions };
      if (x.mine) reactions[x.mine] = Math.max(0, (reactions[x.mine] ?? 0) - 1);
      if (next) reactions[next] = (reactions[next] ?? 0) + 1;
      return { ...x, mine: next, reactions };
    }));
    setCommentReaction(c.id, meId, next)
      .catch((e: Error) => { qc.setQueryData(listKey, prev); toast.error("Reaksiya yazılmadı", e.message); })
      .finally(() => revalidate(COMMENTS_KEY));
  };

  return { send, remove, react };
}
