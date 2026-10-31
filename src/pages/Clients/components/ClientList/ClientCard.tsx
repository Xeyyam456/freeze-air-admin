import { Link } from "react-router";
import { ChevronRight, Phone, User } from "lucide-react";
import { KIND } from "@/lib/kinds";
import type { ClientCardProps } from "@/types/clients";
import { unitLabel } from "../../utils/unitLabel";

export function ClientCard({ client: c, kind }: ClientCardProps) {
  return (
    <Link to={`${KIND[kind].route}/${c.id}`} className="card card-link flex items-center gap-4">
      <span className="icon-tile text-lg font-extrabold">{c.name.charAt(0)}</span>
      <div className="min-w-0 flex-1">
        <h3 className="card-title truncate">{c.name}</h3>
        <p className="muted truncate text-sm">{unitLabel(kind, c.stores[0]?.count ?? 0, c.address)}</p>
        {(c.phone || c.contact_person) && (
          <p className="muted mt-0.5 flex items-center gap-3 text-xs">
            {c.phone && <span className="flex shrink-0 items-center gap-1 whitespace-nowrap"><Phone size={12} />{c.phone}</span>}
            {c.contact_person && <span className="flex min-w-0 items-center gap-1"><User size={12} className="shrink-0" /><span className="truncate">{c.contact_person}</span></span>}
          </p>
        )}
      </div>
      <ChevronRight size={18} className="muted" />
    </Link>
  );
}
