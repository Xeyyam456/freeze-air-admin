import { useEffect, useRef } from "react";
import { playNotify } from "@/lib/sound";
import { toast } from "@/lib/toast";
import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import { FEED_KEYS } from "@/services/feed/keys";
import { getFeedViewing, markFeedSeen } from "@/services/feed/feedSeen";
import { REACTION_EMOJI } from "@/pages/Feed/constants/reactions";
import { openChannel } from "@/services/realtime/openChannel";
import type { FeedGroup, Reaction } from "@/types/feed";

const GROUP_TITLE: Record<FeedGroup, string> = { work: "Görülən işlər", act: "Aktlar" };

// Qruplar lentində canlı hadisə (Realtime): yeni şəkil/video/akt, 👍/👎, şərh. Lent həmin qrup üçün açıqdırsa dərhal oxunmuş sayılır,
// əks halda menyuda "Qruplar" nişanı yanır, tab sayı artır və tost + səs çıxır.
export function FeedListener() {
  const me = useRef<number | null>(null);
  useEffect(() => {
    void createClient().rpc("my_employee_id").then((r) => { me.current = r.data ?? null; });
  }, []);

  useEffect(() => {
    const happen = (group: FeedGroup, title: string, text: string, author: number | null) => {
      if (author !== null && author === me.current) { revalidate(...FEED_KEYS); return; }
      if (getFeedViewing() === group) {
        markFeedSeen(group); // açıq qrup: oxunmuş sayılır, nişan yanmır
      } else {
        toast.success(title, text);
        playNotify();
      }
      revalidate(...FEED_KEYS);
    };
    let close = () => {};
    let dead = false;
    void (async () => {
      const { data: { session } } = await createClient().auth.getSession();
      if (session) await createClient().realtime.setAuth(session.access_token); // yoxsa RLS hadisə göndərmir
      if (dead) return;
      close = openChannel("feed-listener", (channel) => channel
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "work_files" }, (p) => {
        const kind = (p.new as { kind: string }).kind;
        const group: FeedGroup = kind === "act" ? "act" : "work";
        happen(group, kind === "act" ? "Yeni akt yükləndi" : kind === "video" ? "Yeni video" : "Yeni şəkil", GROUP_TITLE[group], null);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "feed_likes" }, (p) => {
        const r = p.new as { grp: FeedGroup; kind: string; employee_id: number };
        happen(r.grp, `${REACTION_EMOJI[r.kind as Reaction] ?? "👍"} Yeni reaksiya`, GROUP_TITLE[r.grp], r.employee_id);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "feed_comments" }, (p) => {
        const r = p.new as { grp: FeedGroup; body: string; employee_id: number };
        happen(r.grp, "Yeni şərh", r.body.length > 60 ? `${r.body.slice(0, 60)}…` : r.body, r.employee_id);
      }));
    })();
    return () => { dead = true; close(); };
  }, []);

  return null;
}
