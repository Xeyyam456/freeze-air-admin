import type { ErrorCode } from "./ErrorCode";

export type CodeMatrixProps = {
  codes: ErrorCode[];
  selectedId: number | null;
  draft: string | null; // boş xanadan yaradılan yeni kod
  matches: Set<number> | null;
  onSelect: (c: ErrorCode) => void;
  onCreate: (code: string) => void;
};
