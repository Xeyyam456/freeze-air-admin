import { useState } from "react";
import type { FeedActionsProps } from "@/types/feed";
import { useFeedReaction } from "../../hooks/useFeedReaction";
import { CommentsModal } from "../CommentsModal";
import { LikersModal } from "../LikersModal";

const EMOJI = "text-2xl leading-none transition";

// Kartın altı: solda 💬 şərh sayı, sağda 👍 / 👎. Reaksiya: müəllifdən başqa hamı (ustalar, rəhbərlik); müəllif sayları görür.
// Rəqəmə klik → kimlər reaksiya verib; 💬 → şərhlər pəncərəsi
export function FeedActions({ post, group, meId, moderator }: FeedActionsProps) {
  const [comments, setComments] = useState(false);
  const [likers, setLikers] = useState(false);
  const react = useFeedReaction(group, meId);
  const mine = post.employeeId === meId;

  return (
    <div className="flex items-center justify-between">
      <button type="button" onClick={() => setComments(true)} className="flex items-center gap-1.5" aria-label={`${post.comments} şərh`}>
        <span className={`${EMOJI} ${post.comments ? "" : "opacity-40"}`}>💬</span>
        {post.comments > 0 && <span className="muted text-sm font-extrabold tabular-nums">{post.comments}</span>}
      </button>
      <div className="flex items-center gap-5">
        {([["up", "👍", post.up], ["down", "👎", post.down]] as const).map(([kind, emoji, n]) => (
          <span key={kind} className="flex items-center gap-1.5">
            <button type="button" onClick={() => (mine ? setLikers(true) : react(post, kind))} aria-label={mine ? "Kimlər reaksiya verib" : kind === "up" ? "Bəyən" : "Bəyənmə"}>
              <span className={`${EMOJI} ${post.mine === kind ? "" : "opacity-40 hover:opacity-80"}`}>{emoji}</span>
            </button>
            {n > 0 && (
              <button type="button" onClick={() => setLikers(true)} aria-label={`${n} reaksiya, kimlər`}>
                <span className={`text-sm font-extrabold tabular-nums ${post.mine === kind ? "text-primary" : "muted"}`}>{n}</span>
              </button>
            )}
          </span>
        ))}
      </div>
      {comments && <CommentsModal logId={post.logId} group={group} meId={meId} moderator={moderator} onClose={() => setComments(false)} />}
      {likers && <LikersModal logId={post.logId} group={group} onClose={() => setLikers(false)} />}
    </div>
  );
}
