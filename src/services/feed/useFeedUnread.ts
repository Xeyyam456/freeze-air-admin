import { useData } from "@/lib/useData";
import { fetchFeedUnread } from "./fetchFeedUnread";
import { UNREAD_KEY } from "./keys";

// null = yüklənir
export function useFeedUnread() {
  return useData(UNREAD_KEY, () => fetchFeedUnread());
}
