import type { SegmentTextColumnProps } from "@/types/site";
import { Input } from "@/shared/components/Input";
import { Textarea } from "@/shared/components/Textarea";
import { FormField } from "@/shared/components/FormField";

// 2-ci sütun: ad, ünvan və mətnlər
export function SegmentTextColumn({ segment, ts }: SegmentTextColumnProps) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
        <FormField label="Ad">
          <Input value={ts.title} maxLength={80} required onChange={(e) => ts.onTitle(e.target.value)} />
        </FormField>
        <FormField label="Ünvan">
          <Input value={ts.slug} maxLength={40} required onChange={(e) => ts.onSlug(e.target.value)} />
        </FormField>
      </div>
      {segment && ts.slug !== segment.slug && (
        <p className="-mt-1 text-xs font-semibold text-danger">Ünvan dəyişsə, köhnə link işləməyəcək.</p>
      )}
      <FormField label="Kartdakı qısa mətn">
        <Input name="summary" defaultValue={segment?.summary ?? ""} maxLength={200} />
      </FormField>
      <FormField label="Səhifənin başlıq izahı">
        <Textarea name="lead" defaultValue={segment?.lead ?? ""} maxLength={400} rows={3} className="resize-none !py-2" />
      </FormField>
      <FormField label="Məsləhət (göy blok)">
        <Textarea name="note" defaultValue={segment?.note ?? ""} maxLength={400} rows={3} className="resize-none !py-2" />
      </FormField>
    </div>
  );
}
