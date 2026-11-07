import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import { FEED_KEYS } from "./keys";

// Lent üçün ortaq Realtime kanalı (davamiyyətin kanalı kimi): neçə komponent işlətsə də bir kanal; sonuncu çıxanda bağlanır.
// Yeni fayl (iş/akt), reaksiya və şərh gələndə açıq lent, şərh və reaksiya siyahıları yenilənir. Sessiya ilə qoşulur (yoxsa RLS hadisə göndərmir)
let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;
let users = 0;

async function start() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (session) await supabase.realtime.setAuth(session.access_token);
  if (users === 0 || channel) return; // gözləyərkən hamı çıxıb və ya başqası artıq açıb
  const refresh = () => revalidate(...FEED_KEYS);
  channel = supabase
    .channel(`feed-${Math.random().toString(36).slice(2)}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "work_files" }, refresh)
    .on("postgres_changes", { event: "*", schema: "public", table: "feed_likes" }, refresh)
    .on("postgres_changes", { event: "*", schema: "public", table: "feed_comments" }, refresh)
    .subscribe();
}

export function acquireFeedLive() {
  users += 1;
  if (users === 1) void start();
}

export function releaseFeedLive() {
  users -= 1;
  if (users === 0 && channel) {
    void createClient().removeChannel(channel);
    channel = null;
  }
}
