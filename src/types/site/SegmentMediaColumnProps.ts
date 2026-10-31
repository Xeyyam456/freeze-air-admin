import type { EquipmentOption } from "./EquipmentOption";
import type { SiteImagePickerState } from "./SiteImagePickerState";
import type { SiteSegment } from "./SiteSegment";

export type SegmentMediaColumnProps = {
  segment: SiteSegment | null;
  nextSort: number;
  picker: SiteImagePickerState;
  position: string;
  onPosition: (v: string) => void;
  equipmentOptions: EquipmentOption[];
  equipment: string[];
  onToggleEquipment: (key: string) => void;
};
