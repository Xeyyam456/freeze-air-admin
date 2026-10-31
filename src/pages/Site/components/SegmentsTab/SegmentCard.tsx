import { EyeOff, ImageOff, Pencil, Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/ConfirmButton";
import { deleteSegment } from "@/services/site/content";
import type { SegmentCardProps } from "@/types/site";

export function SegmentCard({ segment: s, equipmentTitle, onEdit }: SegmentCardProps) {
  return (
    <li className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-shadow hover:shadow-[0_12px_32px_rgba(16,24,40,0.1)]">
      {/* Şəkil: kartın yuxarısı; düymələr küncdə */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary-soft to-bg">
        {s.image_url ? (
          <img src={s.image_url} alt="" className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${s.is_active ? "" : "grayscale"}`} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 text-muted">
            <ImageOff size={24} />
            <span className="text-xs font-medium">Şəkil yoxdur: saytda illüstrasiya göstərilir</span>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-surface/90 px-2.5 py-1 text-[11px] font-bold text-ink shadow-sm backdrop-blur">
          #{s.sort}
        </span>
        {!s.is_active && (
          <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-ink/70 py-1.5 text-xs font-semibold text-white">
            <EyeOff size={13} /> Saytda gizlidir
          </span>
        )}
        <div className="absolute right-3 top-3 flex gap-1.5">
          <button type="button" onClick={onEdit} title="Redaktə et" aria-label="Redaktə et"
            className="grid h-8 w-8 place-items-center rounded-lg bg-surface/90 text-ink shadow-sm backdrop-blur hover:bg-primary hover:text-white">
            <Pencil size={15} />
          </button>
          <ConfirmButton onConfirm={() => deleteSegment(s.id, s.image_url)} title={`${s.title} silinsin`}
            className="grid h-8 w-8 place-items-center rounded-lg bg-surface/90 text-danger shadow-sm backdrop-blur hover:bg-danger hover:text-white"
            question="Saytdan bu kart və onun səhifəsi silinəcək. Müvəqqəti gizlətmək üçün “Saytda göstər” işarəsini götürmək kifayətdir.">
            <Trash2 size={15} />
          </ConfirmButton>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="card-title truncate">{s.title}</h3>
        <span className="muted text-xs">/xidmetler/{s.slug}</span>
        <p className="muted mb-3 mt-2 line-clamp-2 text-sm">{s.summary || "Qısa mətn yoxdur"}</p>
        <div className="mt-auto flex flex-wrap gap-1.5 border-t border-dashed border-line pt-3 text-[11px] font-semibold">
          {s.equipment.length
            ? s.equipment.map((k) => <span key={k} className="rounded-full bg-primary-soft px-2 py-0.5 text-primary">{equipmentTitle(k)}</span>)
            : <span className="muted">Avadanlıq seçilməyib</span>}
        </div>
      </div>
    </li>
  );
}
