import type { SiteEquipment } from "./SiteEquipment";

export type EquipmentInput = Omit<SiteEquipment, "id">;
