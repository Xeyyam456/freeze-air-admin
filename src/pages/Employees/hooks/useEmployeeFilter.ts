import { useMemo, useState } from "react";
import { urlQuery } from "@/lib/urlQuery";
import { norm } from "@/shared/utils/norm";
import { workerTypeLabel } from "@/shared/utils/workerType";
import type { Employee } from "@/types/employees";

// Axtarış: ad, ixtisas, telefon və iş növü üzrə (hərf fərqi nəzərə alınmır)
export function useEmployeeFilter(employees: Employee[]) {
  const [query, setQuery] = useState(urlQuery);

  const filtered = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    return employees.filter((e) => {
      const haystack = norm(`${e.full_name} ${e.specialty} ${e.phone} ${workerTypeLabel(e.worker_type)}`);
      return words.every((w) => haystack.includes(w));
    });
  }, [employees, query]);

  return { query, setQuery, filtered };
}
