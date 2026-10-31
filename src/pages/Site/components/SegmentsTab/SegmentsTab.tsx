import { useState } from "react";
import { Plus } from "lucide-react";
import type { SiteSegment } from "@/types/site";
import { useEquipmentList, useSegments } from "../../queries/useSiteLists";
import { nextSort } from "../../utils/formText";
import { SegmentEditor } from "../SegmentEditor";
import { SegmentCard } from "./SegmentCard";

// Obyekt növləri: Ev və mənzil, Market və mağaza, ... (saytda /xidmetler/<slug>)
export function SegmentsTab() {
  const [editing, setEditing] = useState<SiteSegment | "new" | null>(null);
  const segments = useSegments();
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
        {segments.map((s) => <SegmentCard key={s.id} segment={s} equipmentTitle={equipmentTitle} onEdit={() => setEditing(s)} />)}
      </ul>
    </div>
  );
}
