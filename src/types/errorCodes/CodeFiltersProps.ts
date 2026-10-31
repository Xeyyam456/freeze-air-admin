import type { ErrorCodesData } from "./ErrorCodesData";

export type CodeFiltersProps = ErrorCodesData & {
  query: string;
  onQuery: (q: string) => void;
  modelFilter: string;
  onModelFilter: (v: string) => void;
  counts: Map<number, number>;
};
