import { Building2, Package, RotateCcw, Store, Trash2, UserRound, Wrench } from "lucide-react";
import { purgeTrash, restoreTrash } from "@/actions/trash";
import { ConfirmButton } from "@/components/ConfirmButton";
import { formatDateAz } from "@/components/DatePicker";
import { Page } from "@/components/Page";
import { timeOf } from "@/components/work/WorkLogModal";
import { createClient } from "@/lib/supabase/client";
import { useData } from "@/lib/useData";

async function fetchTrash() {
  const { data } = await createClient()
    .from("trash")
    .select("id, batch, tbl, row_id, label, data, deleted_at")
    .order("deleted_at", { ascending: false })
    .limit(1000);
  return data ?? [];
}

type Row = Awaited<ReturnType<typeof fetchTrash>>[number];

// Bir silmə əməliyyatında bir neçə sətir ola bilər (şirkət + filialları, alət + təhvilləri): ən "yuxarı" sətir başlıq olur
const PRIORITY = ["companies", "employees", "tools", "stores", "tool_assignments", "material_pieces"];

type Entry = { batch: number; main: Row; counts: Record<string, number> };

function describe(row: Row): { type: string; icon: typeof Building2 } {
  const d = (row.data ?? {}) as Record<string, unknown>;
  switch (row.tbl) {
    case "companies": return d.kind === "market" ? { type: "Market", icon: Store } : { type: "Şirkət", icon: Building2 };
    case "stores": return { type: "Filial / mağaza", icon: Store };
    case "employees": return d.is_management ? { type: "Rəhbər", icon: UserRound } : { type: "Usta", icon: UserRound };
    case "tools": return d.kind === "material" ? { type: "Material", icon: Package } : { type: "Alət", icon: Wrench };
    default: return { type: row.tbl, icon: Trash2 };
  }
}

function extras(e: Entry) {
  const parts: string[] = [];
  if (e.counts.stores && e.main.tbl !== "stores") parts.push(`${e.counts.stores} filial/mağaza`);
  if (e.counts.tool_assignments) parts.push(`${e.counts.tool_assignments} təhvil`);
  if (e.counts.material_pieces) parts.push(`${e.counts.material_pieces} parça`);
  return parts.length ? `+ ${parts.join(", ")}` : null;
}

// Səbət: silinənlər burada qalır, istənilən vaxt geri qaytarmaq (və ya həmişəlik silmək) olar. Yalnız admin görür.
export default function TrashPage() {
  const rows = useData(fetchTrash);

  const entries: Entry[] = [];
  if (rows) {
    const byBatch = new Map<number, Row[]>();
    for (const r of rows) byBatch.set(r.batch, [...(byBatch.get(r.batch) ?? []), r]);
    for (const [batch, list] of byBatch) {
      const main = [...list].sort((a, b) => PRIORITY.indexOf(a.tbl) - PRIORITY.indexOf(b.tbl))[0];
      const counts: Record<string, number> = {};
      for (const r of list) if (r !== main) counts[r.tbl] = (counts[r.tbl] ?? 0) + 1;
      entries.push({ batch, main, counts });
    }
    entries.sort((a, b) => b.main.deleted_at.localeCompare(a.main.deleted_at));
  }

  return (
    <Page title="Səbət" subtitle="Silinənlər burada saxlanır: geri qaytar və ya həmişəlik sil">
      <div className="card !p-0">
        {rows === null ? (
          <p className="muted py-12 text-center text-sm">Yüklənir...</p>
        ) : entries.length === 0 ? (
          <div className="py-14 text-center">
            <span className="icon-tile mx-auto"><Trash2 size={20} /></span>
            <p className="mt-3 font-semibold">Səbət boşdur</p>
            <p className="muted text-sm">Silinən şirkət, mağaza, usta, alət və materiallar burada görünəcək.</p>
          </div>
        ) : (
          <ul>
            {entries.map((e) => {
              const { type, icon: Icon } = describe(e.main);
              const more = extras(e);
              return (
                <li key={e.batch} className="flex items-center gap-4 border-b border-line px-5 py-3.5 last:border-b-0">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><Icon size={18} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2">
                      <span className="truncate font-semibold">{e.main.label}</span>
                      <span className="rounded-full bg-bg px-2 py-0.5 text-[11px] font-bold text-muted">{type}</span>
                    </span>
                    <span className="muted block text-xs">
                      {formatDateAz(e.main.deleted_at.slice(0, 10))}, {timeOf(e.main.deleted_at)}{more && ` · ${more}`}
                    </span>
                  </span>
                  <ConfirmButton onConfirm={() => restoreTrash(e.batch)} success={false} className="btn btn-soft btn-sm"
                    title="Geri qaytar" question={`"${e.main.label}"${more ? ` ${more}` : ""} əvvəlki yerinə qaytarılacaq.`} confirmLabel="Bəli, bərpa et">
                    <RotateCcw size={14} /> Bərpa et
                  </ConfirmButton>
                  <ConfirmButton onConfirm={() => purgeTrash(e.batch)} success={false} className="icon-btn icon-btn-danger"
                    title="Həmişəlik sil" question={`"${e.main.label}" həmişəlik silinəcək, geri qaytarmaq mümkün olmayacaq.`} confirmLabel="Bəli, həmişəlik sil">
                    <Trash2 size={16} />
                  </ConfirmButton>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Page>
  );
}
