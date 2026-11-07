import type { FeedPost } from "@/types/feed";
import { bakuDay } from "./feedWhen";

// Paylaşımlar (yeni üstdə) gün üzrə bölünür; hər gün üçün bir başlıq
export function groupByDay(posts: FeedPost[]) {
  const days: { day: string; posts: FeedPost[] }[] = [];
  for (const p of posts) {
    const day = bakuDay(p.at);
    const last = days[days.length - 1];
    if (last?.day === day) last.posts.push(p); else days.push({ day, posts: [p] });
  }
  return days;
}
