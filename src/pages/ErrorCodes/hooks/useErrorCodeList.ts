import { useMemo, useState } from "react";
import { norm } from "@/shared/utils/norm";
import type { ErrorCode, ErrorCodesData } from "@/types/errorCodes";
import { countByModel } from "../utils/countByModel";

// Siyahının vəziyyəti: axtarış, model süzgəci, redaktə olunan kod; model adları və kod sayları
export function useErrorCodeList({ codes, models }: ErrorCodesData) {
  const [query, setQuery] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [editing, setEditing] = useState<ErrorCode | null>(null);
  const names = useMemo(() => new Map(models.map((m) => [m.id, m.name])), [models]);
  const counts = useMemo(() => countByModel(codes), [codes]);

  const filtered = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    return codes.filter((c) => {
      if (modelFilter && String(c.model_id) !== modelFilter) return false;
      const hay = norm(`${names.get(c.model_id)} ${c.code} ${c.title} ${c.solution}`);
      return words.every((w) => hay.includes(w));
    });
  }, [codes, query, modelFilter, names]);

  return { query, setQuery, modelFilter, setModelFilter, editing, setEditing, names, counts, filtered };
}
