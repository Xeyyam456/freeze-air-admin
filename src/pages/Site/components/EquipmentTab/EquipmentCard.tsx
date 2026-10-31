import { EyeOff, ImageOff, Pencil, Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/ConfirmButton";
import { deleteEquipment } from "@/services/site/content";
import type { EquipmentCardProps } from "@/types/site";

export function EquipmentCard({ item: e, onEdit }: EquipmentCardProps) {
  return (
    <li className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-shadow hover:shadow-[0_12px_32px_rgba(16,24,40,0.1)]">
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary-soft to-bg">
        {e.image_url ? (
          <img src={e.image_url} alt="" className={`h-full w-full object-contain ${e.is_active ? "" : "grayscale"}`} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 px-3 text-center text-muted">
            <ImageOff size={22} />
            <span className="text-[11px] font-medium">Şəkil yoxdur: saytda illüstrasiya</span>
          </div>
        )}
        <span className="absolute left-2.5 top-2.5 rounded-full bg-surface/90 px-2 py-0.5 text-[11px] font-bold text-ink shadow-sm">#{e.sort}</span>
        {!e.is_active && (
          <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-ink/70 py-1 text-[11px] font-semibold text-white">
            <EyeOff size={12} /> Saytda gizlidir
          </span>
        )}
        <div className="absolute right-2.5 top-2.5 flex gap-1.5">
          <button type="button" onClick={onEdit} title="Redaktə et" aria-label="Redaktə et"
            className="grid h-7 w-7 place-items-center rounded-lg bg-surface/90 text-ink shadow-sm hover:bg-primary hover:text-white">
            <Pencil size={14} />
          </button>
          <ConfirmButton onConfirm={() => deleteEquipment(e.id, e.image_url)} title={`${e.title} silinsin`}
            className="grid h-7 w-7 place-items-center rounded-lg bg-surface/90 text-danger shadow-sm hover:bg-danger hover:text-white"
            question="Avadanlıq saytdan və bağlı olduğu obyektlərdən silinəcək. Müvəqqəti gizlətmək üçün “Saytda göstər” işarəsini götürmək kifayətdir.">
            <Trash2 size={14} />
          </ConfirmButton>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="truncate font-semibold">{e.title}</h3>
        <p className="muted mt-1 line-clamp-2 text-xs">{e.text || "İzah yoxdur"}</p>
        {e.place && <p className="mt-auto pt-2 text-xs font-semibold text-primary">{e.place}</p>}
      </div>
    </li>
  );
}
