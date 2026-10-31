import type { SegmentListColumnProps } from "@/types/site";
import { Textarea } from "@/shared/components/Textarea";
import { FormField } from "@/shared/components/FormField";

// 3-cü sütun: siyahılar (hər sətir bir bənd)
export function SegmentListColumn({ segment }: SegmentListColumnProps) {
  return (
    <div className="space-y-3">
      <FormField label="Problemlər (hər sətir bir bənd)">
        <Textarea name="issues" defaultValue={(segment?.issues ?? []).join("\n")} rows={6} className="resize-none !py-2" />
      </FormField>
      <FormField label="Nə edirik (hər sətir bir bənd)">
        <Textarea name="work" defaultValue={(segment?.work ?? []).join("\n")} rows={6} className="resize-none !py-2" />
      </FormField>
    </div>
  );
}
