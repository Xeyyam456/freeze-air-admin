import { ImagePlus, Trash2 } from "lucide-react";
import type { SiteImagePickerProps } from "@/types/site";

// Redaktorda şəkil bloku: önizləmə, "Yüklə / Dəyiş", götür
export function SiteImagePicker({ picker, label, empty, previewClass, imgClass, hint, hintClass = "", children }: SiteImagePickerProps) {
  const { imageUrl, setImageUrl, uploading, fileRef, onFile } = picker;
  return (
    <div>
      <span className="label">{label}</span>
      <div className={`${previewClass} grid place-items-center overflow-hidden rounded-xl border border-dashed border-line bg-bg`}>
        {imageUrl
          ? <img src={imageUrl} alt="" className={`${imgClass} ${uploading ? "opacity-50" : ""}`} />
          : <span className="muted px-4 text-center text-xs">{empty}</span>}
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
      {children}
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
      {hint && <p className={`muted ${hintClass}`}>{hint}</p>}
    </div>
  );
}
