import type { DepotData } from "./DepotData";
import type { DepotModal } from "./DepotModal";
import type { Kind } from "./Kind";
import type { Tool } from "./Tool";

export type DepotModalsProps = {
  modal: DepotModal | null;
  data: DepotData;
  kind: Kind;
  receiptTool: Tool | null;
  onReceipt: (t: Tool | null) => void;
  onClose: () => void;
};
