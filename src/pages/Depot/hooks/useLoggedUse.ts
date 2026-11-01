import { useEffect, useState } from "react";
import { fetchLoggedUse } from "@/services/depot/fetchLoggedUse";

// İş qeydlərində yazılan sərf (usta götürəndən bəri): material təhvilində və qaytarmasında yoxlama üçün.
// null: hesablanmayıb (material deyil və ya hələ yüklənir)
export function useLoggedUse(employeeId: number | null, toolId: number | null, takenAt: string | null, enabled = true) {
  const [n, setN] = useState<number | null>(null);
  useEffect(() => {
    if (!enabled || !employeeId || !toolId || !takenAt) return;
    let cancelled = false;
    fetchLoggedUse(employeeId, toolId, takenAt.slice(0, 10)).then((v) => { if (!cancelled) setN(v); });
    return () => { cancelled = true; };
  }, [enabled, employeeId, toolId, takenAt]);
  return n;
}
