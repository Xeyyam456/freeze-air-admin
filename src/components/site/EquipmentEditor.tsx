import { useRef, useState } from "react";
import { ImagePlus, Trash2, X } from "lucide-react";
import { removeSiteImage, saveEquipment, slugify, uploadSiteImage } from "@/actions/siteContent";
import { Field } from "@/components/forms";
import { Modal } from "@/shared/components/Modal";
import type { Tables } from "@/types/database";
import { toast } from "@/lib/toast";

type Equipment = Tables<"site_equipment">;

// Saytda hazır illüstrasiyası olan açarlar (şəkil yüklənməyibsə, onlar göstərilir)
export const ILLUSTRATED_KEYS = ["split", "cassette", "floor", "ducted", "outdoor"];

// Avadanlıq növünü (Divar tipli split və s.) yaratmaq / dəyişmək
export function EquipmentEditor({ item, nextSort, onClose }: { item: Equipment | null; nextSort: number; onClose: () => void }) {
  const [title, setTitle] = useState(item?.title ?? "");
  const [key, setKey] = useState(item?.key ?? "");
  const [keyTouched, setKeyTouched] = useState(!!item);
  const [imageUrl, setImageUrl] = useState<string | null>(item?.image_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [pending, setPending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadedRef = useRef<string[]>([]); // bu pəncərədə yüklənib saxlanmayan şəkillər (ləğvdə silinir)

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadSiteImage(file, "equipment");
      uploadedRef.current.push(url);
      setImageUrl(url);
    } catch {
      toast.error("Şəkil yüklənmədi. JPG, PNG və ya WebP olmalıdır.");
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
    if (!/^[a-z0-9-]{1,40}$/.test(key)) return toast.error("Açar yalnız kiçik latın hərfləri, rəqəm və tire ola bilər.");

    setPending(true);
    const err = await saveEquipment(item?.id ?? null, {
      title: title.trim(),
      key,
      text: String(fd.get("text") ?? "").trim(),
      place: String(fd.get("place") ?? "").trim(),
      image_url: imageUrl,
      sort: Number(fd.get("sort") ?? 0) || 0,
      is_active: fd.get("is_active") === "on",
    });
    setPending(false);
    if (err) return toast.error(err);
    if (item?.image_url && item.image_url !== imageUrl) await removeSiteImage(item.image_url);
    for (const url of uploadedRef.current) if (url !== imageUrl) await removeSiteImage(url);
    onClose();
  }

  const illustrated = ILLUSTRATED_KEYS.includes(key);

  return (
    <Modal onClose={cancel} labelledBy="equipment-editor-title" className="!max-w-3xl !p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="equipment-editor-title" className="text-lg font-bold">{item ? "Avadanlığı redaktə et" : "Yeni avadanlıq"}</h2>
        <button type="button" onClick={cancel} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>

      <form onSubmit={onSubmit} className="grid gap-5 md:grid-cols-[280px_1fr]">
        <div>
          <span className="label">Şəkil</span>
          <div className="grid aspect-video place-items-center overflow-hidden rounded-xl border border-dashed border-line bg-bg">
            {imageUrl
              ? <img src={imageUrl} alt="" className={`h-full w-full object-contain ${uploading ? "opacity-50" : ""}`} />
              : <span className="muted px-4 text-center text-xs">
                {illustrated ? "Şəkil yoxdur: saytda hazır illüstrasiya göstərilir" : "Şəkil yoxdur: saytda ikon göstərilir"}
              </span>}
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
          <p className="muted mt-2 text-[11px] leading-snug">Tövsiyə: 16:9, məsələn 1600×900 px; avadanlıq ortada.</p>
        </div>

        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
            <Field label="Ad">
              <input value={title} maxLength={80} required className="field"
                onChange={(e) => { setTitle(e.target.value); if (!keyTouched) setKey(slugify(e.target.value)); }} />
            </Field>
            <Field label="Açar">
              <input value={key} maxLength={40} required className="field"
                onChange={(e) => { setKey(e.target.value.toLowerCase()); setKeyTouched(true); }} />
            </Field>
          </div>
          {item && key !== item.key && (
            <p className="-mt-1 text-xs font-semibold text-danger">Açar dəyişsə, bu avadanlıq obyektlərdən ayrılacaq; orada yenidən seçmək lazımdır.</p>
          )}
          <Field label="İzah">
            <textarea name="text" defaultValue={item?.text ?? ""} maxLength={300} rows={3} className="field resize-none !py-2" />
          </Field>
          <Field label="Harada işlənir">
            <input name="place" defaultValue={item?.place ?? ""} maxLength={120} placeholder="Ofis, filial, mənzil" className="field" />
          </Field>
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 text-sm font-semibold">
              Sıra <input name="sort" type="number" defaultValue={item?.sort ?? nextSort} className="field !h-8 !w-16 !px-2" />
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input name="is_active" type="checkbox" defaultChecked={item?.is_active ?? true} className="h-4 w-4 accent-[var(--color-primary)]" />
              Saytda göstər
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line pt-4 md:col-span-2">
          <button type="button" onClick={cancel} className="btn btn-cancel">Ləğv et</button>
          <button type="submit" disabled={pending || uploading} className="btn btn-primary min-w-40">
            {pending ? "Gözləyin..." : "Yadda saxla"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
