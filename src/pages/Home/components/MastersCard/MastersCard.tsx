import { CalendarDays, Users } from "lucide-react";
import type { MastersCardProps } from "@/types/dashboard";
import { EmptyState } from "../EmptyState";
import { MasterTile } from "./MasterTile";

// Ustalar bu gün: ən çox iş görən yuxarıda; qrupla işləyənlər bir kartdadır
export function MastersCard({ d, onOpenLogs }: MastersCardProps) {
  return (
    <section className="card">
      <div className="flex items-center justify-between gap-3">
        <h2 className="card-title flex items-center gap-2"><CalendarDays size={18} className="text-primary" /> Ustalar bu gün</h2>
        {d && (
          <span className="muted text-xs">
            <b className="text-ok">{d.masters.filter((m) => d.todayCount[m.id]).length}</b> / {d.masters.length} usta iş yazıb
          </span>
        )}
      </div>
      {d && d.masters.length > 0 ? (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 min-[2400px]:grid-cols-3">
          {d.cards.map((c) => <MasterTile key={c.key} card={c} onOpenLogs={onOpenLogs} />)}
        </ul>
      ) : (
        d && <EmptyState icon={Users} title="Aktiv usta yoxdur" text="Ustalar bölməsindən usta əlavə edin." />
      )}
    </section>
  );
}
