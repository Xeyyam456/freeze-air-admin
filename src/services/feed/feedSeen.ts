import { createClient } from "@/lib/supabase/client";
import type { FeedGroup } from "@/types/feed";

// Hər qrup üçün "axırıncı baxış" vaxtı. Əsas mənbə bazadır (feed_seen, 0114): telefonda oxunan burada da oxunmuşdur.
// localStorage yalnız keşdir (dərhal cavab); ilk dəfə = indi: köhnə paylaşımlar oxunmamış sayılmır.
const key = (g: FeedGroup) => `fa-feed-seen-${g}`;
const later = (a: string | null, b: string) => (!a || Date.parse(b) > Date.parse(a) ? b : a);

function readLocal(g: FeedGroup): string | null {
  try { return localStorage.getItem(key(g)); } catch { return null; }
}
function writeLocal(g: FeedGroup, iso: string) {
  try { localStorage.setItem(key(g), iso); } catch { /* yaddaş bağlıdır */ }
}

// Bazadakı vaxtları gətirir, lokal keşlə birləşdirir (hansı gecdirsə); nəticə: qrup → vaxt
export async function feedSinceAll(): Promise<Record<FeedGroup, string>> {
  const { data } = await createClient().rpc("my_feed_seen");
  const server = new Map<string, string>((data ?? []).map((r) => [r.grp, r.seen_at]));
  const now = new Date().toISOString();
  const pick = (g: FeedGroup) => {
    const v = later(readLocal(g), server.get(g) ?? readLocal(g) ?? now);
    writeLocal(g, v);
    return v;
  };
  return { work: pick("work"), act: pick("act") };
}

export function markFeedSeen(g: FeedGroup) {
  writeLocal(g, new Date().toISOString());
  void createClient().rpc("mark_feed_seen", { p_grp: g });
}

// Lent səhifəsi hazırda hansı qrupu göstərir (null = lent açıq deyil): o qrupa gələn hadisə dərhal oxunmuş sayılır
let viewing: FeedGroup | null = null;
export const setFeedViewing = (g: FeedGroup | null) => { viewing = g; };
export const getFeedViewing = () => viewing;
