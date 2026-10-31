import { useState } from "react";
import { Plus } from "lucide-react";
import type { SiteService } from "@/types/site";
import { useServices } from "../../queries/useSiteLists";
import { nextSort } from "../../utils/formText";
import { ServiceEditor } from "../ServiceEditor";
import { ServiceCard } from "./ServiceCard";

// Xidmətlər: saytdakı siyahı, footer və hər xidmətin öz səhifəsi (/xidmet/<slug>)
export function ServicesTab() {
  const [editing, setEditing] = useState<SiteService | "new" | null>(null);
  const services = useServices();

  if (!services) return <div className="card muted">Yüklənir...</div>;

  return (
    <div className="space-y-4">
      {editing && <ServiceEditor service={editing === "new" ? null : editing} nextSort={nextSort(services)} onClose={() => setEditing(null)} />}
      <div className="flex items-center justify-between gap-3">
        <p className="muted text-sm">
          {services.length} xidmət · saytdakı siyahı, footer və hər xidmətin öz səhifəsi. Karta klik edin: redaktə açılır.
        </p>
        <button type="button" onClick={() => setEditing("new")} className="btn btn-primary btn-sm"><Plus size={14} /> Yeni xidmət</button>
      </div>

      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {services.map((s) => <ServiceCard key={s.id} service={s} onEdit={() => setEditing(s)} />)}
        <li>
          <button type="button" onClick={() => setEditing("new")}
            className="grid h-full min-h-56 w-full place-items-center rounded-2xl border-2 border-dashed border-line text-muted transition-colors hover:border-primary hover:bg-primary-soft hover:text-primary">
            <span className="flex flex-col items-center gap-2 text-sm font-semibold"><Plus size={22} /> Yeni xidmət</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
