import { useCallback } from "react";
import { getQueryClient } from "@/lib/queryClient";
import { revalidate } from "@/lib/revalidate";
import { toast } from "@/lib/toast";
import { addFeedComment, deleteFeedComment } from "@/services/feed/comments";
import { COMMENTS_KEY, FEED_KEY } from "@/services/feed/keys";
import type { FeedComment, FeedGroup, FeedPost } from "@/types/feed";

// Şərh yaz / sil — OPTİMİSTİK: şərh klik anında siyahıda, kartdakı say da dərhal dəyişir (keş); baza arxada, xətada geri qayıdır
export function useFeedComments(logId: number, group: FeedGroup, meId: number | null, meName: string) {
  const qc = getQueryClient();
  const listKey = [COMMENTS_KEY, logId, group];
  const bump = useCallback((n: number) => {
    qc.setQueryData<FeedPost[]>([FEED_KEY, group, meId], (l) => l?.map((p) => (p.logId === logId ? { ...p, comments: Math.max(0, p.comments + n) } : p)));
  }, [qc, group, meId, logId]);
  const done = () => revalidate(FEED_KEY, COMMENTS_KEY);

  const send = (body: string) => {
    if (!meId || !body.trim()) return;
    const temp: FeedComment = { id: -Date.now(), employeeId: meId, name: meName, photo: null, body: body.trim(), at: new Date().toISOString() };
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

  return { send, remove };
}
