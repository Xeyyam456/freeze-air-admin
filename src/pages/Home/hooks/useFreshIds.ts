import { useRef } from "react";

// Sonradan (canlı yenilənmə ilə) siyahıya düşən sətirlərin id-ləri: ilk yükləmədəkilər "yeni" sayılmır.
// Sətir yalnız montaj anında bir dəfə vurğulanır (CSS animasiyası), ona görə dəsti təmizləmək lazım deyil.
export function useFreshIds(ids: number[]) {
  const seen = useRef<Set<number> | null>(null);
  const fresh = useRef(new Set<number>());
  if (seen.current === null) seen.current = new Set(ids);
  else for (const id of ids) if (!seen.current.has(id)) { seen.current.add(id); fresh.current.add(id); }
  return fresh.current;
}
