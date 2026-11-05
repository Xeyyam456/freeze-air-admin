import type { ErrorCode } from "./ErrorCode";

export type EditorFieldsProps = { item: ErrorCode | null; code: string; onCode: (v: string) => void; existing: ErrorCode | null; onOpen: (c: ErrorCode) => void };
