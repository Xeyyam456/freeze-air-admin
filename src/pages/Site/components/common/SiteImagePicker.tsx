import { IconButton } from "@/shared/components/IconButton";
import { labelClass } from "@/shared/components/FormField";
import { ImagePlus, Trash2 } from "lucide-react";
import type { SiteImagePickerProps } from "@/types/site";
import { Button } from "@/shared/components/Button";

// Redaktorda şəkil bloku: önizləmə, "Yüklə / Dəyiş", götür
export function SiteImagePicker({ picker, label, empty, previewClass, imgClass, hint, hintClass = "", children }: SiteImagePickerProps) {
  const { imageUrl, setImageUrl, uploading, fileRef, onFile } = picker;
  return (
    <div>
      <span className={labelClass()}>{label}</span>
      <div className={`${previewClass} grid place-items-center overflow-hidden rounded-xl border border-dashed border-line bg-bg`}>
        {imageUrl
          ? <img src={imageUrl} alt="" className={`${imgClass} ${uploading ? "opacity-50" : ""}`} />
          : <span className="muted px-4 text-center text-xs">{empty}</span>}
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
      {children}
      <div className="mt-2 flex gap-2">
        <Button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} variant="secondary" size="sm" className="flex-1">
          <ImagePlus size={14} /> {uploading ? "Yüklənir..." : imageUrl ? "Dəyiş" : "Yüklə"}
        </Button>
        {imageUrl && (
          <IconButton onClick={() => setImageUrl(null)} className="!h-8" danger title="Şəkli götür" aria-label="Şəkli götür">
            <Trash2 size={15} />
          </IconButton>
        )}
      </div>
      {hint && <p className={`muted ${hintClass}`}>{hint}</p>}
    </div>
  );
}
