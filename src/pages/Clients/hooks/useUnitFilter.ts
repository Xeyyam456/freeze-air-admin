import { useMemo, useState } from "react";
import { urlQuery } from "@/lib/urlQuery";
import { norm } from "@/shared/utils/norm";
import type { Store } from "@/types/clients";

// Filial/mağaza axtarışı: kod, ad, ünvan, telefon (söz-söz, hərf fərqi nəzərə alınmır)
export function useUnitFilter(units: Store[]) {
  const [query, setQuery] = useState(urlQuery);

  const filtered = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    return units.filter((u) => {
      const haystack = norm(`${u.code} ${u.name} ${u.address} ${u.phone}`);
      return words.every((w) => haystack.includes(w));
    });
  }, [units, query]);

  return { query, setQuery, filtered };
}
