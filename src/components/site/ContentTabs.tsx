import { useState } from "react";
import { ExternalLink, EyeOff, ImageOff, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteEquipment, deleteSegment } from "@/actions/siteContent";
import { ConfirmButton } from "@/components/ConfirmButton";
import type { Tables } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";
import { useData } from "@/lib/useData";
import { EquipmentEditor } from "./EquipmentEditor";
import { SegmentEditor } from "./SegmentEditor";

const SITE_URL = "http://localhost:3000";
function useEquipmentList() {
  return useData(async () => {
    const { data } = await createClient().from("site_equipment").select("*").order("sort").order("id");
    return data ?? [];
  });
}

const nextSort = (rows: { sort: number }[]) => Math.max(0, ...rows.map((r) => r.sort)) + 1;

// Obyekt növləri: Ev və mənzil, Market və mağaza, ... (saytda /xidmetler/<slug>)
export function SegmentsTab() {
  const [editing, setEditing] = useState<Tables<"site_segments"> | "new" | null>(null);
  const segments = useData(async () => {
    const { data } = await createClient().from("site_segments").select("*").order("sort").order("id");
    return data ?? [];
  });
  const equipment = useEquipmentList();

  if (!segments || !equipment) return <div className="card muted">Yüklənir...</div>;
  const equipmentTitle = (key: string) => equipment.find((e) => e.key === key)?.title ?? key;

  return (
    <div className="space-y-3">
      {editing && (
        <SegmentEditor segment={editing === "new" ? null : editing} nextSort={nextSort(segments)}
          equipmentOptions={equipment} onClose={() => setEditing(null)} />
      )}
      <div className="flex items-center justify-between gap-3">
        <p className="muted text-sm">Ana səhifədəki və Xidmətlər səhifəsindəki kartlar; hər birinin ayrıca səhifəsi var.</p>
        <button type="button" onClick={() => setEditing("new")} className="btn btn-primary btn-sm"><Plus size={14} /> Yeni obyekt növü</button>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {segments.map((s) => (
          <li key={s.id} className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-shadow hover:shadow-[0_12px_32px_rgba(16,24,40,0.1)]">
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
                <button type="button" onClick={() => setEditing(s)} title="Redaktə et" aria-label="Redaktə et"
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
              <a href={`${SITE_URL}/xidmetler/${s.slug}`} target="_blank" rel="noopener noreferrer"
                className="link inline-flex w-fit items-center gap-1 text-xs">
                /xidmetler/{s.slug} <ExternalLink size={11} />
              </a>
              <p className="muted mb-3 mt-2 line-clamp-2 text-sm">{s.summary || "Qısa mətn yoxdur"}</p>
              <div className="mt-auto flex flex-wrap gap-1.5 border-t border-dashed border-line pt-3 text-[11px] font-semibold">
                {s.equipment.length
                  ? s.equipment.map((k) => (
                    <span key={k} className="rounded-full bg-primary-soft px-2 py-0.5 text-primary">{equipmentTitle(k)}</span>
                  ))
                  : <span className="muted">Avadanlıq seçilməyib</span>}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Avadanlıq növləri (saytda /avadanliq və obyekt səhifəsindəki "Tipik avadanlıq")
export function EquipmentTab() {
  const [editing, setEditing] = useState<Tables<"site_equipment"> | "new" | null>(null);
  const items = useEquipmentList();

  if (!items) return <div className="card muted">Yüklənir...</div>;

  return (
    <div className="space-y-3">
      {editing && (
        <EquipmentEditor item={editing === "new" ? null : editing} nextSort={nextSort(items)} onClose={() => setEditing(null)} />
      )}
      <div className="flex items-center justify-between gap-3">
        <p className="muted text-sm">Avadanlıq səhifəsi və obyekt səhifələrindəki “Tipik avadanlıq”. Obyektə bağlamaq: Obyektlər → redaktə.</p>
        <button type="button" onClick={() => setEditing("new")} className="btn btn-primary btn-sm"><Plus size={14} /> Yeni avadanlıq</button>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {items.map((e) => (
          <li key={e.id} className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-shadow hover:shadow-[0_12px_32px_rgba(16,24,40,0.1)]">
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
                <button type="button" onClick={() => setEditing(e)} title="Redaktə et" aria-label="Redaktə et"
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
        ))}
      </ul>
    </div>
  );
}
