import { Field } from "@/components/forms";
import type { ServiceTextColumnProps } from "@/types/site";
import { Input } from "@/shared/components/Input";
import { Textarea } from "@/shared/components/Textarea";

// 2-ci sütun: ad, ünvan və mətnlər
export function ServiceTextColumn({ service, ts }: ServiceTextColumnProps) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_170px]">
        <Field label="Ad">
          <Input value={ts.title} maxLength={80} required onChange={(e) => ts.onTitle(e.target.value)} />
        </Field>
        <Field label="Ünvan">
          <Input value={ts.slug} maxLength={40} required onChange={(e) => ts.onSlug(e.target.value)} />
        </Field>
      </div>
      {service && ts.slug !== service.slug && (
        <p className="-mt-1 text-xs font-semibold text-danger">Ünvan dəyişsə, köhnə link işləməyəcək.</p>
      )}
      <Field label="Siyahıdakı qısa izah">
        <Input name="text" defaultValue={service?.text ?? ""} maxLength={300} />
      </Field>
      <Field label="Səhifənin başlıq izahı">
        <Textarea name="lead" defaultValue={service?.lead ?? ""} maxLength={300} rows={2} className="resize-none !py-2" />
      </Field>
      <Field label="Ətraflı mətn (abzasları boş sətirlə ayırın)">
        <Textarea name="details" defaultValue={service?.details ?? ""} maxLength={3000} rows={5} className="resize-none !py-2" />
      </Field>
    </div>
  );
}
