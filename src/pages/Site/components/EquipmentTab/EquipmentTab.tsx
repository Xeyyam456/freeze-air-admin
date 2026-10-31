import { useState } from "react";
import { Plus } from "lucide-react";
import type { SiteEquipment } from "@/types/site";
import { useEquipmentList } from "../../queries/useSiteLists";
import { nextSort } from "../../utils/formText";
import { EquipmentEditor } from "../EquipmentEditor";
import { EquipmentCard } from "./EquipmentCard";

// Avadanlıq növləri (saytda /avadanliq və obyekt səhifəsindəki "Tipik avadanlıq")
export function EquipmentTab() {
  const [editing, setEditing] = useState<SiteEquipment | "new" | null>(null);
  const items = useEquipmentList();

  if (!items) return <div className="card muted">Yüklənir...</div>;

  return (
    <div className="space-y-3">
      {editing && <EquipmentEditor item={editing === "new" ? null : editing} nextSort={nextSort(items)} onClose={() => setEditing(null)} />}
      <div className="flex items-center justify-between gap-3">
        <p className="muted text-sm">Avadanlıq səhifəsi və obyekt səhifələrindəki “Tipik avadanlıq”. Obyektə bağlamaq: Obyektlər → redaktə.</p>
        <button type="button" onClick={() => setEditing("new")} className="btn btn-primary btn-sm"><Plus size={14} /> Yeni avadanlıq</button>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {items.map((e) => <EquipmentCard key={e.id} item={e} onEdit={() => setEditing(e)} />)}
      </ul>
    </div>
  );
}
