import type { DepotData } from "./DepotData";
import type { DepotMenuItem } from "./DepotMenuItem";

// variant: admin (tünd başlıq üslubu) | web (usta paneli)
export type DepotScreenProps = {
  data: DepotData | null;
  canManage: boolean;
  myUid: string | null;
  owner: boolean;
  variant: "admin" | "web";
  extraActions?: React.ReactNode;
  extraMenu?: DepotMenuItem[];
  children?: React.ReactNode;
};
