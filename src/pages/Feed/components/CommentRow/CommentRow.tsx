import { Trash2 } from "lucide-react";
import { Avatar } from "@/shared/components/Avatar";
import type { CommentRowProps } from "@/types/feed";
import { REACTIONS } from "../../constants/reactions";
import { feedWhen } from "../../utils/feedWhen";
import { ReactionPicker } from "../ReactionPicker";
import { VoicePlayer } from "../VoicePlayer";

// Bir şərh (söhbət qabarcığı): başqalarınınkı solda (şəkil + ad), mənimki sağda mavi tonda; silmək — öz şərhi və ya rəhbərlik.
// Qabarcığın altında şərhə verilən reaksiyalar (say çipləri) və gülüş ikonu ilə reaksiya seçimi
export function CommentRow({ c, mine, canDelete, canReact, onDelete, onReact }: CommentRowProps) {
  const given = REACTIONS.filter((r) => c.reactions[r.kind]);
  return (
    <li className={`flex items-start gap-2 ${mine ? "flex-row-reverse" : ""}`}>
      {!mine && <Avatar employee={{ full_name: c.name, photo_url: c.photo }} className="!h-8 !w-8 !text-xs" />}
      <div className={`flex max-w-[80%] flex-col gap-1 ${mine ? "items-end" : "items-start"}`}>
        <div className={`rounded-2xl px-3.5 py-2 ${mine ? "rounded-br-md bg-primary/15 ring-1 ring-primary/30" : "rounded-bl-md bg-surface-2 ring-1 ring-line"}`}>
          {!mine && <p className="truncate text-xs font-extrabold text-primary">{c.name}</p>}
          {c.audio ? <VoicePlayer audio={c.audio} mine={mine} /> : <p className="whitespace-pre-wrap break-words text-[15px] leading-snug">{c.body}</p>}
          <p className="muted mt-0.5 flex items-center justify-end gap-2 text-[11px] font-semibold">
            {feedWhen(c.at)}
            {canDelete && c.id > 0 && (
              <button type="button" onClick={() => onDelete(c)} className="hover:text-red-400" aria-label="Şərhi sil"><Trash2 size={13} /></button>
            )}
          </p>
        </div>
        {c.id > 0 && (given.length > 0 || canReact) && (
          <div className="flex items-center gap-1">
            {given.map((r) => (
              <button key={r.kind} type="button" onClick={() => canReact && onReact(c, r.kind)} aria-label={`${c.reactions[r.kind]} ${r.label}`}
                className={`flex h-6 items-center gap-1 rounded-full border px-2 text-xs font-extrabold tabular-nums transition ${c.mine === r.kind ? "border-primary/50 bg-primary/15 text-primary" : "border-line bg-surface-2 text-muted"}`}>
                <span className="text-[13px] leading-none">{r.emoji}</span>{c.reactions[r.kind]}
              </button>
            ))}
            {canReact && <ReactionPicker mine={c.mine} onPick={(k) => onReact(c, k)} down left={!mine} />}
          </div>
        )}
      </div>
    </li>
  );
}
