import { useEffect, useState } from "react";
import { bakuHour } from "../utils/bakuHour";

// "İndi" seçilmiş günün saatı ilə (kəsr), hər dəqiqə yenilənir
export function useNowHour(day: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  return bakuHour(new Date(now).toISOString(), day);
}
