import type { SiteEquipment } from "./SiteEquipment";

export type EquipmentEditorProps = { item: SiteEquipment | null; nextSort: number; onClose: () => void };
