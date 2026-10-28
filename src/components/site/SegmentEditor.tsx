import { useRef, useState } from "react";
import { ImagePlus, Trash2, X } from "lucide-react";
import { removeSiteImage, saveSegment, slugify, uploadSiteImage, type SegmentInput } from "@/actions/siteContent";
import { Field } from "@/components/forms";
import { Modal } from "@/components/Modal";
import type { Tables } from "@/types/database";
import { toast } from "@/lib/toast";

type Segment = Tables<"site_segments">;

// Şəkil saytda kəsiləndə görünən hissə
const POSITIONS = [
  { value: "top", label: "Yuxarı" },
  { value: "center", label: "Orta" },
  { value: "bottom", label: "Aşağı" },
];
const POSITION_CLASS: Record<string, string> = { top: "object-top", center: "object-center", bottom: "object-bottom" };

const lines = (v: string) => v.split("\n").map((l) => l.trim()).filter(Boolean);

// Obyekt növünü (Ev və mənzil və s.) yaratmaq / dəyişmək
// equipmentOptions: "Avadanlıq" tabındakı siyahı (key → ad)
export function SegmentEditor({ segment, nextSort, equipmentOptions, onClose }: {
  segment: Segment | null;
  nextSort: number;
  equipmentOptions: { key: string; title: string }[];
  onClose: () => void;
}) {
  const [title, setTitle] = useState(segment?.title ?? "");
  const [slug, setSlug] = useState(segment?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!segment);
  const [equipment, setEquipment] = useState<string[]>(segment?.equipment ?? ["split"]);
  const [imageUrl, setImageUrl] = useState<string | null>(segment?.image_url ?? null);
  const [imagePosition, setImagePosition] = useState(segment?.image_position ?? "center");
  const [uploading, setUploading] = useState(false);
  const [pending, setPending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadedRef = useRef<string[]>([]); // bu pəncərədə yüklənib saxlanmayan şəkillər (ləğvdə silinir)

  const toggleEquipment = (kind: string) =>
    setEquipment((list) => (list.includes(kind) ? list.filter((k) => k !== kind) : [...list, kind]));

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadSiteImage(file, "segments");
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
    const input: SegmentInput = {
      title: title.trim(),
      slug: slug.trim(),
      summary: String(fd.get("summary") ?? "").trim(),
      lead: String(fd.get("lead") ?? "").trim(),
      issues: lines(String(fd.get("issues") ?? "")),
      work: lines(String(fd.get("work") ?? "")),
      note: String(fd.get("note") ?? "").trim(),
      equipment,
      image_url: imageUrl,
      image_position: imagePosition,
      sort: Number(fd.get("sort") ?? 0) || 0,
      is_active: fd.get("is_active") === "on",
    };
    if (!input.title) return toast.error("Ad vacibdir.");
    if (!/^[a-z0-9-]{1,40}$/.test(input.slug)) return toast.error("Ünvan yalnız kiçik latın hərfləri, rəqəm və tire ola bilər.");

    setPending(true);
    const err = await saveSegment(segment?.id ?? null, input);
    setPending(false);
    if (err) return toast.error(err);
    // Köhnə şəkil dəyişdirilibsə və ya silinibsə, storage-dan da silinir; saxlanmayan ara şəkillər də
    if (segment?.image_url && segment.image_url !== imageUrl) await removeSiteImage(segment.image_url);
    for (const url of uploadedRef.current) if (url !== imageUrl) await removeSiteImage(url);
    onClose();
  }

  return (
    <Modal onClose={cancel} labelledBy="segment-editor-title" className="!max-w-[1180px] !p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 id="segment-editor-title" className="text-lg font-bold">{segment ? "Obyekt növünü redaktə et" : "Yeni obyekt növü"}</h2>
          <p className="muted text-xs">Saytda ana səhifədəki kart və /xidmetler/{slug || "..."} səhifəsi</p>
        </div>
        <button type="button" onClick={cancel} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>

      {/* Üç sütun: sürüşmə olmadan bir ekrana sığır */}
      <form onSubmit={onSubmit} className="grid gap-5 lg:grid-cols-[260px_1fr_1fr]">
        {/* 1. Şəkil, avadanlıq, sıra */}
        <div className="space-y-4">
          <div>
            <span className="label">Şəkil</span>
            <div className="relative grid aspect-[16/9] place-items-center overflow-hidden rounded-xl border border-dashed border-line bg-bg">
              {imageUrl
                ? <img src={imageUrl} alt="" className={`h-full w-full object-cover ${POSITION_CLASS[imagePosition]} ${uploading ? "opacity-50" : ""}`} />
                : <span className="muted px-4 text-center text-xs">Şəkil yoxdur: saytda illüstrasiya göstərilir</span>}
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
            {imageUrl && (
              <div className="mt-2">
                <span className="muted text-xs font-medium">Saytda şəklin hansı hissəsi görünsün</span>
                <div className="mt-1 grid grid-cols-3 gap-1 rounded-lg bg-bg p-1">
                  {POSITIONS.map((p) => (
                    <button key={p.value} type="button" onClick={() => setImagePosition(p.value)}
                      className={`rounded-md py-1 text-xs font-semibold transition-colors ${
                        imagePosition === p.value ? "bg-surface text-primary shadow-sm" : "text-muted hover:text-ink"
                      }`}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
          </div>

          <div>
            <span className="label">Tipik avadanlıq</span>
            <div className="flex flex-wrap gap-1.5">
              {equipmentOptions.length === 0 && <span className="muted text-xs">Əvvəlcə “Avadanlıq” tabında avadanlıq əlavə edin.</span>}
              {equipmentOptions.map((o) => {
                const on = equipment.includes(o.key);
                return (
                  <button key={o.key} type="button" onClick={() => toggleEquipment(o.key)}
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
                      on ? "border-primary bg-primary-soft text-primary" : "border-line text-muted hover:border-primary"
                    }`}>
                    {o.title}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl bg-bg px-3 py-2">
            <label className="flex items-center gap-2 text-sm font-semibold">
              Sıra <input name="sort" type="number" defaultValue={segment?.sort ?? nextSort} className="field !h-8 !w-16 !px-2" />
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input name="is_active" type="checkbox" defaultChecked={segment?.is_active ?? true} className="h-4 w-4 accent-[var(--color-primary)]" />
              Saytda göstər
            </label>
          </div>
        </div>

        {/* 2. Ad və mətnlər */}
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
            <Field label="Ad">
              <input value={title} maxLength={80} required className="field"
                onChange={(e) => { setTitle(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }} />
            </Field>
            <Field label="Ünvan">
              <input value={slug} maxLength={40} required className="field"
                onChange={(e) => { setSlug(e.target.value.toLowerCase()); setSlugTouched(true); }} />
            </Field>
          </div>
          {segment && slug !== segment.slug && (
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

        {/* 3. Siyahılar */}
        <div className="space-y-3">
          <Field label="Problemlər (hər sətir bir bənd)">
            <textarea name="issues" defaultValue={(segment?.issues ?? []).join("\n")} rows={6} className="field resize-none !py-2" />
          </Field>
          <Field label="Nə edirik (hər sətir bir bənd)">
            <textarea name="work" defaultValue={(segment?.work ?? []).join("\n")} rows={6} className="field resize-none !py-2" />
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
