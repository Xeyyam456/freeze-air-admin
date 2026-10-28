import { useRef, useState } from "react";
import {
  Droplets, Fan, Gauge, ImagePlus, Refrigerator, ShieldCheck, Snowflake, ThermometerSnowflake, Trash2, Wind, Wrench, X, Zap,
  type LucideIcon,
} from "lucide-react";
import { removeSiteImage, saveService, slugify, uploadSiteImage } from "@/actions/siteContent";
import { Field } from "@/components/forms";
import { Modal } from "@/components/Modal";
import type { Tables } from "@/types/database";
import { toast } from "@/lib/toast";

type Service = Tables<"site_services">;

// Saytdakı ikonlarla eyni ad → ikon (bazadakı icon dəyərləri)
export const SERVICE_ICONS: { name: string; icon: LucideIcon }[] = [
  { name: "fan", icon: Fan },
  { name: "wrench", icon: Wrench },
  { name: "gauge", icon: Gauge },
  { name: "thermometer", icon: ThermometerSnowflake },
  { name: "wind", icon: Wind },
  { name: "refrigerator", icon: Refrigerator },
  { name: "snowflake", icon: Snowflake },
  { name: "zap", icon: Zap },
  { name: "droplets", icon: Droplets },
  { name: "shield", icon: ShieldCheck },
];

export function serviceIcon(name: string): LucideIcon {
  return SERVICE_ICONS.find((i) => i.name === name)?.icon ?? Wrench;
}

const lines = (v: string) => v.split("\n").map((l) => l.trim()).filter(Boolean);

// Xidməti yaratmaq / dəyişmək: siyahıdakı sətir + saytda /xidmet/<ünvan> səhifəsi
export function ServiceEditor({ service, nextSort, onClose }: { service: Service | null; nextSort: number; onClose: () => void }) {
  const [title, setTitle] = useState(service?.title ?? "");
  const [slug, setSlug] = useState(service?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!service);
  const [icon, setIcon] = useState(service?.icon ?? "wrench");
  const [imageUrl, setImageUrl] = useState<string | null>(service?.image_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [pending, setPending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadedRef = useRef<string[]>([]); // bu pəncərədə yüklənib saxlanmayan şəkillər (ləğvdə silinir)

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadSiteImage(file, "services");
      uploadedRef.current.push(url);
      setImageUrl(url);
    } catch {
      toast.error("Şəkil yüklənmədi. JPG, PNG və ya WebP, 3 MB-dan kiçik olmalıdır.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function cancel() {
    for (const url of uploadedRef.current) await removeSiteImage(url);
    onClose();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!title.trim()) return toast.error("Ad vacibdir.");
    if (!/^[a-z0-9-]{1,40}$/.test(slug)) return toast.error("Ünvan yalnız kiçik latın hərfləri, rəqəm və tire ola bilər.");

    setPending(true);
    const err = await saveService(service?.id ?? null, {
      title: title.trim(),
      slug,
      text: String(fd.get("text") ?? "").trim(),
      lead: String(fd.get("lead") ?? "").trim(),
      details: String(fd.get("details") ?? "").trim(),
      includes: lines(String(fd.get("includes") ?? "")),
      steps: lines(String(fd.get("steps") ?? "")),
      note: String(fd.get("note") ?? "").trim(),
      image_url: imageUrl,
      icon,
      sort: Number(fd.get("sort") ?? 0) || 0,
      is_active: fd.get("is_active") === "on",
    });
    setPending(false);
    if (err) return toast.error(err);
    if (service?.image_url && service.image_url !== imageUrl) await removeSiteImage(service.image_url);
    for (const url of uploadedRef.current) if (url !== imageUrl) await removeSiteImage(url);
    toast.success(service ? "Xidmət yadda saxlanıldı" : "Xidmət əlavə edildi", "Saytda ən gec 1 dəqiqəyə görünəcək.");
    onClose();
  }

  return (
    <Modal onClose={cancel} labelledBy="service-editor-title" className="!max-w-[1180px] !p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 id="service-editor-title" className="text-lg font-bold">{service ? "Xidməti redaktə et" : "Yeni xidmət"}</h2>
          <p className="muted text-xs">Xidmətlər siyahısı, footer və saytda /xidmet/{slug || "..."} səhifəsi</p>
        </div>
        <button type="button" onClick={cancel} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>

      {/* Üç sütun: sürüşmə olmadan bir ekrana sığır */}
      <form onSubmit={onSubmit} className="grid gap-5 lg:grid-cols-[260px_1fr_1fr]">
        {/* 1. Şəkil, ikon, sıra */}
        <div className="space-y-4">
          <div>
            <span className="label">Şəkil (istəyə bağlı)</span>
            <div className="grid aspect-video place-items-center overflow-hidden rounded-xl border border-dashed border-line bg-bg">
              {imageUrl
                ? <img src={imageUrl} alt="" className={`h-full w-full object-contain ${uploading ? "opacity-50" : ""}`} />
                : <span className="muted px-4 text-center text-xs">Şəkil yoxdur: saytda ikon göstərilir</span>}
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn btn-secondary btn-sm flex-1">
                <ImagePlus size={14} /> {uploading ? "Yüklənir..." : imageUrl ? "Dəyiş" : "Yüklə"}
              </button>
              {imageUrl && (
                <button type="button" onClick={() => setImageUrl(null)} className="icon-btn icon-btn-danger !h-8" title="Şəkli götür" aria-label="Şəkli götür">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
            <p className="muted mt-1.5 text-[11px]">Tövsiyə: 16:9, məsələn 1600×900 px.</p>
          </div>

          <div>
            <span className="label">İkon</span>
            <div className="grid grid-cols-5 gap-1.5">
              {SERVICE_ICONS.map(({ name, icon: Icon }) => (
                <button key={name} type="button" onClick={() => setIcon(name)} aria-label={name}
                  className={`grid h-10 place-items-center rounded-xl border transition-colors ${
                    icon === name ? "border-primary bg-primary-soft text-primary" : "border-line text-muted hover:border-primary"
                  }`}>
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl bg-bg px-3 py-2">
            <label className="flex items-center gap-2 text-sm font-semibold">
              Sıra <input name="sort" type="number" defaultValue={service?.sort ?? nextSort} className="field !h-8 !w-16 !px-2" />
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input name="is_active" type="checkbox" defaultChecked={service?.is_active ?? true} className="h-4 w-4 accent-[var(--color-primary)]" />
              Saytda göstər
            </label>
          </div>
        </div>

        {/* 2. Ad və mətnlər */}
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_170px]">
            <Field label="Ad">
              <input value={title} maxLength={80} required className="field"
                onChange={(e) => { setTitle(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }} />
            </Field>
            <Field label="Ünvan">
              <input value={slug} maxLength={40} required className="field"
                onChange={(e) => { setSlug(e.target.value.toLowerCase()); setSlugTouched(true); }} />
            </Field>
          </div>
          {service && slug !== service.slug && (
            <p className="-mt-1 text-xs font-semibold text-danger">Ünvan dəyişsə, köhnə link işləməyəcək.</p>
          )}
          <Field label="Siyahıdakı qısa izah">
            <input name="text" defaultValue={service?.text ?? ""} maxLength={300} className="field" />
          </Field>
          <Field label="Səhifənin başlıq izahı">
            <textarea name="lead" defaultValue={service?.lead ?? ""} maxLength={300} rows={2} className="field resize-none !py-2" />
          </Field>
          <Field label="Ətraflı mətn (abzasları boş sətirlə ayırın)">
            <textarea name="details" defaultValue={service?.details ?? ""} maxLength={3000} rows={5} className="field resize-none !py-2" />
          </Field>
        </div>

        {/* 3. Siyahılar və məsləhət */}
        <div className="space-y-3">
          <Field label="Nə daxildir (hər sətir bir bənd)">
            <textarea name="includes" defaultValue={(service?.includes ?? []).join("\n")} rows={5} className="field resize-none !py-2" />
          </Field>
          <Field label="Necə edirik: addımlar (hər sətir bir addım)">
            <textarea name="steps" defaultValue={(service?.steps ?? []).join("\n")} rows={4} className="field resize-none !py-2" />
          </Field>
          <Field label="Məsləhət (göy zolaq)">
            <textarea name="note" defaultValue={service?.note ?? ""} maxLength={300} rows={2} className="field resize-none !py-2" />
          </Field>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line pt-4 lg:col-span-3">
          <button type="button" onClick={cancel} className="btn btn-cancel">Ləğv et</button>
          <button type="submit" disabled={pending || uploading} className="btn btn-primary min-w-40">
            {pending ? "Gözləyin..." : "Yadda saxla"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
