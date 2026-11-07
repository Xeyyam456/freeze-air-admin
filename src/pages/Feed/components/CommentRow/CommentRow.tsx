import { Trash2 } from "lucide-react";
import { Avatar } from "@/shared/components/Avatar";
import type { CommentRowProps } from "@/types/feed";
import { feedWhen } from "../../utils/feedWhen";

// Bir şərh (söhbət qabarcığı): başqalarınınkı solda (şəkil + ad), mənimki sağda mavi tonda; silmək — öz şərhi və ya rəhbərlik
export function CommentRow({ c, mine, canDelete, onDelete }: CommentRowProps) {
  return (
    <li className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}>
      {!mine && <Avatar employee={{ full_name: c.name, photo_url: c.photo }} className="!h-8 !w-8 !text-xs" />}
      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${mine ? "rounded-br-md bg-primary/15 ring-1 ring-primary/30" : "rounded-bl-md bg-surface-2 ring-1 ring-line"}`}>
        {!mine && <p className="truncate text-xs font-extrabold text-primary">{c.name}</p>}
        <p className="whitespace-pre-wrap break-words text-[15px] leading-snug">{c.body}</p>
        <p className="muted mt-0.5 flex items-center justify-end gap-2 text-[11px] font-semibold">
          {feedWhen(c.at)}
          {canDelete && c.id > 0 && (
            <button type="button" onClick={() => onDelete(c)} className="hover:text-red-400" aria-label="Şərhi sil"><Trash2 size={13} /></button>
          )}
        </p>
      </div>
    </li>
  );
}
