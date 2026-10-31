import type { ErrorCode } from "./ErrorCode";

export type CodesTableProps = { codes: ErrorCode[]; names: Map<number, string>; onEdit: (c: ErrorCode) => void };
