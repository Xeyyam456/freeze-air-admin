import { useMemo, useState } from "react";
import type { ErrorCode, ErrorCodeMapState, ErrorCodesData, PanelTab } from "@/types/errorCodes";
import { countByModel } from "../utils/countByModel";
import { compareCodes } from "../utils/compareCodes";
import { isCodeQuery } from "../utils/isCodeQuery";
import { matchCodes } from "../utils/matchCodes";

// Xəta kodları səhifəsinin vəziyyəti: model, axtarış, xəritədə seçilmiş kod (redaktə) və ya boş xanadan yeni kod (draft).
// Sol tərəf (xəritə) və sağ panel (pult redaktoru) eyni vəziyyəti işlədir.
export function useErrorCodeMap({ models, codes: all }: ErrorCodesData): ErrorCodeMapState {
  const [picked, setPicked] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draft, setDraft] = useState<string | null>(null);
  // Model yoxdursa əvvəl "Modellər" açılır: ilk addım modeli əlavə etməkdir
  const [tab, setTab] = useState<PanelTab>(models.length === 0 ? "models" : "code");

  const counts = useMemo(() => countByModel(all), [all]);
  // Standart model: ən çox kodu olan (kod yoxdursa ilk model)
  const modelId = picked ?? [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? models[0]?.id ?? null;
  const codes = useMemo(
    () => all.filter((c) => c.model_id === modelId).sort((a, b) => compareCodes(a.code, b.code)),
    [all, modelId],
  );
  const matches = useMemo(() => matchCodes(codes, query), [codes, query]);
  const q = query.trim();

  const select = (c: ErrorCode) => {
    setSelectedId(c.id);
    setDraft(null);
    setTab("code");
  };

  return {
    models,
    counts,
    model: models.find((m) => m.id === modelId) ?? null,
    setModelId: (id) => {
      setPicked(id);
      setSelectedId(null);
      setDraft(null);
    },
    query,
    setQuery,
    codes,
    matches,
    results: !q || isCodeQuery(q) ? null : codes.filter((c) => matches?.has(c.id)),
    solved: codes.filter((c) => c.solution?.trim()).length,
    selected: codes.find((c) => c.id === selectedId) ?? null,
    draft,
    tab,
    setTab,
    select,
    create: (code) => {
      setSelectedId(null);
      setDraft(code);
      setTab("code");
    },
    reset: () => {
      setSelectedId(null);
      setDraft("");
    },
  };
}
