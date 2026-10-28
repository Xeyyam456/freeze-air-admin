import type { DepotEmployee } from "./DepotEmployee";
import type { DepotRequest } from "./DepotRequest";
import type { DepotView } from "./DepotView";
import type { Holding } from "./Holding";
import type { Loss } from "./Loss";
import type { Piece } from "./Piece";
import type { Repair } from "./Repair";
import type { Tool } from "./Tool";

export type DepotBoardProps = {
  tab: DepotView;
  onTab: (t: DepotView) => void;
  tools: Tool[];
  holdings: Holding[];
  pieces: Piece[];
  employees: DepotEmployee[];
  requests: DepotRequest[];
  repairs: Repair[];
  losses?: Loss[];
  canManage: boolean;
  openToolId: number | null;
  onOpenTool: (id: number | null) => void;
  onReceipt: (t: Tool | null) => void;
  onShopping: () => void;
  onJournal: () => void;
};
