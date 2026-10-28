import type { Tool } from "./Tool";
import type { Kind } from "./Kind";

export type ReceiptModalProps = { tools: Tool[]; initialKind: Kind; initialToolId?: number | null; onClose: () => void };
