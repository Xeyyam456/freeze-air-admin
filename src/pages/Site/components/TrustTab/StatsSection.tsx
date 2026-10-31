import { useState } from "react";
import { EyeOff, Hash, Pencil, Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/ConfirmButton";
import { useData } from "@/lib/useData";
import { deleteStat } from "@/services/site/content";
import { fetchSorted } from "@/services/site/fetchSite";
import type { SiteStat } from "@/types/site";
import { nextSort } from "../../utils/formText";
import { StatEditor } from "./StatEditor";
import { TrustHeader } from "./TrustHeader";

// Rəqəmlər zolağı (ana səhifədə hero-nun altında)
export function StatsSection() {
  const [editing, setEditing] = useState<SiteStat | "new" | null>(null);
  const rows = useData("site-stats", () => fetchSorted("site_stats"));
  if (!rows) return <div className="card muted">Yüklənir...</div>;

  return (
    <section className="card space-y-4">
      {editing && <StatEditor item={editing === "new" ? null : editing} sort={nextSort(rows)} onClose={() => setEditing(null)} />}
      <TrustHeader icon={Hash} title="Rəqəmlər zolağı" addLabel="Yeni rəqəm" onAdd={() => setEditing("new")}
        text="Ana səhifədə hero-nun altında. Ən azı 2 aktiv rəqəm olanda göstərilir (4-ə qədər tövsiyə olunur)." />
      {rows.length === 0 ? (
        <p className="muted rounded-xl border border-dashed border-line px-3 py-6 text-center text-sm">Hələ rəqəm yoxdur: saytda bu zolaq görünmür.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {rows.map((s) => (
            <li key={s.id} className="group relative rounded-2xl border border-line bg-bg p-4">
              <p className={`font-display text-3xl font-extrabold ${s.is_active ? "text-primary" : "text-muted"}`}>{s.value}</p>
              <p className="mt-1 text-sm font-semibold">{s.label}</p>
              <p className="muted mt-2 flex items-center gap-1.5 text-[11px]">#{s.sort}{!s.is_active && <span className="inline-flex items-center gap-1 text-danger"><EyeOff size={11} /> gizlidir</span>}</p>
              <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                <button type="button" onClick={() => setEditing(s)} className="icon-btn !h-7 !w-7" title="Redaktə et" aria-label="Redaktə et"><Pencil size={14} /></button>
                <ConfirmButton onConfirm={() => deleteStat(s.id)} title={`${s.value} ${s.label} silinsin`} className="icon-btn icon-btn-danger !h-7 !w-7" question="Bu rəqəm saytdan silinəcək. Müvəqqəti gizlətmək üçün redaktədə “Saytda göstər”i götür.">
                  <Trash2 size={14} />
                </ConfirmButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
