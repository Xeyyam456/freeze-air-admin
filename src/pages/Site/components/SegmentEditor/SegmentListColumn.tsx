import { Field } from "@/components/forms";
import type { SegmentListColumnProps } from "@/types/site";

// 3-cü sütun: siyahılar (hər sətir bir bənd)
export function SegmentListColumn({ segment }: SegmentListColumnProps) {
  return (
    <div className="space-y-3">
      <Field label="Problemlər (hər sətir bir bənd)">
        <textarea name="issues" defaultValue={(segment?.issues ?? []).join("\n")} rows={6} className="field resize-none !py-2" />
      </Field>
      <Field label="Nə edirik (hər sətir bir bənd)">
        <textarea name="work" defaultValue={(segment?.work ?? []).join("\n")} rows={6} className="field resize-none !py-2" />
      </Field>
    </div>
  );
}
