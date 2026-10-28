import type { DepotEmployee } from "./DepotEmployee";
import type { DepotRequest } from "./DepotRequest";
import type { Holding } from "./Holding";
import type { Loss } from "./Loss";
import type { Piece } from "./Piece";
import type { Repair } from "./Repair";
import type { Tool } from "./Tool";

export type ToolModalProps = {
  tool: Tool;
  holders: Holding[];
  pieces: Piece[];
  repairs: Repair[];
  losses?: Loss[];
  requests: DepotRequest[];
  employees: DepotEmployee[];
  canManage: boolean;
  onReceipt: () => void;
  onClose: () => void;
};
