import { useEffect, useMemo, useState } from "react";
import { Page } from "@/components/Page";
import { useData } from "@/lib/useData";
import { fetchFeed } from "@/services/feed/fetchFeed";
import { FEED_KEY } from "@/services/feed/keys";
import { acquireFeedLive, releaseFeedLive } from "@/services/feed/liveChannel";
import { Card } from "@/shared/components/Card";
import { SearchBar } from "@/shared/components/SearchBar";
import type { FeedGroup } from "@/types/feed";
import { FeedCard } from "./components/FeedCard";
import { FeedTabs } from "./components/FeedTabs";
import { useFeedMe } from "./hooks/useFeedMe";
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

  useEffect(() => {
    acquireFeedLive();
    return releaseFeedLive;
  }, []);

  return (
    <Page title="Qruplar" subtitle="Görülən işlər və aktlar">
      <div className="mx-auto grid max-w-3xl gap-4">
        <FeedTabs group={group} onChange={setGroup} counts={{ work: work?.length ?? null, act: act?.length ?? null }} />
        <SearchBar value={query} onChange={setQuery} placeholder="Yer, usta və ya tarix axtar..." label="Lent axtarışı" />
        {meId === null && me !== null && (
          <Card className="muted py-3 text-center text-sm">Bu hesabın əməkdaş kartı yoxdur: lenti görür, şərhləri silə bilərsən; reaksiya və şərh yazmaq üçün usta/rəhbər kartı lazımdır.</Card>
        )}
        {current === null ? <Card className="muted py-10 text-center text-sm">Yüklənir...</Card>
          : posts.length === 0 ? <Card className="muted py-10 text-center text-sm">{query ? "Heç nə tapılmadı." : group === "work" ? "Hələ görülən iş paylaşılmayıb." : "Hələ akt yüklənməyib."}</Card>
          : posts.map((p) => <FeedCard key={p.logId} post={p} group={group} meId={meId} moderator={me?.moderator ?? false} />)}
      </div>
    </Page>
  );
}
