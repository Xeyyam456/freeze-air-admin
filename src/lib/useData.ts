import { useEffect, useState } from "react";
import { useRevalidateVersion } from "./revalidate";

// Səhifə məlumatını yükləyir; revalidate() çağırılanda və ya deps dəyişəndə yenidən yükləyir.
// İlk yükləmədə data=null (“Yüklənir...”), sonrakı yeniləmələrdə köhnə məlumat ekranda qalır.
export function useData<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const version = useRevalidateVersion();
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetcher().then((d) => {
      if (!cancelled) setData(d);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetcher hər renderdə yeni olur, deps ilə idarə olunur
  }, [version, ...deps]);

  return data;
}
