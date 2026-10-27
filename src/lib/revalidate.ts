import { getQueryClient } from "./queryClient";

// Next-dəki refresh() əvəzi: məlumat dəyişəndə keş etibarsız olur, açıq səhifədəki bütün siyahılar yenidən yüklənir
// (bağlı səhifələr açılanda təzələnir). TanStack Query keşi (lib/queryClient.ts).
export function revalidate() {
  void getQueryClient().invalidateQueries();
}
