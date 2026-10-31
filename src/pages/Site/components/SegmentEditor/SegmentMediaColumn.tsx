import type { SegmentMediaColumnProps } from "@/types/site";
import { POSITION_CLASS } from "../../constants/siteConstants";
import { SiteImagePicker } from "../common/SiteImagePicker";
import { SortActive } from "../common/SortActive";
import { EquipmentToggles } from "./EquipmentToggles";
import { ImagePositionPicker } from "./ImagePositionPicker";

// 1-ci sütun: şəkil, avadanlıq, sıra
export function SegmentMediaColumn({ segment, nextSort, picker, position, onPosition, equipmentOptions, equipment, onToggleEquipment }: SegmentMediaColumnProps) {
  return (
    <div className="space-y-4">
      <SiteImagePicker picker={picker} label="Şəkil" previewClass="relative aspect-[16/9]"
        imgClass={`h-full w-full object-cover ${POSITION_CLASS[position]}`} empty="Şəkil yoxdur: saytda illüstrasiya göstərilir">
        {picker.imageUrl && <ImagePositionPicker value={position} onChange={onPosition} />}
      </SiteImagePicker>
      <EquipmentToggles options={equipmentOptions} selected={equipment} onToggle={onToggleEquipment} />
      <SortActive boxed sort={segment?.sort ?? nextSort} active={segment?.is_active ?? true} />
    </div>
  );
}
