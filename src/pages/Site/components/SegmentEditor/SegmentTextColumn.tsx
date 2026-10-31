import { Field } from "@/components/forms";
import type { SegmentTextColumnProps } from "@/types/site";

// 2-ci sütun: ad, ünvan və mətnlər
export function SegmentTextColumn({ segment, ts }: SegmentTextColumnProps) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
        <Field label="Ad">
          <input value={ts.title} maxLength={80} required className="field" onChange={(e) => ts.onTitle(e.target.value)} />
        </Field>
        <Field label="Ünvan">
          <input value={ts.slug} maxLength={40} required className="field" onChange={(e) => ts.onSlug(e.target.value)} />
        </Field>
      </div>
      {segment && ts.slug !== segment.slug && (
        <p className="-mt-1 text-xs font-semibold text-danger">Ünvan dəyişsə, köhnə link işləməyəcək.</p>
      )}
      <Field label="Kartdakı qısa mətn">
        <input name="summary" defaultValue={segment?.summary ?? ""} maxLength={200} className="field" />
      </Field>
      <Field label="Səhifənin başlıq izahı">
        <textarea name="lead" defaultValue={segment?.lead ?? ""} maxLength={400} rows={3} className="field resize-none !py-2" />
      </Field>
      <Field label="Məsləhət (göy blok)">
        <textarea name="note" defaultValue={segment?.note ?? ""} maxLength={400} rows={3} className="field resize-none !py-2" />
      </Field>
    </div>
  );
}
