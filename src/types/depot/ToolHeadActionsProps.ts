import type { Tool } from "./Tool";
import type { Kind } from "./Kind";
import type { Holding } from "./Holding";

export type ToolHeadActionsProps = { tool: Tool; kind: Kind; holders: Holding[]; empty: boolean; onEdit: () => void };
