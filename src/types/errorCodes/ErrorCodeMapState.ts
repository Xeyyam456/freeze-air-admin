import type { ErrorCode } from "./ErrorCode";
import type { Model } from "./Model";
import type { PanelTab } from "./PanelTab";

export type ErrorCodeMapState = {
  models: Model[];
  counts: Map<number, number>;
  model: Model | null;
  setModelId: (id: number) => void;
  query: string;
  setQuery: (q: string) => void;
  codes: ErrorCode[];
  matches: Set<number> | null;
  results: ErrorCode[] | null;
  solved: number;
  selected: ErrorCode | null;
  draft: string | null;
  tab: PanelTab;
  setTab: (t: PanelTab) => void;
  select: (c: ErrorCode) => void;
  create: (code: string) => void;
  reset: () => void;
};
