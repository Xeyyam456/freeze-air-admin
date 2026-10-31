import type { ServiceMediaColumnProps } from "@/types/site";
import { SiteImagePicker } from "../common/SiteImagePicker";
import { SortActive } from "../common/SortActive";
import { IconPicker } from "./IconPicker";

// 1-ci sütun: şəkil, ikon, sıra
export function ServiceMediaColumn({ service, nextSort, picker, icon, onIcon }: ServiceMediaColumnProps) {
  return (
    <div className="space-y-4">
      <SiteImagePicker picker={picker} label="Şəkil (istəyə bağlı)" previewClass="aspect-video" imgClass="h-full w-full object-contain"
        empty="Şəkil yoxdur: saytda ikon göstərilir" hint="Tövsiyə: 16:9, məsələn 1600×900 px." hintClass="mt-1.5 text-[11px]" />
      <IconPicker icon={icon} onIcon={onIcon} />
      <SortActive boxed sort={service?.sort ?? nextSort} active={service?.is_active ?? true} />
    </div>
  );
}
