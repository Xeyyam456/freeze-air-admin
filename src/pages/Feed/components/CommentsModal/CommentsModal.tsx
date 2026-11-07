import { Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useData } from "@/lib/useData";
import { fetchFeedComments } from "@/services/feed/comments";
import { COMMENTS_KEY } from "@/services/feed/keys";
import { Modal } from "@/shared/components/Modal";
import type { CommentsModalProps } from "@/types/feed";
import { useFeedComments } from "../../hooks/useFeedComments";
import { useFeedMe } from "../../hooks/useFeedMe";
import { CommentRow } from "../CommentRow";

// Paylaşımın şərhləri: söhbət qabarcıqları, altda yazı sahəsi (Enter göndərir, Shift+Enter yeni sətir). Şərh klik anında siyahıda görünür.
// Silmək: öz şərhi; rəhbərlik hamısını. Müəllifə və əvvəl yazanlara push gedir (bazada)
export function CommentsModal({ logId, group, meId, moderator, onClose }: CommentsModalProps) {
  const me = useFeedMe();
  const list = useData(COMMENTS_KEY, () => fetchFeedComments(logId, group), [logId, group]);
  const { send, remove } = useFeedComments(logId, group, meId, me?.name ?? "");
  const [text, setText] = useState("");
  const end = useRef<HTMLLIElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" }); // yeni şərhdə siyahının sonuna sürüş (effekt heç nə qaytarmamalıdır)
  }, [list?.length]);

  const submit = () => {
    if (!text.trim()) return;
    send(text);
    setText("");
  };

  return (
    <Modal onClose={onClose} labelledBy="feed-comments-title" className="flex !h-[min(580px,calc(100dvh-32px))] !max-w-2xl flex-col !gap-0 !p-0">
      <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
        <span className="text-xl">💬</span>
        <h2 id="feed-comments-title" className="flex-1 text-lg font-extrabold">Şərhlər{list?.length ? ` · ${list.length}` : ""}</h2>
        <button type="button" onClick={onClose} className="muted grid h-8 w-8 place-items-center rounded-full hover:bg-surface-2" aria-label="Bağla"><X size={18} /></button>
      </div>
      <ul className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {list === null ? <li className="muted text-center text-sm">Yüklənir...</li>
          : list.length === 0 ? <li className="muted m-auto text-center text-sm">Hələ şərh yoxdur.<br />İlk şərhi sən yaz.</li>
          : list.map((c) => <CommentRow key={c.id} c={c} mine={c.employeeId === meId} canDelete={c.employeeId === meId || moderator} onDelete={remove} />)}
        <li ref={end} className="h-0" />
      </ul>
      {meId ? (
        <div className="flex items-end gap-2 border-t border-line px-4 py-3">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={1} maxLength={1000} placeholder="Şərh yaz..."
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
            className="max-h-28 min-h-11 flex-1 resize-none rounded-3xl border border-line bg-surface-2 px-4 py-2.5 text-[15px] outline-none focus:border-primary" />
          <button type="button" onClick={submit} disabled={!text.trim()} aria-label="Göndər"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-white transition disabled:bg-surface-2 disabled:text-muted"><Send size={18} /></button>
        </div>
      ) : (
        <p className="muted border-t border-line px-5 py-3 text-center text-sm">Şərh yazmaq üçün əməkdaş kartı lazımdır.</p>
      )}
    </Modal>
  );
}
