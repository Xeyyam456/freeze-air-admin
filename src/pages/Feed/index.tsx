import { Fragment, useEffect, useMemo, useState } from "react";
import { Page } from "@/components/Page";
import { useData } from "@/lib/useData";
import { fetchFeed } from "@/services/feed/fetchFeed";
import { FEED_KEY } from "@/services/feed/keys";
import { setFeedViewing, markFeedSeen } from "@/services/feed/feedSeen";
import { acquireFeedLive, releaseFeedLive } from "@/services/feed/liveChannel";
import { useFeedUnread } from "@/services/feed/useFeedUnread";
import { revalidate } from "@/lib/revalidate";
import { Card } from "@/shared/components/Card";
import { SearchBar } from "@/shared/components/SearchBar";
import type { FeedGroup } from "@/types/feed";
import { FeedCard } from "./components/FeedCard";
import { DayDivider } from "./components/DayDivider";
import { FeedTabs } from "./components/FeedTabs";
import { useFeedMe } from "./hooks/useFeedMe";
import { groupByDay } from "./utils/groupByDay";
import { searchPosts } from "./utils/searchPosts";

// Qruplar (mobil və web ilə eyni): usta tapşırıq qeydinə şəkil/video/akt yükləyəndə avtomatik burada görünür (usta + yer + birlikdə işləyənlər).
// İki tab: Görülən işlər / Aktlar; axtarış: yer, usta, tarix. 👍/👎 və 💬 şərh (əməkdaş kartı olan hesabla). Canlı: work_files, feed_likes,
// feed_comments Realtime. Rəhbərlik/admin hər şərhi silə bilər.
export default function FeedPage() {
  const me = useFeedMe();
  const meId = me?.id ?? null;
  const [group, setGroup] = useState<FeedGroup>("work");
  const [query, setQuery] = useState("");
  const work = useData(FEED_KEY, () => fetchFeed("work", meId), ["work", meId]);
  const act = useData(FEED_KEY, () => fetchFeed("act", meId), ["act", meId]);
  const current = group === "work" ? work : act;
  const posts = useMemo(() => searchPosts(current ?? [], query), [current, query]);

  const unread = useFeedUnread();
  const days = useMemo(() => groupByDay(posts), [posts]);
  const perDay = useMemo(() => new Map(groupByDay(current ?? []).map((d) => [d.day, d.posts.length])), [current]); // günün ümumi sayı (axtarışdan asılı deyil)

  // Qrup açıq olduğu müddətdə oxunmuş sayılır: 2 san sonra baxış vaxtı yenilənir, nişan və tab sayı sıfırlanır
  useEffect(() => {
    setFeedViewing(group);
    const t = setTimeout(() => { markFeedSeen(group); revalidate("feed-unread", "nav-badges"); }, 2000);
    return () => { clearTimeout(t); setFeedViewing(null); markFeedSeen(group); };
  }, [group]);

  useEffect(() => {
    acquireFeedLive();
    return releaseFeedLive;
  }, []);

  return (
    <Page title="Qruplar" subtitle="Görülən işlər və aktlar">
      <div className="grid gap-4">
        <FeedTabs group={group} onChange={setGroup} unread={unread ?? { work: 0, act: 0 }} />
        <SearchBar value={query} onChange={setQuery} placeholder="Yer, usta və ya tarix axtar..." label="Lent axtarışı" />
        {meId === null && me !== null && (
          <Card className="muted py-3 text-center text-sm">Bu hesabın əməkdaş kartı yoxdur: lenti görür, şərhləri silə bilərsən; reaksiya və şərh yazmaq üçün usta/rəhbər kartı lazımdır.</Card>
        )}
        {current === null ? <Card className="muted py-10 text-center text-sm">Yüklənir...</Card>
          : posts.length === 0 ? <Card className="muted py-10 text-center text-sm">{query ? "Heç nə tapılmadı." : group === "work" ? "Hələ görülən iş paylaşılmayıb." : "Hələ akt yüklənməyib."}</Card>
          : days.map((d) => (
            <Fragment key={d.day}>
              <DayDivider day={d.day} label={`${perDay.get(d.day) ?? d.posts.length} ${group === "act" ? "akt" : "iş"}`} />
              {d.posts.map((p) => <FeedCard key={p.logId} post={p} group={group} meId={meId} moderator={me?.moderator ?? false} />)}
            </Fragment>
          ))}
      </div>
    </Page>
  );
}
