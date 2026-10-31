import type { EquipmentOption } from "./EquipmentOption";
import type { SiteSegment } from "./SiteSegment";

// equipmentOptions: "Avadanlıq" tabındakı siyahı (key → ad)
export type SegmentEditorProps = { segment: SiteSegment | null; nextSort: number; equipmentOptions: EquipmentOption[]; onClose: () => void };
