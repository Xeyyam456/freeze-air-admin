import type { DepotBoardState } from "./DepotBoardState";
import type { Loss } from "./Loss";

export type ToolsTableProps = { b: DepotBoardState; losses: Loss[]; canManage: boolean; onOpenTool: (id: number) => void };
