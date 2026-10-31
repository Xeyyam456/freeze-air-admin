import { useState } from "react";
import { norm } from "@/shared/utils/norm";
import type { RequestFilter } from "@/types/requests";
import { useRequestsData } from "../queries/useRequestsData";

// Müraciətlər səhifəsinin vəziyyəti: filtr (Yeni / Baxılıb / Hamısı), axtarış, seçilmiş müraciət
export function useRequestsPage() {
  const [filter, setFilter] = useState<RequestFilter>("new");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const requests = useRequestsData();

  const counts = {
    new: requests?.filter((r) => !r.handled).length ?? 0,
    handled: requests?.filter((r) => r.handled).length ?? 0,
    all: requests?.length ?? 0,
  };
  const q = norm(query.trim());
  const list = (requests ?? [])
    .filter((r) => (filter === "all" ? true : filter === "new" ? !r.handled : r.handled))
    .filter((r) => !q || [r.name, r.phone, r.email, r.message].some((v) => norm(v).includes(q)));
  // Seçilmiş siyahıda yoxdursa (filtr/silmə), birincisi göstərilir
  const selected = list.find((r) => r.id === selectedId) ?? list[0] ?? null;

  return { loaded: requests !== null, filter, setFilter, query, setQuery, setSelectedId, counts, list, selected, searching: !!q };
}
