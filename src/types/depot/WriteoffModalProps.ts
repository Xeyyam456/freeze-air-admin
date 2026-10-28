import type { Tool } from "./Tool";
import type { WriteoffSource } from "./WriteoffSource";

export type WriteoffModalProps = { tool: Tool; source: WriteoffSource; onClose: () => void };
