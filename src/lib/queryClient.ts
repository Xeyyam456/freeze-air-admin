import { isServer, QueryClient } from "@tanstack/react-query";

// Məlumat keşi (TanStack Query): səhifələr arası keçiddə məlumat dərhal keşdən görünür, arxada yenilənir;
// eyni açarlı sorğu bir dəfə gedir. Brauzerdə bir keş; serverdə (web, Next SSR) hər sorğuya ayrıca — istifadəçilər qarışmasın.
// web-ə scripts/sync-depot-to-web.cjs ilə köçürülür.
function make() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000, // 30 san. ərzində eyni məlumat təkrar sorğulanmır (dəyişiklik olanda revalidate() onsuz da təzələyir)
        gcTime: 10 * 60_000, // açılmayan səhifənin məlumatı 10 dəq. keşdə qalır
        refetchOnWindowFocus: true, // başqa tabdan qayıdanda təzələnir
        retry: 1,
      },
    },
  });
}

let browserClient: QueryClient | undefined;
export function getQueryClient() {
  if (isServer) return make();
  return (browserClient ??= make());
}
