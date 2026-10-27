import { keepPreviousData, useQuery } from "@tanstack/react-query";

// Səhifə məlumatını yükləyir (TanStack Query): açar + deps keşin açarıdır. Eyni açarlı sorğu bir dəfə gedir,
// səhifəyə qayıdanda keşdən dərhal görünür, revalidate() çağırılanda yenidən yüklənir.
// İlk yükləmədə data=null (“Yüklənir...”); deps dəyişəndə və yeniləmələrdə köhnə məlumat ekranda qalır.
// Açar fayl daxilində unikal olmalıdır, eyni açar = eyni məlumat (fərqli fetcher-ə eyni açar vermə).
export function useData<T>(key: string, fetcher: () => Promise<T>, deps: unknown[] = []) {
  const { data } = useQuery({ queryKey: [key, ...deps], queryFn: fetcher, placeholderData: keepPreviousData });
  return data ?? null;
}
