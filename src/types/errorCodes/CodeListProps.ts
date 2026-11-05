import type { ErrorCode } from "./ErrorCode";

export type CodeListProps = { codes: ErrorCode[]; selectedId: number | null; grouped?: boolean; onSelect: (c: ErrorCode) => void };
