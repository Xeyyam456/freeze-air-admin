import { useState } from "react";
import { Plus } from "lucide-react";
import type { SiteEquipment } from "@/types/site";
import { useEquipmentList } from "../../queries/useSiteLists";
import { nextSort } from "../../utils/formText";
import { EquipmentEditor } from "../EquipmentEditor";
import { EquipmentCard } from "./EquipmentCard";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";

// Avadanlıq növləri (saytda /avadanliq və obyekt səhifəsindəki "Tipik avadanlıq")
export function EquipmentTab() {
  const [editing, setEditing] = useState<SiteEquipment | "new" | null>(null);
  const items = useEquipmentList();

  if (!items) return <Card className="muted">Yüklənir...</Card>;

  return (
    <div className="space-y-3">
      {editing && <EquipmentEditor item={editing === "new" ? null : editing} nextSort={nextSort(items)} onClose={() => setEditing(null)} />}
      <div className="flex items-center justify-between gap-3">
        <p className="muted text-sm">Avadanlıq səhifəsi və obyekt səhifələrindəki “Tipik avadanlıq”. Obyektə bağlamaq: Obyektlər → redaktə.</p>
        <Button type="button" onClick={() => setEditing("new")} size="sm"><Plus size={14} /> Yeni avadanlıq</Button>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {items.map((e) => <EquipmentCard key={e.id} item={e} onEdit={() => setEditing(e)} />)}
      </ul>
    </div>
  );
}
