import type { DepotMenuItem } from "./DepotMenuItem";
import type { DepotModal } from "./DepotModal";

export type DepotActionsProps = {
  hasData: boolean;
  low: number;
  canManage: boolean;
  variant: "admin" | "web";
  extraActions?: React.ReactNode;
  extraMenu: DepotMenuItem[];
  onModal: (m: DepotModal) => void;
  onReceipt: () => void;
};
