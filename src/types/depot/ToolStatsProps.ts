import type { Tool } from "./Tool";
import type { Holding } from "./Holding";

export type ToolStatsProps = { tool: Tool; holders: Holding[]; material: boolean; piecesTitle: string };
