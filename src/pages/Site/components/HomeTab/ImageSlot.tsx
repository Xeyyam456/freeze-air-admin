import { ImagePlus, Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/ConfirmButton";
import type { ImageSlotProps } from "@/types/site";
import { useImageSlot } from "../../hooks/useImageSlot";

// Şəkil yeri: yüklənən kimi bazaya yazılır, köhnə şəkil silinir. Şəkil kəsilmir (öz nisbətində).
export function ImageSlot({ field, url, folder, hint, small = false, compact = false, hideImage = false, empty = "Şəkil yoxdur: saytda illüstrasiya göstərilir" }: ImageSlotProps) {
  const { uploading, fileRef, onFile, onRemove } = useImageSlot({ field, url, folder });

  return (
    <div className={small ? "max-w-xs" : ""}>
      {!hideImage && (
        <div className={`grid place-items-center overflow-hidden rounded-xl border border-dashed border-line bg-bg ${compact ? "min-h-24 p-3" : small ? "min-h-32" : "min-h-44"}`}>
          {url
            ? <img src={url} alt="" className={`block ${compact ? "max-h-20 w-auto" : "h-auto w-full"} ${uploading ? "opacity-50" : ""}`} />
            : <span className="muted px-4 text-center text-xs">{uploading ? "Yüklənir..." : empty}</span>}
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
      <div className={`flex flex-wrap items-center gap-2 ${hideImage ? "" : "mt-2"}`}>
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn btn-secondary btn-sm">
          <ImagePlus size={14} /> {uploading ? "Yüklənir..." : url ? "Dəyiş" : "Yüklə"}
        </button>
        {url && !uploading && (
          <ConfirmButton onConfirm={onRemove} title="Şəkli sil" success={false} className="icon-btn icon-btn-danger !h-8"
            question="Şəkil silinəcək, saytda yenidən ikon və ya illüstrasiya göstəriləcək.">
            <Trash2 size={15} />
          </ConfirmButton>
        )}
        {hint && <span className="muted text-[11px]">{hint}</span>}
      </div>
    </div>
  );
}
