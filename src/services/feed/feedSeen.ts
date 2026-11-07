import type { FeedGroup } from "@/types/feed";

// Hər qrup üçün "axırıncı baxış" vaxtı (bu brauzerdə, localStorage). İlk dəfə = indi: köhnə paylaşımlar oxunmamış sayılmır.
const key = (g: FeedGroup) => `fa-feed-seen-${g}`;

export function feedSince(g: FeedGroup): string {
  try {
    const v = localStorage.getItem(key(g));
    if (v) return v;
    const now = new Date().toISOString();
    localStorage.setItem(key(g), now);
    return now;
  } catch {
    return new Date().toISOString();
  }
}

export function markFeedSeen(g: FeedGroup) {
  try {
    localStorage.setItem(key(g), new Date().toISOString());
  } catch { /* yaddaş bağlıdır */ }
}

// Lent səhifəsi hazırda hansı qrupu göstərir (null = lent açıq deyil): o qrupa gələn hadisə dərhal oxunmuş sayılır
let viewing: FeedGroup | null = null;
export const setFeedViewing = (g: FeedGroup | null) => { viewing = g; };
export const getFeedViewing = () => viewing;
