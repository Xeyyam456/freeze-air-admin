import { useMemo, useState } from "react";
import { urlQuery } from "@/lib/urlQuery";
import { norm } from "@/shared/utils/norm";
import type { Employee } from "@/types/employees";
import { rank } from "../utils/rank";

// Axtarış (ad, vəzifə, telefon) + vəzifə sırası: müdir üstdə
export function useManagerFilter(managers: Employee[]) {
  const [query, setQuery] = useState(urlQuery);

  const filtered = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    return managers
      .filter((m) => {
        const haystack = norm(`${m.full_name} ${m.position} ${m.phone}`);
        return words.every((w) => haystack.includes(w));
      })
      .sort((a, b) => rank(a.position) - rank(b.position) || a.full_name.localeCompare(b.full_name, "az"));
  }, [managers, query]);

  return { query, setQuery, filtered };
}
