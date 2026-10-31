import { FileText, ImagePlus } from "lucide-react";
import type { NewFilesProps } from "@/types/workLogs";

// Yeni fayllar: akt (şəkil və ya PDF; yenisi köhnəni əvəz edir) və işin şəkilləri
export function NewFiles({ act, hasAct, photos, onAct, onPhotos }: NewFilesProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-line px-3 py-3 text-center hover:border-primary">
        <FileText size={18} className="text-primary" />
        <span className="text-sm font-semibold">Akt</span>
        <span className="muted w-full truncate text-xs">{act ? act.name : hasAct ? "yenisi köhnəni əvəz edir" : "şəkil və ya PDF"}</span>
        <input type="file" accept="image/*,application/pdf" className="sr-only"
          onChange={(e) => onAct(e.target.files?.[0] ?? null)} />
      </label>
      <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-line px-3 py-3 text-center hover:border-primary">
        <ImagePlus size={18} className="text-primary" />
        <span className="text-sm font-semibold">İşin şəkilləri</span>
        <span className="muted text-xs">{photos.length ? `${photos.length} şəkil seçildi` : "bir neçə şəkil"}</span>
        <input type="file" accept="image/*" multiple className="sr-only"
          onChange={(e) => onPhotos(Array.from(e.target.files ?? []))} />
      </label>
    </div>
  );
}
