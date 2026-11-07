import { useData } from "@/lib/useData";
import { fetchFeedMe } from "@/services/feed/feedMe";

// null = yüklənir; id = null → əməkdaş kartı yoxdur (yalnız baxış və şərh silmə)
export function useFeedMe() {
  return useData("feed-me", () => fetchFeedMe()); // birbaşa ötürülməz: TanStack kontekst obyektini verər
}
