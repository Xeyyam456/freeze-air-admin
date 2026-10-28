import type { Kind } from "./Kind";

export type HistoryModalProps = { kind: Kind; toolId?: number; toolName?: string; onClose: () => void };
