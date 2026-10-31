import { Field } from "@/components/forms";
import type { ServiceListColumnProps } from "@/types/site";
import { Textarea } from "@/shared/components/Textarea";

// 3-cü sütun: siyahılar və məsləhət
export function ServiceListColumn({ service }: ServiceListColumnProps) {
  return (
    <div className="space-y-3">
      <Field label="Nə daxildir (hər sətir bir bənd)">
        <Textarea name="includes" defaultValue={(service?.includes ?? []).join("\n")} rows={5} className="resize-none !py-2" />
      </Field>
      <Field label="Necə edirik: addımlar (hər sətir bir addım)">
        <Textarea name="steps" defaultValue={(service?.steps ?? []).join("\n")} rows={4} className="resize-none !py-2" />
      </Field>
      <Field label="Məsləhət (göy zolaq)">
        <Textarea name="note" defaultValue={service?.note ?? ""} maxLength={300} rows={2} className="resize-none !py-2" />
      </Field>
    </div>
  );
}
