import { getQueryClient } from "../queryClient";

// Next-dəki refresh() əvəzi: məlumat dəyişəndə keş etibarsız olur, açıq səhifədəki siyahılar yenidən yüklənir
// (bağlı səhifələr açılanda təzələnir). TanStack Query keşi (lib/queryClient.ts).
// Açar verilməsə hər şey (formlardan sonra), verilsə yalnız o açarlı useData-lar yenilənir (canlı hadisələr: LIVE).
export function revalidate(...keys: string[]) {
  void getQueryClient().invalidateQueries(keys.length ? { predicate: (q) => keys.includes(String(q.queryKey[0])) } : undefined);
}

// Canlı (Realtime) hadisədə hansı məlumat dəyişir: cədvəl → useData açarları. Yeni useData açarı əlavə edəndə bura da yaz,
// yoxsa həmin səhifə canlı yenilənməz (formdan sonrakı revalidate() onsuz da hamısını yeniləyir).
export const LIVE = {
  // tapşırıq "görüldü" → iş qeydi yaranır: işlər, Panel, ustaların iş sayı da dəyişir
  tasks: ["tasks-day", "dashboard", "nav-badges", "month-dashboard", "worklogs", "group-map-range", "all-logs", "group-map-all", "file-counts-all", "work-log", "employees-page", "clients", "client-detail"],
  leaves: ["leaves", "nav-badges", "employees-page"],
  attendance: ["employees-page"], // Davamiyyət səhifəsinin öz canlı dinləyicisi var (services/attendance/liveChannel.ts)
  fuel: ["fuel"],
  depot: ["depot", "nav-badges", "dashboard", "depot-journal", "depot-tool-history"],
  requests: ["contact-requests", "nav-badges"],
} as const;
