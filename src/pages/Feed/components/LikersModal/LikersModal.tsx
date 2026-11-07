import { X } from "lucide-react";
import { useData } from "@/lib/useData";
import { LIKERS_KEY } from "@/services/feed/keys";
import { fetchFeedLikers } from "@/services/feed/reactions";
import { Avatar } from "@/shared/components/Avatar";
import { Modal } from "@/shared/components/Modal";
import type { LikersModalProps, Reaction } from "@/types/feed";

const SECTIONS: { kind: Reaction; emoji: string }[] = [{ kind: "up", emoji: "👍" }, { kind: "down", emoji: "👎" }];

// Kimlər reaksiya verib: 👍 və 👎 bölmələri (ad, şəkil, ixtisas/vəzifə). Canlı: feed_likes Realtime
export function LikersModal({ logId, group, onClose }: LikersModalProps) {
  const list = useData(LIKERS_KEY, () => fetchFeedLikers(logId, group), [logId, group]);

  return (
    <Modal onClose={onClose} labelledBy="feed-likers-title" className="!max-w-sm">
      <div className="mb-3 flex items-center">
        <h2 id="feed-likers-title" className="flex-1 text-lg font-extrabold">Reaksiyalar</h2>
        <button type="button" onClick={onClose} className="muted grid h-8 w-8 place-items-center rounded-full hover:bg-surface-2" aria-label="Bağla"><X size={18} /></button>
      </div>
      {list === null ? <p className="muted py-6 text-center text-sm">Yüklənir...</p>
        : list.length === 0 ? <p className="muted py-6 text-center text-sm">Hələ reaksiya yoxdur.</p>
        : SECTIONS.map((s) => {
          const rows = list.filter((p) => p.kind === s.kind);
          if (!rows.length) return null;
          return (
            <section key={s.kind} className="mb-2">
              <p className="flex items-center gap-2 pt-1 text-sm font-extrabold"><span className="text-xl">{s.emoji}</span><span className="muted">{rows.length}</span></p>
              <ul>
                {rows.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 border-t border-line py-2 first:border-t-0">
                    <Avatar employee={{ full_name: p.name, photo_url: p.photo }} className="!h-10 !w-10 !text-sm" />
                    <div className="min-w-0"><p className="truncate font-bold">{p.name}</p><p className="muted truncate text-xs">{p.role}</p></div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
    </Modal>
  );
}
