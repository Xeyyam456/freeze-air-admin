import { useState } from "react";
import { EyeOff, HelpCircle, Pencil, Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/ConfirmButton";
import { useData } from "@/lib/useData";
import { deleteFaq } from "@/services/site/content";
import { fetchSorted } from "@/services/site/fetchSite";
import type { SiteFaq } from "@/types/site";
import { nextSort } from "../../utils/formText";
import { FaqEditor } from "./FaqEditor";
import { TrustHeader } from "./TrustHeader";

// Tez-tez verilən suallar (ana səhifənin altında)
export function FaqSection() {
  const [editing, setEditing] = useState<SiteFaq | "new" | null>(null);
  const rows = useData("site-faq", () => fetchSorted("site_faq"));
  if (!rows) return <div className="card muted">Yüklənir...</div>;

  return (
    <section className="card space-y-4">
      {editing && <FaqEditor item={editing === "new" ? null : editing} sort={nextSort(rows)} onClose={() => setEditing(null)} />}
      <TrustHeader icon={HelpCircle} title="Tez-tez verilən suallar" addLabel="Yeni sual" onAdd={() => setEditing("new")}
        text="Ana səhifənin altında açılan siyahı kimi görünür və Google üçün də işarələnir. Cavabı real və dəqiq yaz." />
      {rows.length === 0 ? (
        <p className="muted rounded-xl border border-dashed border-line px-3 py-6 text-center text-sm">Hələ sual yoxdur: saytda bu bölmə görünmür.</p>
      ) : (
        <ul className="divide-y divide-line rounded-2xl border border-line">
          {rows.map((f) => (
            <li key={f.id} className="flex items-start gap-3 px-4 py-3">
              <span className="muted mt-0.5 w-6 shrink-0 text-xs font-bold">#{f.sort}</span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold ${f.is_active ? "" : "text-muted"}`}>{f.question}{!f.is_active && <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-semibold text-danger"><EyeOff size={11} /> gizlidir</span>}</p>
                <p className="muted mt-0.5 line-clamp-2 text-[13px]">{f.answer}</p>
              </div>
              <button type="button" onClick={() => setEditing(f)} className="icon-btn !h-7 !w-7" title="Redaktə et" aria-label="Redaktə et"><Pencil size={14} /></button>
              <ConfirmButton onConfirm={() => deleteFaq(f.id)} title="Sual silinsin" className="icon-btn icon-btn-danger !h-7 !w-7" question="Bu sual saytdan silinəcək. Müvəqqəti gizlətmək üçün redaktədə “Saytda göstər”i götür.">
                <Trash2 size={14} />
              </ConfirmButton>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
