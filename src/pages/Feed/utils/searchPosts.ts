import { norm } from "@/shared/utils/norm";
import type { FeedPost } from "@/types/feed";
import { bakuDay, feedWhen } from "./feedWhen";

// Axtarış: yer, şirkət, usta, birlikdə işləyən, yazı və tarix üzrə (bütün sözlər tapılmalıdır)
export function searchPosts(posts: FeedPost[], query: string) {
  const words = norm(query).split(/\s+/).filter(Boolean);
  if (!words.length) return posts;
  return posts.filter((p) => {
    const hay = norm(`${p.place} ${p.company ?? ""} ${p.name} ${p.partners.join(" ")} ${p.description} ${feedWhen(p.at)} ${bakuDay(p.at)}`);
    return words.every((w) => hay.includes(w));
  });
}
