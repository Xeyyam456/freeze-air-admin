import type { DepotEmployee } from "./DepotEmployee";
import type { DepotRequest } from "./DepotRequest";
import type { Holding } from "./Holding";
import type { Kind } from "./Kind";
import type { Tool } from "./Tool";

export type PersonModalProps = {
  emp: DepotEmployee;
  kind: Kind;
  holds: Holding[];
  toolInfo: Map<number, Tool>;
  tools: Tool[];
  requests: DepotRequest[];
  canManage: boolean;
  onClose: () => void;
};
