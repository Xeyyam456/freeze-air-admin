import type { Tool } from "./Tool";

export type ShoppingModalProps = { tools: Tool[]; onReceipt: (t: Tool) => void; onClose: () => void };
