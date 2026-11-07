import { useState } from "react";
import type { FeedActionsProps } from "@/types/feed";
import { useFeedReaction } from "../../hooks/useFeedReaction";
import { CommentIcon } from "../CommentIcon";
import { REACTIONS } from "../../constants/reactions";
import { ReactionPicker } from "../ReactionPicker";
import { CommentsModal } from "../CommentsModal";
import { LikersModal } from "../LikersModal";

// Kartın altı: solda şərh düyməsi (ikon + say), sağda reaksiya seçimi (gülüş ikonu → 👍 👎 ❤️ 👏 🙏) və verilmiş reaksiyaların sayları. Reaksiya: müəllifdən başqa hamı (ustalar, rəhbərlik); müəllif sayları görür.
// Rəqəmə klik → kimlər reaksiya verib; şərh düyməsi → şərhlər pəncərəsi
export function FeedActions({ post, group, meId, moderator }: FeedActionsProps) {
  const [comments, setComments] = useState(false);
  const [likers, setLikers] = useState(false);
  const react = useFeedReaction(group, meId);
  const mine = post.employeeId === meId;

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
      <button type="button" onClick={() => setComments(true)} aria-label={`${post.comments} şərh`}
        className={`group flex items-center gap-2 rounded-xl py-1 pl-1 pr-3 transition ${post.comments ? "bg-primary/10 hover:bg-primary/15" : "hover:bg-surface-2"}`}>
        <CommentIcon active={post.comments > 0} className="group-hover:-translate-y-px group-hover:scale-105" />
        <span className={`text-sm font-extrabold tabular-nums ${post.comments ? "text-primary" : "muted"}`}>{post.comments > 0 ? post.comments : "Şərh"}</span>
      </button>
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        {(!mine && meId) && <ReactionPicker mine={post.mine} onPick={(kind) => react(post, kind)} />}
        {REACTIONS.filter((r) => post.reactions[r.kind]).map((r) => (
          <button key={r.kind} type="button" onClick={() => setLikers(true)} aria-label={`${post.reactions[r.kind]} ${r.label}, kimlər`}
            className={`flex h-8 items-center gap-1.5 rounded-full border px-3 transition hover:-translate-y-px ${post.mine === r.kind ? "border-primary/50 bg-primary/15" : "border-line bg-surface-2"}`}>
            <span className="text-[15px] leading-none">{r.emoji}</span>
            <span className={`text-xs font-extrabold tabular-nums ${post.mine === r.kind ? "text-primary" : "muted"}`}>{post.reactions[r.kind]}</span>
          </button>
        ))}
      </div>
      {comments && <CommentsModal logId={post.logId} group={group} meId={meId} moderator={moderator} onClose={() => setComments(false)} />}
      {likers && <LikersModal logId={post.logId} group={group} onClose={() => setLikers(false)} />}
    </div>
  );
}
